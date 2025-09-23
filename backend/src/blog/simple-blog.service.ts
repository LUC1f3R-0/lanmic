import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { SimpleWebSocketGateway } from '../websocket/simple-websocket.gateway';

/**
 * Simple Blog Service with Real-time Updates
 * 
 * This service provides real-time blog updates WITHOUT requiring Kafka.
 * It directly broadcasts events via WebSocket when blog operations occur.
 * 
 * Benefits of this approach:
 * - No Docker or Kafka setup required
 * - Simpler to understand and maintain
 * - Still provides real-time updates
 * - Perfect for development and small applications
 * - Faster setup and deployment
 */
@Injectable()
export class SimpleBlogService {
  constructor(
    private databaseService: DatabaseService,
    @Inject(forwardRef(() => SimpleWebSocketGateway))
    private webSocketGateway: SimpleWebSocketGateway,
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

    // Broadcast the blog created event directly via WebSocket
    // This provides immediate real-time updates to admin users
    // WITHOUT requiring Kafka or Docker!
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

    // Broadcast the blog updated event directly via WebSocket
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

    // Broadcast the blog deleted event directly via WebSocket
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

    // Broadcast the blog published event directly via WebSocket
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastBlogPublished(updatedBlogPost);

    return updatedBlogPost;
  }
}
