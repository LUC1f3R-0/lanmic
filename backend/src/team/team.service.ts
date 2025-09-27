import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { KafkaService } from '../kafka/kafka.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class TeamService {
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
    return await this.prisma.teamMember.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findActive() {
    return await this.prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.prisma.teamMember.findFirst({
      where: { id, userId },
    });
  }

  async create(createTeamMemberDto: CreateTeamMemberDto, userId: number) {
    // Create the team member in the database
    const newTeamMember = await this.prisma.teamMember.create({
      data: {
        ...createTeamMemberDto,
        userId,
      },
    });

    // Publish team member created event to Kafka for real-time updates
    // This allows other services to react to team member creation
    await this.kafkaService.publishTeamMemberCreated(newTeamMember.id, newTeamMember);

    // Broadcast the team member created event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTeamMemberCreated(newTeamMember);

    return newTeamMember;
  }

  async update(
    id: number,
    updateTeamMemberDto: UpdateTeamMemberDto,
    userId: number,
  ) {
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { id, userId },
    });

    if (!existingMember) {
      return null;
    }

    // Update the team member in the database
    const updatedTeamMember = await this.prisma.teamMember.update({
      where: { id },
      data: updateTeamMemberDto,
    });

    // Publish team member updated event to Kafka for real-time updates
    // This allows other services to react to team member updates
    await this.kafkaService.publishTeamMemberUpdated(
      updatedTeamMember.id,
      updatedTeamMember,
    );

    // Broadcast the team member updated event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTeamMemberUpdated(updatedTeamMember);

    return updatedTeamMember;
  }

  async remove(id: number, userId: number) {
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { id, userId },
    });

    if (!existingMember) {
      return null;
    }

    // Delete the team member from the database
    await this.prisma.teamMember.delete({
      where: { id },
    });

    // Publish team member deleted event to Kafka for real-time updates
    // This allows other services to react to team member deletion
    await this.kafkaService.publishTeamMemberDeleted(id);

    // Broadcast the team member deleted event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTeamMemberDeleted(id);

    return true;
  }

  async toggleActive(id: number, userId: number) {
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { id, userId },
    });

    if (!existingMember) {
      return null;
    }

    // Update the active status in the database
    const updatedTeamMember = await this.prisma.teamMember.update({
      where: { id },
      data: { isActive: !existingMember.isActive },
    });

    // Publish team member active event to Kafka for real-time updates
    // This allows other services to react to active status changes
    await this.kafkaService.publishTeamMemberActive(id, updatedTeamMember.isActive);

    // Broadcast the team member active event to connected WebSocket clients
    // This provides immediate real-time updates to admin users
    this.webSocketGateway.broadcastTeamMemberActive(updatedTeamMember);

    return updatedTeamMember;
  }
}
