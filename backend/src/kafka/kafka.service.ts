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
      this.logger.warn('Kafka service initialization failed - running without Kafka:', error.message);
      this.isConnected = false;
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
      // Add timeout to prevent hanging
      const connectPromise = Promise.all([
        this.producer.connect(),
        this.consumer.connect()
      ]);
      
      await Promise.race([
        connectPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]);
      
      this.isConnected = true;
      this.logger.log('Connected to Kafka cluster');
    } catch (error) {
      this.logger.warn('Failed to connect to Kafka:', error.message);
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
   * Publish team member created event
   * Called when a new team member is created
   *
   * @param teamMemberId - ID of the created team member
   * @param teamMemberData - Data of the created team member
   */
  async publishTeamMemberCreated(teamMemberId: number, teamMemberData: any) {
    await this.publishTeamMemberEvent('created', teamMemberId, teamMemberData);
  }

  /**
   * Publish team member updated event
   * Called when a team member is updated
   *
   * @param teamMemberId - ID of the updated team member
   * @param teamMemberData - Updated data of the team member
   */
  async publishTeamMemberUpdated(teamMemberId: number, teamMemberData: any) {
    await this.publishTeamMemberEvent('updated', teamMemberId, teamMemberData);
  }

  /**
   * Publish team member deleted event
   * Called when a team member is deleted
   *
   * @param teamMemberId - ID of the deleted team member
   */
  async publishTeamMemberDeleted(teamMemberId: number) {
    await this.publishTeamMemberEvent('deleted', teamMemberId);
  }

  /**
   * Publish team member active event
   * Called when a team member's active status changes
   *
   * @param teamMemberId - ID of the team member
   * @param isActive - New active status
   */
  async publishTeamMemberActive(teamMemberId: number, isActive: boolean) {
    await this.publishTeamMemberEvent('active', teamMemberId, { isActive });
  }

  /**
   * Publish a team member event to Kafka
   * This method sends events to the team-member-events topic
   *
   * @param eventType - Type of event (created, updated, deleted, active)
   * @param teamMemberId - ID of the team member
   * @param data - Additional data related to the event
   */
  async publishTeamMemberEvent(eventType: string, teamMemberId: number, data?: unknown) {
    if (!this.isConnected) {
      this.logger.warn('Kafka not connected, skipping team member event publication');
      return;
    }

    try {
      const eventData: {
        type: string;
        teamMemberId: number;
        data?: unknown;
        timestamp: string;
        source: string;
      } = {
        type: `team-member.${eventType}`,
        teamMemberId,
        data,
        timestamp: new Date().toISOString(),
        source: 'team-service',
      };

      await this.producer.send({
        topic: 'team-member-events',
        messages: [
          {
            key: teamMemberId.toString(),
            value: JSON.stringify(eventData),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(`Published event: team-member.${eventType} for team member ${teamMemberId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event team-member.${eventType}:`, error);
      // Don't throw error to prevent blocking the main operation
    }
  }

  /**
   * Publish executive leadership created event
   * Called when a new executive leadership is created
   *
   * @param executiveLeadershipId - ID of the created executive leadership
   * @param executiveLeadershipData - Data of the created executive leadership
   */
  async publishExecutiveLeadershipCreated(executiveLeadershipId: number, executiveLeadershipData: any) {
    await this.publishExecutiveLeadershipEvent('created', executiveLeadershipId, executiveLeadershipData);
  }

  /**
   * Publish executive leadership updated event
   * Called when an executive leadership is updated
   *
   * @param executiveLeadershipId - ID of the updated executive leadership
   * @param executiveLeadershipData - Updated data of the executive leadership
   */
  async publishExecutiveLeadershipUpdated(executiveLeadershipId: number, executiveLeadershipData: any) {
    await this.publishExecutiveLeadershipEvent('updated', executiveLeadershipId, executiveLeadershipData);
  }

  /**
   * Publish executive leadership deleted event
   * Called when an executive leadership is deleted
   *
   * @param executiveLeadershipId - ID of the deleted executive leadership
   */
  async publishExecutiveLeadershipDeleted(executiveLeadershipId: number) {
    await this.publishExecutiveLeadershipEvent('deleted', executiveLeadershipId);
  }

  /**
   * Publish executive leadership active event
   * Called when an executive leadership's active status changes
   *
   * @param executiveLeadershipId - ID of the executive leadership
   * @param isActive - New active status
   */
  async publishExecutiveLeadershipActive(executiveLeadershipId: number, isActive: boolean) {
    await this.publishExecutiveLeadershipEvent('active', executiveLeadershipId, { isActive });
  }

  /**
   * Publish an executive leadership event to Kafka
   * This method sends events to the executive-leadership-events topic
   *
   * @param eventType - Type of event (created, updated, deleted, active)
   * @param executiveLeadershipId - ID of the executive leadership
   * @param data - Additional data related to the event
   */
  async publishExecutiveLeadershipEvent(eventType: string, executiveLeadershipId: number, data?: unknown) {
    if (!this.isConnected) {
      this.logger.warn('Kafka not connected, skipping executive leadership event publication');
      return;
    }

    try {
      const eventData: {
        type: string;
        executiveLeadershipId: number;
        data?: unknown;
        timestamp: string;
        source: string;
      } = {
        type: `executive-leadership.${eventType}`,
        executiveLeadershipId,
        data,
        timestamp: new Date().toISOString(),
        source: 'executive-service',
      };

      await this.producer.send({
        topic: 'executive-leadership-events',
        messages: [
          {
            key: executiveLeadershipId.toString(),
            value: JSON.stringify(eventData),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(`Published event: executive-leadership.${eventType} for executive leadership ${executiveLeadershipId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event executive-leadership.${eventType}:`, error);
      // Don't throw error to prevent blocking the main operation
    }
  }

  /**
   * Publish testimonial created event
   * Called when a new testimonial is created
   *
   * @param testimonialId - ID of the created testimonial
   * @param testimonialData - Data of the created testimonial
   */
  async publishTestimonialCreated(testimonialId: number, testimonialData: any) {
    await this.publishTestimonialEvent('created', testimonialId, testimonialData);
  }

  /**
   * Publish testimonial updated event
   * Called when a testimonial is updated
   *
   * @param testimonialId - ID of the updated testimonial
   * @param testimonialData - Updated data of the testimonial
   */
  async publishTestimonialUpdated(testimonialId: number, testimonialData: any) {
    await this.publishTestimonialEvent('updated', testimonialId, testimonialData);
  }

  /**
   * Publish testimonial deleted event
   * Called when a testimonial is deleted
   *
   * @param testimonialId - ID of the deleted testimonial
   */
  async publishTestimonialDeleted(testimonialId: number) {
    await this.publishTestimonialEvent('deleted', testimonialId);
  }

  /**
   * Publish testimonial active event
   * Called when a testimonial's active status changes
   *
   * @param testimonialId - ID of the testimonial
   * @param isActive - New active status
   */
  async publishTestimonialActive(testimonialId: number, isActive: boolean) {
    await this.publishTestimonialEvent('active', testimonialId, { isActive });
  }

  /**
   * Publish a testimonial event to Kafka
   * This method sends events to the testimonial-events topic
   *
   * @param eventType - Type of event (created, updated, deleted, active)
   * @param testimonialId - ID of the testimonial
   * @param data - Additional data related to the event
   */
  async publishTestimonialEvent(eventType: string, testimonialId: number, data?: unknown) {
    if (!this.isConnected) {
      this.logger.warn('Kafka not connected, skipping testimonial event publication');
      return;
    }

    try {
      const eventData: {
        type: string;
        testimonialId: number;
        data?: unknown;
        timestamp: string;
        source: string;
      } = {
        type: `testimonial.${eventType}`,
        testimonialId,
        data,
        timestamp: new Date().toISOString(),
        source: 'testimonial-service',
      };

      await this.producer.send({
        topic: 'testimonial-events',
        messages: [
          {
            key: testimonialId.toString(),
            value: JSON.stringify(eventData),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(`Published event: testimonial.${eventType} for testimonial ${testimonialId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event testimonial.${eventType}:`, error);
      // Don't throw error to prevent blocking the main operation
    }
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
