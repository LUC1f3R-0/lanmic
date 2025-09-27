import { Module, forwardRef } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [TeamController],
  providers: [TeamService, DatabaseService],
  exports: [TeamService],
})
export class TeamModule {}
