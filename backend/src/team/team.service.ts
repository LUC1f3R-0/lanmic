import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { SimpleWebSocketGateway } from '../websocket/simple-websocket.gateway';
import {
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
} from './dto/team-member.dto';

@Injectable()
export class TeamService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => SimpleWebSocketGateway))
    private readonly webSocketGateway: SimpleWebSocketGateway,
  ) {}

  findAll(userId: number) {
    return this.databaseService.teamMember.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  findActive() {
    return this.databaseService.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.databaseService.teamMember.findFirst({ where: { id, userId } });
  }

  async create(dto: CreateTeamMemberDto, userId: number) {
    const created = await this.databaseService.teamMember.create({
      data: { ...dto, userId },
    });
    this.webSocketGateway.broadcastTeamMemberCreated(created);
    return created;
  }

  async update(id: number, dto: UpdateTeamMemberDto, userId: number) {
    const existing = await this.databaseService.teamMember.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    const updated = await this.databaseService.teamMember.update({
      where: { id },
      data: dto,
    });
    this.webSocketGateway.broadcastTeamMemberUpdated(updated);
    return updated;
  }

  async remove(id: number, userId: number) {
    const existing = await this.databaseService.teamMember.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    await this.databaseService.teamMember.delete({ where: { id } });
    this.webSocketGateway.broadcastTeamMemberDeleted(id);
    return true;
  }

  async toggleActive(id: number, userId: number) {
    const existing = await this.databaseService.teamMember.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    const updated = await this.databaseService.teamMember.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    this.webSocketGateway.broadcastTeamMemberActive(updated);
    return updated;
  }
}
