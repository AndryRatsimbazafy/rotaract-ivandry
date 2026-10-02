import { Module } from '@nestjs/common';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { StorageService } from './storage.service';

// Les modules métier n'injectent que StorageService.
@Module({
  providers: [{ provide: StorageService, useClass: CloudinaryStorageService }],
  exports: [StorageService],
})
export class MediaModule {}
