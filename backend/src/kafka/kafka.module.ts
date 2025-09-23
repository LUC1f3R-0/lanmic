import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaConsumerService } from './kafka-consumer.service';

/**
 * Kafka Module
 *
 * This module provides Kafka functionality for real-time blog post updates.
 * It exports the KafkaService and KafkaConsumerService which handle publishing
 * and consuming blog events.
 *
 * The KafkaService is responsible for:
 * - Publishing events when blog posts are created, updated, deleted, or published
 * - Managing Kafka producer connections
 *
 * The KafkaConsumerService is responsible for:
 * - Consuming events from the blog-events topic
 * - Broadcasting events to WebSocket clients
 * - Managing Kafka consumer connections
 */
@Module({
  providers: [KafkaService, KafkaConsumerService],
  exports: [KafkaService, KafkaConsumerService],
})
export class KafkaModule {}
