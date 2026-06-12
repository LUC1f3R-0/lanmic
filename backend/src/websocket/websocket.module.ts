import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';

/**
 * WebSocket Module
 *
 * This module provides WebSocket functionality for real-time blog updates.
 * It exports the WebSocketGateway which handles WebSocket connections and
 * broadcasts real-time blog events to connected admin clients.
 *
 * The WebSocketGateway is responsible for:
 * - Managing WebSocket connections with authentication
 * - Broadcasting blog events to connected admin users
 * - Handling client disconnections and reconnections
 * - Providing real-time updates without page refresh
 */
@Module({
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
