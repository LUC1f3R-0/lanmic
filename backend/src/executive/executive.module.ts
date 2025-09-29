import { Module, forwardRef } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [ExecutiveController],
  providers: [ExecutiveService, DatabaseService],
  exports: [ExecutiveService],
})
export class ExecutiveModule {}
