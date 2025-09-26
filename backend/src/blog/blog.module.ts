import { Module, forwardRef } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [BlogController],
  providers: [BlogService, DatabaseService],
  exports: [BlogService],
})
export class BlogModule {}
