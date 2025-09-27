import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { AuthModule } from './auth/auth.module';
import { SimpleBlogModule } from './blog/simple-blog.module';
import { TeamModule } from './team/team.module';
import { UploadModule } from './upload/upload.module';
import { SimpleWebSocketModule } from './websocket/simple-websocket.module';

@Module({
  imports: [AuthModule, SimpleBlogModule, TeamModule, UploadModule, SimpleWebSocketModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
