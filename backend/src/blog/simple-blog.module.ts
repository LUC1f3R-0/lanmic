import { Module, forwardRef } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { SimpleBlogService } from './simple-blog.service';
import { DatabaseService } from '../database.service';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

/**
 * Simple Blog Module
 * 
 * This module provides blog functionality with real-time updates
 * WITHOUT requiring Kafka or Docker. It uses direct WebSocket broadcasting.
 * 
 * This approach is:
 * - Simpler to set up
 * - No external dependencies
 * - Still provides real-time updates
 * - Perfect for development and small applications
 */
@Module({
  imports: [forwardRef(() => SimpleWebSocketModule)],
  controllers: [BlogController],
  providers: [SimpleBlogService, DatabaseService],
  exports: [SimpleBlogService],
})
export class SimpleBlogModule {}
