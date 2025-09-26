import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

/**
 * Kafka Service for handling real-time blog post events
 *
 * This service manages Kafka producer and consumer for blog post operations.
 * It publishes events when blog posts are created, updated, deleted, or published.
 * It also consumes these events to broadcast real-time updates to connected clients.
 *
 * Events published:
 * - blog.created: When a new blog post is created
 * - blog.updated: When a blog post is updated
 * - blog.deleted: When a blog post is deleted
 * - blog.published: When a blog post is published/unpublished
 */
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConnected = false;

  constructor() {
    // Initialize Kafka client with configuration
    // In production, these should come from environment variables
    this.kafka = new Kafka({
      clientId: 'blog-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    // Create producer for publishing events
    this.producer = this.kafka.producer();

    // Create consumer for listening to events
    this.consumer = this.kafka.consumer({
      groupId: 'blog-service-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  /**
   * Initialize Kafka connections when module starts
   * Connects both producer and consumer to Kafka cluster
   */
  async onModuleInit() {
    try {
      await this.connect();
      await this.setupConsumer();
      this.logger.log('Kafka service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka service:', error);
      // Don't throw error to prevent app startup failure
      // Kafka is optional for development
    }
  }

  /**
   * Clean up Kafka connections when module is destroyed
   * Properly disconnects producer and consumer
   */
  async onModuleDestroy() {
    try {
      await this.disconnect();
      this.logger.log('Kafka service disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka service:', error);
    }
  }

  /**
   * Connect to Kafka cluster
   * Establishes connection for both producer and consumer
   */
  private async connect() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;
      this.logger.log('Connected to Kafka cluster');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from Kafka cluster
   * Properly closes producer and consumer connections
   */
  private async disconnect() {
    try {
      if (this.producer) {
        await this.producer.disconnect();
      }
      if (this.consumer) {
        await this.consumer.disconnect();
      }
      this.isConnected = false;
    } catch (error) {
      this.logger.error('Error disconnecting from Kafka:', error);
    }
  }

  /**
   * Setup consumer to listen for blog events
   * Subscribes to blog events topic and processes messages
   */
  private async setupConsumer() {
    try {
      // Subscribe to blog events topic
      await this.consumer.subscribe({
        topic: 'blog-events',
        fromBeginning: false, // Only process new messages
      });

      // Process messages from the topic
      await this.consumer.run({
        eachMessage: async ({ message }: EachMessagePayload) => {
          try {
            const eventData = JSON.parse(message.value?.toString() || '{}') as {
              type: string;
              blogId: number;
              data?: any;
            };
            this.logger.log(
              `Received event: ${eventData.type} for blog ${eventData.blogId}`,
            );

            // Here we would typically broadcast to WebSocket clients
            // This will be handled by the WebSocket gateway
            await Promise.resolve(this.handleBlogEvent(eventData));
          } catch (error) {
            this.logger.error('Error processing Kafka message:', error);
          }
        },
      });

      this.logger.log('Kafka consumer setup completed');
    } catch (error) {
      this.logger.error('Failed to setup Kafka consumer:', error);
      throw error;
    }
  }

  /**
   * Handle blog events received from Kafka
   * This method processes different types of blog events
   *
   * @param eventData - The event data received from Kafka
   */
  private handleBlogEvent(eventData: {
    type: string;
    blogId: number;
    data?: any;
  }) {
    const { type, blogId } = eventData;

    switch (type) {
      case 'blog.created':
        this.logger.log(`Blog created: ${blogId}`);
        // Emit to WebSocket clients
        break;
      case 'blog.updated':
        this.logger.log(`Blog updated: ${blogId}`);
        // Emit to WebSocket clients
        break;
      case 'blog.deleted':
        this.logger.log(`Blog deleted: ${blogId}`);
        // Emit to WebSocket clients
        break;
      case 'blog.published':
        this.logger.log(`Blog published status changed: ${blogId}`);
        // Emit to WebSocket clients
        break;
      default:
        this.logger.warn(`Unknown event type: ${type}`);
    }
  }

  /**
   * Publish a blog event to Kafka
   * This method sends events to the blog-events topic
   *
   * @param eventType - Type of event (created, updated, deleted, published)
   * @param blogId - ID of the blog post
   * @param data - Additional data related to the event
   */
  async publishBlogEvent(eventType: string, blogId: number, data?: unknown) {
    if (!this.isConnected) {
      this.logger.warn('Kafka not connected, skipping event publication');
      return;
    }

    try {
      const eventData: {
        type: string;
        blogId: number;
        data?: unknown;
        timestamp: string;
        source: string;
      } = {
        type: `blog.${eventType}`,
        blogId,
        data,
        timestamp: new Date().toISOString(),
        source: 'blog-service',
      };

      await this.producer.send({
        topic: 'blog-events',
        messages: [
          {
            key: blogId.toString(),
            value: JSON.stringify(eventData),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(`Published event: blog.${eventType} for blog ${blogId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event blog.${eventType}:`, error);
      // Don't throw error to prevent blocking the main operation
    }
  }

  /**
   * Publish blog created event
   * Called when a new blog post is created
   *
   * @param blogId - ID of the created blog post
   * @param blogData - Data of the created blog post
   */
  async publishBlogCreated(blogId: number, blogData: any) {
    await this.publishBlogEvent('created', blogId, blogData);
  }

  /**
   * Publish blog updated event
   * Called when a blog post is updated
   *
   * @param blogId - ID of the updated blog post
   * @param blogData - Updated data of the blog post
   */
  async publishBlogUpdated(blogId: number, blogData: any) {
    await this.publishBlogEvent('updated', blogId, blogData);
  }

  /**
   * Publish blog deleted event
   * Called when a blog post is deleted
   *
   * @param blogId - ID of the deleted blog post
   */
  async publishBlogDeleted(blogId: number) {
    await this.publishBlogEvent('deleted', blogId);
  }

  /**
   * Publish blog published event
   * Called when a blog post's published status changes
   *
   * @param blogId - ID of the blog post
   * @param published - New published status
   */
  async publishBlogPublished(blogId: number, published: boolean) {
    await this.publishBlogEvent('published', blogId, { published });
  }

  /**
   * Check if Kafka is connected and ready
   *
   * @returns boolean indicating connection status
   */
  isKafkaConnected(): boolean {
    return this.isConnected;
  }
}
