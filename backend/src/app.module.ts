import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [AuthModule, BlogModule, UploadModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
