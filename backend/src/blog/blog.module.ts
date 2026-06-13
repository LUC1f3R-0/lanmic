import { Module, forwardRef } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => SimpleWebSocketModule),
  ],
  controllers: [BlogController],
  providers: [BlogService, DatabaseService],
  exports: [BlogService],
})
export class BlogModule {}
