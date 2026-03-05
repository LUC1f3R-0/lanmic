import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { KafkaService } from '../kafka/kafka.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class BlogService {
  constructor(
    private databaseService: DatabaseService,
    @Inject(forwardRef(() => KafkaService))
    private kafkaService: KafkaService,
    @Inject(forwardRef(() => WebSocketGateway))
    private webSocketGateway: WebSocketGateway,
  ) {}

  private get prisma() {
    return this.databaseService.getPrismaClient();
  }

  async findAll(userId: number) {
    return await this.prisma.blogPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished() {
    return await this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        category: true,
        readTime: true,
        authorName: true,
        authorPosition: true,
        authorImage: true,
        blogImage: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });
  }

  async create(createBlogPostDto: CreateBlogPostDto, userId: number) {
    // Create the blog post in the database
    const newBlogPost = await this.prisma.blogPost.create({
      data: {
        ...createBlogPostDto,
        userId,
      },
    });

    // Publish blog created event to Kafka for real-time updates
    // This allows other services to react to blog creation
    await this.kafkaService.publishBlogCreated(newBlogPost.id, newBlogPost);

    // Broadcast the blog created event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastBlogCreated(newBlogPost);

    return newBlogPost;
  }

  async update(
    id: number,
    updateBlogPostDto: UpdateBlogPostDto,
    userId: number,
  ) {
    const existingPost = await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });

    if (!existingPost) {
      return null;
    }

    // Update the blog post in the database
    const updatedBlogPost = await this.prisma.blogPost.update({
      where: { id },
      data: updateBlogPostDto,
    });

    // Publish blog updated event to Kafka for real-time updates
    // This allows other services to react to blog updates
    await this.kafkaService.publishBlogUpdated(
      updatedBlogPost.id,
      updatedBlogPost,
    );

    // Broadcast the blog updated event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastBlogUpdated(updatedBlogPost);

    return updatedBlogPost;
  }

  async remove(id: number, userId: number) {
    const existingPost = await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });

    if (!existingPost) {
      return null;
    }

    // Delete the blog post from the database
    await this.prisma.blogPost.delete({
      where: { id },
    });

    // Publish blog deleted event to Kafka for real-time updates
    // This allows other services to react to blog deletion
    await this.kafkaService.publishBlogDeleted(id);

    // Broadcast the blog deleted event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastBlogDeleted(id);

    return true;
  }

  async togglePublish(id: number, userId: number) {
    const existingPost = await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });

    if (!existingPost) {
      return null;
    }

    // Update the published status in the database
    const updatedBlogPost = await this.prisma.blogPost.update({
      where: { id },
      data: { published: !existingPost.published },
    });

    // Publish blog published event to Kafka for real-time updates
    // This allows other services to react to publish status changes
    await this.kafkaService.publishBlogPublished(id, updatedBlogPost.published);

    // Broadcast the blog published event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastBlogPublished(updatedBlogPost);

    return updatedBlogPost;
  }
}
