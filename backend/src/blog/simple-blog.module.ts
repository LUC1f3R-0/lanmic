import { Module, forwardRef } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { SimpleBlogService } from './simple-blog.service';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [forwardRef(() => SimpleWebSocketModule)],
  controllers: [BlogController],
  providers: [SimpleBlogService],
  exports: [SimpleBlogService],
})
export class SimpleBlogModule {}
