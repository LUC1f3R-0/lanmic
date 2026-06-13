import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fileTypeFromBuffer } from 'file-type';
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { resolve } from 'path';
import sharp from 'sharp';
import type { UploadType } from './upload.dto';

@Injectable()
export class UploadService {
  private readonly folderByType: Record<UploadType, string> = {
    authorImage: 'author-images',
    blogImage: 'blog-images',
    teamImage: 'team-images',
    executiveImage: 'executive-images',
    testimonialImage: 'testimonial-images',
  };

  constructor(private readonly configService: ConfigService) {}

  async saveImage(
    file: Express.Multer.File | undefined,
    type: UploadType,
  ): Promise<{ url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }

    const maxBytes = this.configService.getOrThrow<number>('upload.maxBytes');
    if (file.size > maxBytes) {
      throw new PayloadTooLargeException('Image exceeds the allowed size');
    }

    const detected = await fileTypeFromBuffer(file.buffer);
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!detected || !allowedMimeTypes.has(detected.mime)) {
      throw new BadRequestException(
        'Only JPEG, PNG and WebP images are allowed',
      );
    }

    let safeBuffer: Buffer;
    try {
      safeBuffer = await sharp(file.buffer, {
        failOn: 'error',
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
    } catch {
      throw new BadRequestException('The uploaded image is malformed');
    }

    const folder = this.folderByType[type];
    const uploadRoot = resolve(
      process.cwd(),
      this.configService.getOrThrow<string>('upload.directory'),
    );
    const targetDirectory = resolve(uploadRoot, folder);
    await mkdir(targetDirectory, { recursive: true });

    const filename = `${randomUUID()}.webp`;
    await writeFile(resolve(targetDirectory, filename), safeBuffer, {
      flag: 'wx',
      mode: 0o640,
    });

    return { url: `/uploads/${folder}/${filename}` };
  }
}
