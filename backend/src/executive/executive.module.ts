import { Module, forwardRef } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [forwardRef(() => SimpleWebSocketModule)],
  controllers: [ExecutiveController],
  providers: [ExecutiveService],
  exports: [ExecutiveService],
})
export class ExecutiveModule {}
