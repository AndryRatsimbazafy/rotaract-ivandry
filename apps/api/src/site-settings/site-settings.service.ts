import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FaqQuestion } from '../common/enums/faq-question.enum';
import { SitePhotoSlot } from '../common/enums/site-photo-slot.enum';
import {
  AdminImage,
  MediaRef,
  PublicImage,
  toAdminImage,
  toPublicImage,
} from '../common/schemas/media-ref.schema';
import type {
  ImageFieldsDto,
  UpdateImageFieldsDto,
} from '../common/dto/image-fields.dto';
import {
  discardImage,
  imageFieldsUpdate,
  removeImageFile,
  storeImage,
} from '../media/content-images';
import type { UploadedImage } from '../media/image-upload.interceptor';
import { StorageService } from '../media/storage.service';
import { cleanTranslation } from '../common/dto/translation.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import {
  ClubFacts,
  SITE_SETTINGS_ID,
  SiteSettings,
  SiteSettingsEn,
  SocialLinks,
} from './schemas/site-settings.schema';

type Faq = Partial<Record<FaqQuestion, string>>;

export type AdminSiteSettingsView = {
  social: SocialLinks;
  club: ClubFacts;
  faq: Faq;
  photos: Partial<Record<SitePhotoSlot, AdminImage>>;
  en?: SiteSettingsEn;
  updatedAt: string | null;
};

export type PublicSiteSettingsView = {
  social: SocialLinks;
  club: ClubFacts;
  faq: Faq;
  photos: Partial<Record<SitePhotoSlot, PublicImage>>;
  en?: SiteSettingsEn;
};

// Ne garde que les champs renseignés d'un sous-document lu en base.
function present<T extends object>(value: T | undefined): T {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(
      ([, field]) => field !== undefined && field !== null && field !== '',
    ),
  ) as T;
}

// Traductions anglaises, champs présents seulement (fonctionnalité 014).
function enOf(en: SiteSettingsEn | undefined): { en?: SiteSettingsEn } {
  const clean = cleanTranslation(en);
  return clean ? { en: clean } : {};
}

function mapPhotos<T>(
  photos: Partial<Record<SitePhotoSlot, MediaRef>> | undefined,
  map: (image: MediaRef) => T,
): Partial<Record<SitePhotoSlot, T>> {
  const result: Partial<Record<SitePhotoSlot, T>> = {};
  for (const slot of Object.values(SitePhotoSlot)) {
    const image = photos?.[slot];
    if (image) {
      result[slot] = map(image);
    }
  }
  return result;
}

@Injectable()
export class SiteSettingsService {
  private readonly logger = new Logger(SiteSettingsService.name);

  constructor(
    @InjectModel(SiteSettings.name)
    private readonly settingsModel: Model<SiteSettings>,
    private readonly storage: StorageService,
  ) {}

  private read(): Promise<SiteSettings | null> {
    return this.settingsModel.findById(SITE_SETTINGS_ID).lean().exec();
  }

  // Document absent : l'état vide.
  async findAdmin(): Promise<AdminSiteSettingsView> {
    const settings = await this.read();
    return {
      social: present(settings?.social),
      club: present(settings?.club),
      faq: present(settings?.faq),
      ...enOf(settings?.en),
      photos: mapPhotos(settings?.photos, toAdminImage),
      updatedAt: settings?.updatedAt?.toISOString() ?? null,
    };
  }

  async findPublic(): Promise<PublicSiteSettingsView> {
    const settings = await this.read();
    return {
      social: present(settings?.social),
      club: present(settings?.club),
      faq: present(settings?.faq),
      ...enOf(settings?.en),
      photos: mapPhotos(settings?.photos, toPublicImage),
    };
  }

  // Écriture partielle : un champ présent est écrit, null le retire, un champ
  // absent est inchangé. Le document se crée au premier enregistrement.
  async update(dto: UpdateSiteSettingsDto): Promise<AdminSiteSettingsView> {
    const set: Record<string, string | number> = {};
    const unset: Record<string, ''> = {};
    const groups: [string, object | undefined][] = [
      ['social', dto.social],
      ['club', dto.club],
      ['faq', dto.faq],
      ['en.club', dto.en?.club],
      ['en.faq', dto.en?.faq],
    ];
    for (const [group, values] of groups) {
      for (const [field, value] of Object.entries(values ?? {})) {
        if (value === null) {
          unset[`${group}.${field}`] = '';
        } else if (value !== undefined) {
          set[`${group}.${field}`] = value as string | number;
        }
      }
    }
    if (Object.keys(set).length > 0 || Object.keys(unset).length > 0) {
      await this.settingsModel
        .updateOne(
          { _id: SITE_SETTINGS_ID },
          {
            ...(Object.keys(set).length > 0 ? { $set: set } : {}),
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
          },
          { upsert: true },
        )
        .exec();
    }
    return this.findAdmin();
  }

  // Photographie d'un emplacement : même déroulé que le portrait d'un membre.
  // Dépôt, écriture (le document se crée au besoin), puis retrait de l'ancien
  // fichier.
  async setPhoto(
    slot: SitePhotoSlot,
    file: UploadedImage | undefined,
    dto: ImageFieldsDto,
  ): Promise<AdminSiteSettingsView> {
    const image = await storeImage(this.storage, file, 'pages', dto);
    let previous: SiteSettings | null;
    try {
      previous = await this.settingsModel
        .findOneAndUpdate(
          { _id: SITE_SETTINGS_ID },
          { $set: { [`photos.${slot}`]: image } },
          { upsert: true },
        )
        .lean()
        .exec();
    } catch (error) {
      await discardImage(this.storage, image.publicId, this.logger);
      throw error;
    }
    const replaced = previous?.photos?.[slot];
    if (replaced) {
      await discardImage(this.storage, replaced.publicId, this.logger);
    }
    return this.findAdmin();
  }

  async updatePhoto(
    slot: SitePhotoSlot,
    dto: UpdateImageFieldsDto,
  ): Promise<AdminSiteSettingsView> {
    const path = `photos.${slot}`;
    const filter = { _id: SITE_SETTINGS_ID, [path]: { $exists: true } };
    const update = imageFieldsUpdate(path, dto);
    const found =
      Object.keys(update).length > 0
        ? (await this.settingsModel.updateOne(filter, update).exec())
            .matchedCount > 0
        : (await this.settingsModel.exists(filter).exec()) !== null;
    if (!found) {
      throw new NotFoundException();
    }
    return this.findAdmin();
  }

  // Le fichier part d'abord : stockage indisponible, l'image reste.
  async removePhoto(slot: SitePhotoSlot): Promise<AdminSiteSettingsView> {
    const image = (await this.read())?.photos?.[slot];
    if (!image) {
      throw new NotFoundException();
    }
    await removeImageFile(this.storage, image.publicId, this.logger);
    await this.settingsModel
      .updateOne(
        { _id: SITE_SETTINGS_ID },
        { $unset: { [`photos.${slot}`]: '' } },
      )
      .exec();
    return this.findAdmin();
  }
}
