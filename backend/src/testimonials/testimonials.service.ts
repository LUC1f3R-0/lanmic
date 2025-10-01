import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { KafkaService } from '../kafka/kafka.service';
import { SimpleWebSocketGateway } from '../websocket/simple-websocket.gateway';

@Injectable()
export class TestimonialsService {
  constructor(
    private databaseService: DatabaseService,
    @Inject(forwardRef(() => KafkaService))
    private kafkaService: KafkaService,
    @Inject(forwardRef(() => SimpleWebSocketGateway))
    private webSocketGateway: SimpleWebSocketGateway,
  ) {}

  private get prisma() {
    return this.databaseService.getPrismaClient();
  }

  async findAll(userId: number) {
    return await this.prisma.testimonial.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findActive() {
    return await this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.prisma.testimonial.findFirst({
      where: { id, userId },
    });
  }

  async create(createTestimonialDto: CreateTestimonialDto, userId: number) {
    // Create the testimonial in the database
    const newTestimonial = await this.prisma.testimonial.create({
      data: {
        ...createTestimonialDto,
        userId,
      },
    });

    // Publish testimonial created event to Kafka for real-time updates
    // This allows other services to react to testimonial creation
    await this.kafkaService.publishTestimonialCreated(newTestimonial.id, newTestimonial);

    // Broadcast the testimonial created event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTestimonialCreated(newTestimonial);

    return newTestimonial;
  }

  async update(
    id: number,
    updateTestimonialDto: UpdateTestimonialDto,
    userId: number,
  ) {
    const existingTestimonial = await this.prisma.testimonial.findFirst({
      where: { id, userId },
    });

    if (!existingTestimonial) {
      return null;
    }

    // Update the testimonial in the database
    const updatedTestimonial = await this.prisma.testimonial.update({
      where: { id },
      data: updateTestimonialDto,
    });

    // Publish testimonial updated event to Kafka for real-time updates
    // This allows other services to react to testimonial updates
    await this.kafkaService.publishTestimonialUpdated(
      updatedTestimonial.id,
      updatedTestimonial,
    );

    // Broadcast the testimonial updated event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTestimonialUpdated(updatedTestimonial);

    return updatedTestimonial;
  }

  async remove(id: number, userId: number) {
    const existingTestimonial = await this.prisma.testimonial.findFirst({
      where: { id, userId },
    });

    if (!existingTestimonial) {
      return null;
    }

    // Delete the testimonial from the database
    await this.prisma.testimonial.delete({
      where: { id },
    });

    // Publish testimonial deleted event to Kafka for real-time updates
    // This allows other services to react to testimonial deletion
    await this.kafkaService.publishTestimonialDeleted(id);

    // Broadcast the testimonial deleted event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTestimonialDeleted(id);

    return true;
  }

  async toggleActive(id: number, userId: number) {
    const existingTestimonial = await this.prisma.testimonial.findFirst({
      where: { id, userId },
    });

    if (!existingTestimonial) {
      return null;
    }

    // Update the active status in the database
    const updatedTestimonial = await this.prisma.testimonial.update({
      where: { id },
      data: { isActive: !existingTestimonial.isActive },
    });

    // Publish testimonial active event to Kafka for real-time updates
    // This allows other services to react to active status changes
    await this.kafkaService.publishTestimonialActive(id, updatedTestimonial.isActive);

    // Broadcast the testimonial active event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTestimonialActive(updatedTestimonial);

    return updatedTestimonial;
  }
}



