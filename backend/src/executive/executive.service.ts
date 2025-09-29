import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateExecutiveLeadershipDto, UpdateExecutiveLeadershipDto } from './dto/executive-leadership.dto';
import { KafkaService } from '../kafka/kafka.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ExecutiveService {
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
    return await this.prisma.executiveLeadership.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findActive() {
    return await this.prisma.executiveLeadership.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.prisma.executiveLeadership.findFirst({
      where: { id, userId },
    });
  }

  async create(createExecutiveLeadershipDto: CreateExecutiveLeadershipDto, userId: number) {
    // Create the executive leadership in the database
    const newExecutiveLeadership = await this.prisma.executiveLeadership.create({
      data: {
        ...createExecutiveLeadershipDto,
        userId,
      },
    });

    // Publish executive leadership created event to Kafka for real-time updates
    // This allows other services to react to executive leadership creation
    await this.kafkaService.publishExecutiveLeadershipCreated(newExecutiveLeadership.id, newExecutiveLeadership);

    // Broadcast the executive leadership created event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastExecutiveLeadershipCreated(newExecutiveLeadership);

    return newExecutiveLeadership;
  }

  async update(
    id: number,
    updateExecutiveLeadershipDto: UpdateExecutiveLeadershipDto,
    userId: number,
  ) {
    const existingExecutive = await this.prisma.executiveLeadership.findFirst({
      where: { id, userId },
    });

    if (!existingExecutive) {
      return null;
    }

    // Update the executive leadership in the database
    const updatedExecutiveLeadership = await this.prisma.executiveLeadership.update({
      where: { id },
      data: updateExecutiveLeadershipDto,
    });

    // Publish executive leadership updated event to Kafka for real-time updates
    // This allows other services to react to executive leadership updates
    await this.kafkaService.publishExecutiveLeadershipUpdated(
      updatedExecutiveLeadership.id,
      updatedExecutiveLeadership,
    );

    // Broadcast the executive leadership updated event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastExecutiveLeadershipUpdated(updatedExecutiveLeadership);

    return updatedExecutiveLeadership;
  }

  async remove(id: number, userId: number) {
    const existingExecutive = await this.prisma.executiveLeadership.findFirst({
      where: { id, userId },
    });

    if (!existingExecutive) {
      return null;
    }

    // Delete the executive leadership from the database
    await this.prisma.executiveLeadership.delete({
      where: { id },
    });

    // Publish executive leadership deleted event to Kafka for real-time updates
    // This allows other services to react to executive leadership deletion
    await this.kafkaService.publishExecutiveLeadershipDeleted(id);

    // Broadcast the executive leadership deleted event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastExecutiveLeadershipDeleted(id);

    return true;
  }

  async toggleActive(id: number, userId: number) {
    const existingExecutive = await this.prisma.executiveLeadership.findFirst({
      where: { id, userId },
    });

    if (!existingExecutive) {
      return null;
    }

    // Update the active status in the database
    const updatedExecutiveLeadership = await this.prisma.executiveLeadership.update({
      where: { id },
      data: { isActive: !existingExecutive.isActive },
    });

    // Publish executive leadership active event to Kafka for real-time updates
    // This allows other services to react to active status changes
    await this.kafkaService.publishExecutiveLeadershipActive(id, updatedExecutiveLeadership.isActive);

    // Broadcast the executive leadership active event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastExecutiveLeadershipActive(updatedExecutiveLeadership);

    return updatedExecutiveLeadership;
  }
}
