import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { DatabaseService } from '../database.service';

@Module({
  controllers: [BlogController],
  providers: [BlogService, DatabaseService],
  exports: [BlogService],
})
export class BlogModule {}
