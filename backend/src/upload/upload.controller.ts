import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { existsSync, mkdirSync } from 'fs';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          // Determine destination based on the type query parameter
          const type = req.query?.type || 'file';
          let destination = join(process.cwd(), 'uploads', 'images');

          if (type === 'authorImage') {
            destination = join(process.cwd(), 'uploads', 'author-images');
          } else if (type === 'blogImage') {
            destination = join(process.cwd(), 'uploads', 'blog-images');
          } else if (type === 'teamImage') {
            destination = join(process.cwd(), 'uploads', 'team-images');
          } else if (type === 'executiveImage') {
            destination = join(process.cwd(), 'uploads', 'executive-images');
          }

          // Ensure directory exists
          if (!existsSync(destination)) {
            mkdirSync(destination, { recursive: true });
          }

          callback(null, destination);
        },
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      this.logger.error('No file uploaded');
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`File uploaded: ${file.originalname} -> ${file.filename}`);
    this.logger.log(`File destination: ${file.destination}`);
    this.logger.log(`File size: ${file.size} bytes`);

    // Determine the correct URL path based on the destination
    let urlPath = '/uploads/images';
    if (file.destination.includes('author-images')) {
      urlPath = '/uploads/author-images';
    } else if (file.destination.includes('blog-images')) {
      urlPath = '/uploads/blog-images';
    } else if (file.destination.includes('team-images')) {
      urlPath = '/uploads/team-images';
    } else if (file.destination.includes('executive-images')) {
      urlPath = '/uploads/executive-images';
    }

    const response = {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `${urlPath}/${file.filename}`,
    };

    this.logger.log(`Upload response: ${JSON.stringify(response)}`);
    return response;
  }
}
