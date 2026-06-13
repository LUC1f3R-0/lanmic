import { Module, forwardRef } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [forwardRef(() => SimpleWebSocketModule)],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
