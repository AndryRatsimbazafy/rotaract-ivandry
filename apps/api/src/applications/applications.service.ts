import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, SortOrder, Types } from 'mongoose';
import { Paginated } from '../common/dto/pagination-query.dto';
import { ApplicantStatus } from '../common/enums/applicant-status.enum';
import { StorageError, StorageService } from '../media/storage.service';
import { cleanFileName, detectCvType } from './cv-file';
import { CV_FIELD, UploadedCv } from './cv-upload.interceptor';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { Application } from './schemas/application.schema';

export const CV_REQUIRED_MESSAGE = 'Le CV est obligatoire.';

// Seule forme de sortie : il n'existe aucune lecture publique. Du CV, ni
// l'identifiant ni aucune adresse de stockage.
export type ApplicationView = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicantStatus: ApplicantStatus;
  cv: { name: string; mimeType: string; size: number };
  createdAt: Date;
};

export type CvFile = { content: Buffer; name: string; mimeType: string };

type ApplicationDocument = Application & { _id: Types.ObjectId };

const SORTS: Record<QueryApplicationsDto['sort'], Record<string, SortOrder>> = {
  createdAt: { createdAt: 1, _id: 1 },
  '-createdAt': { createdAt: -1, _id: 1 },
  lastName: { lastName: 1, _id: 1 },
  '-lastName': { lastName: -1, _id: 1 },
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function toView(application: ApplicationDocument): ApplicationView {
  return {
    id: application._id.toString(),
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    phone: application.phone,
    applicantStatus: application.applicantStatus,
    cv: {
      name: application.cv.name,
      mimeType: application.cv.mimeType,
      size: application.cv.size,
    },
    createdAt: application.createdAt,
  };
}

// Une date sans heure couvre la journée entière en temps universel.
function periodStart(value: string): Date {
  return new Date(value);
}

function periodEnd(value: string): Date {
  return new Date(DATE_ONLY.test(value) ? `${value}T23:59:59.999Z` : value);
}

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<Application>,
    private readonly storage: StorageService,
  ) {}

  // Rien n'est envoyé au stockage avant la fin des vérifications. Rien de la
  // candidature n'est renvoyé ni journalisé.
  async create(
    dto: CreateApplicationDto,
    file: UploadedCv | undefined,
  ): Promise<{ received: true }> {
    if (!file || file.size === 0) {
      throw new BadRequestException({
        message: 'Données invalides.',
        details: [{ field: CV_FIELD, message: CV_REQUIRED_MESSAGE }],
      });
    }
    const name = cleanFileName(file.originalname);
    const mimeType = detectCvType(file.buffer, name);
    if (!mimeType) {
      throw new UnsupportedMediaTypeException();
    }

    const publicId = await this.storage
      .upload(file.buffer)
      .catch((error: unknown) => this.unavailable(error));
    try {
      await this.applicationModel.create({
        ...dto,
        cv: { publicId, name, mimeType, size: file.size },
      });
    } catch (error) {
      // Aucun CV ne reste sans candidature.
      await this.storage.delete(publicId).catch(() => {
        this.logger.error(`Fichier orphelin au stockage : ${publicId}.`);
      });
      throw error;
    }
    return { received: true };
  }

  async findAll(
    query: QueryApplicationsDto,
  ): Promise<Paginated<ApplicationView>> {
    const { page, limit, q, from, to, sort } = query;
    const filter: QueryFilter<Application> = {};
    if (q) {
      filter.$text = { $search: q };
    }
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: periodStart(from) } : {}),
        ...(to ? { $lte: periodEnd(to) } : {}),
      };
    }

    const [applications, total] = await Promise.all([
      this.applicationModel
        .find(filter)
        .sort(SORTS[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.applicationModel.countDocuments(filter).exec(),
    ]);

    return {
      data: applications.map(toView),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<ApplicationView> {
    return toView(await this.findDocument(id));
  }

  async readCv(id: string): Promise<CvFile> {
    const { cv } = await this.findDocument(id);
    const content = await this.storage
      .read(cv.publicId)
      .catch((error: unknown) => this.unavailable(error));
    if (!content) {
      throw new NotFoundException();
    }
    return { content, name: cv.name, mimeType: cv.mimeType };
  }

  // Le fichier d'abord : si le stockage échoue, la candidature est conservée et
  // aucun CV ne reste sans elle.
  async remove(id: string): Promise<void> {
    const application = await this.findDocument(id);
    const deletion = await this.storage
      .delete(application.cv.publicId)
      .catch((error: unknown) => this.unavailable(error));
    if (deletion === 'absent') {
      this.logger.warn(
        `Fichier déjà absent du stockage à la suppression de la candidature ${id}.`,
      );
    }
    await this.applicationModel.deleteOne({ _id: application._id }).exec();
  }

  private async findDocument(id: string): Promise<ApplicationDocument> {
    const application = await this.applicationModel.findById(id).lean().exec();
    if (!application) {
      throw new NotFoundException();
    }
    return application;
  }

  // Une erreur du stockage reste abstraite : 503, sans détail du fournisseur.
  private unavailable(error: unknown): never {
    if (error instanceof StorageError) {
      throw new ServiceUnavailableException();
    }
    throw error;
  }
}
