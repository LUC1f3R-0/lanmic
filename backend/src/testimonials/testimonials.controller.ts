import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { TestimonialsService } from './testimonials.service';

const CMS_ROLES = [UserRole.ADMIN, UserRole.EDITOR];

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get('active')
  findActive() {
    return this.testimonialsService.findActive();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  findAll(@Req() request: AuthenticatedRequest) {
    return this.testimonialsService.findAll(request.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const testimonial = await this.testimonialsService.findOne(
      id,
      request.user.id,
    );
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  create(
    @Body() dto: CreateTestimonialDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.testimonialsService.create(dto, request.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const testimonial = await this.testimonialsService.update(
      id,
      dto,
      request.user.id,
    );
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const deleted = await this.testimonialsService.remove(id, request.user.id);
    if (!deleted) throw new NotFoundException('Testimonial not found');
    return { message: 'Testimonial deleted successfully' };
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const testimonial = await this.testimonialsService.toggleActive(
      id,
      request.user.id,
    );
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }
}
