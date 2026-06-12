import { Module, forwardRef } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => SimpleWebSocketModule),
  ],
  controllers: [TeamController],
  providers: [TeamService, DatabaseService],
  exports: [TeamService],
})
export class TeamModule {}
