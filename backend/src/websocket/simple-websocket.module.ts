import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SimpleWebSocketGateway } from './simple-websocket.gateway';

@Module({
  imports: [AuthModule],
  providers: [SimpleWebSocketGateway],
  exports: [SimpleWebSocketGateway],
})
export class SimpleWebSocketModule {}
