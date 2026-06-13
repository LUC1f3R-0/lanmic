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
  CreateExecutiveLeadershipDto,
  UpdateExecutiveLeadershipDto,
} from './dto/executive-leadership.dto';
import { ExecutiveService } from './executive.service';

const CMS_ROLES = [UserRole.ADMIN, UserRole.EDITOR];

@Controller('executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get('active')
  getActiveExecutiveLeadership() {
    return this.executiveService.findActive();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  getAllExecutiveLeadership(@Req() request: AuthenticatedRequest) {
    return this.executiveService.findAll(request.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async getExecutiveLeadership(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const executive = await this.executiveService.findOne(id, request.user.id);
    if (!executive)
      throw new NotFoundException('Executive leadership not found');
    return executive;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  createExecutiveLeadership(
    @Body() dto: CreateExecutiveLeadershipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.executiveService.create(dto, request.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async updateExecutiveLeadership(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExecutiveLeadershipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const executive = await this.executiveService.update(
      id,
      dto,
      request.user.id,
    );
    if (!executive)
      throw new NotFoundException('Executive leadership not found');
    return executive;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async deleteExecutiveLeadership(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const deleted = await this.executiveService.remove(id, request.user.id);
    if (!deleted) throw new NotFoundException('Executive leadership not found');
    return { message: 'Executive leadership deleted successfully' };
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const executive = await this.executiveService.toggleActive(
      id,
      request.user.id,
    );
    if (!executive)
      throw new NotFoundException('Executive leadership not found');
    return executive;
  }
}
