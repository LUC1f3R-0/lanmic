import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UploadImageQueryDto } from './upload.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({
    burst: { limit: 3, ttl: 60_000 },
    short: { limit: 10, ttl: 10 * 60_000 },
    medium: { limit: 30, ttl: 60 * 60_000 },
  })
  uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query() query: UploadImageQueryDto,
  ) {
    return this.uploadService.saveImage(file, query.type);
  }
}
