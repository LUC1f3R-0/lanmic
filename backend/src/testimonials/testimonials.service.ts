import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { SimpleWebSocketGateway } from '../websocket/simple-websocket.gateway';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => SimpleWebSocketGateway))
    private readonly webSocketGateway: SimpleWebSocketGateway,
  ) {}

  findAll(userId: number) {
    return this.databaseService.testimonial.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  findActive() {
    return this.databaseService.testimonial.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  findOne(id: number, userId: number) {
    return this.databaseService.testimonial.findFirst({
      where: { id, userId },
    });
  }

  async create(dto: CreateTestimonialDto, userId: number) {
    const created = await this.databaseService.testimonial.create({
      data: { ...dto, userId },
    });
    this.webSocketGateway.broadcastTestimonialCreated(created);
    return created;
  }

  async update(id: number, dto: UpdateTestimonialDto, userId: number) {
    const existing = await this.databaseService.testimonial.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    const updated = await this.databaseService.testimonial.update({
      where: { id },
      data: dto,
    });
    this.webSocketGateway.broadcastTestimonialUpdated(updated);
    return updated;
  }

  async remove(id: number, userId: number) {
    const existing = await this.databaseService.testimonial.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    await this.databaseService.testimonial.delete({ where: { id } });
    this.webSocketGateway.broadcastTestimonialDeleted(id);
    return true;
  }

  async toggleActive(id: number, userId: number) {
    const existing = await this.databaseService.testimonial.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    const updated = await this.databaseService.testimonial.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
    this.webSocketGateway.broadcastTestimonialActive(updated);
    return updated;
  }
}
