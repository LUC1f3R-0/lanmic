import { Module } from '@nestjs/common';
import { SimpleWebSocketGateway } from './simple-websocket.gateway';

/**
 * Simple WebSocket Module
 * 
 * This module provides WebSocket functionality for real-time blog updates
 * WITHOUT requiring Kafka or Docker. It's much simpler to set up and use.
 * 
 * Benefits:
 * - No external dependencies (Kafka, Docker)
 * - Direct WebSocket broadcasting
 * - Easier to understand and maintain
 * - Perfect for development and small applications
 */
@Module({
  providers: [SimpleWebSocketGateway],
  exports: [SimpleWebSocketGateway],
})
export class SimpleWebSocketModule {}
