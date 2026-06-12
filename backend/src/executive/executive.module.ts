import { Module, forwardRef } from '@nestjs/common';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => SimpleWebSocketModule),
  ],
  controllers: [ExecutiveController],
  providers: [ExecutiveService, DatabaseService],
  exports: [ExecutiveService],
})
export class ExecutiveModule {}
