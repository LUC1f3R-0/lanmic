import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { SimpleWebSocketGateway } from '../websocket/simple-websocket.gateway';
import {
  CreateExecutiveLeadershipDto,
  UpdateExecutiveLeadershipDto,
} from './dto/executive-leadership.dto';

@Injectable()
export class ExecutiveService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => SimpleWebSocketGateway))
    private readonly webSocketGateway: SimpleWebSocketGateway,
  ) {}

  findAll(userId: number) {
    return this.databaseService.executiveLeadership.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  findActive() {
    return this.databaseService.executiveLeadership.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.databaseService.executiveLeadership.findFirst({
      where: { id, userId },
    });
  }

  async create(dto: CreateExecutiveLeadershipDto, userId: number) {
    const created = await this.databaseService.executiveLeadership.create({
      data: { ...dto, userId },
    });
    this.webSocketGateway.broadcastExecutiveLeadershipCreated(created);
    return created;
  }

  async update(id: number, dto: UpdateExecutiveLeadershipDto, userId: number) {
    const existing = await this.databaseService.executiveLeadership.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    const updated = await this.databaseService.executiveLeadership.update({
      where: { id },
      data: dto,
    });
    this.webSocketGateway.broadcastExecutiveLeadershipUpdated(updated);
    return updated;
  }

  async remove(id: number, userId: number) {
    const existing = await this.databaseService.executiveLeadership.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    await this.databaseService.executiveLeadership.delete({ where: { id } });
    this.webSocketGateway.broadcastExecutiveLeadershipDeleted(id);
    return true;
  }

  async toggleActive(id: number, userId: number) {
    const existing = await this.databaseService.executiveLeadership.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    const updated = await this.databaseService.executiveLeadership.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    this.webSocketGateway.broadcastExecutiveLeadershipActive(updated);
    return updated;
  }
}
