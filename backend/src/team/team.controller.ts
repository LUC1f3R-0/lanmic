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
  CreateTeamMemberDto,
  UpdateTeamMemberDto,
} from './dto/team-member.dto';
import { TeamService } from './team.service';

const CMS_ROLES = [UserRole.ADMIN, UserRole.EDITOR];

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('active')
  getActiveTeamMembers() {
    return this.teamService.findActive();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  getAllTeamMembers(@Req() request: AuthenticatedRequest) {
    return this.teamService.findAll(request.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async getTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const member = await this.teamService.findOne(id, request.user.id);
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  createTeamMember(
    @Body() dto: CreateTeamMemberDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.teamService.create(dto, request.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async updateTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeamMemberDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const member = await this.teamService.update(id, dto, request.user.id);
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async deleteTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const deleted = await this.teamService.remove(id, request.user.id);
    if (!deleted) throw new NotFoundException('Team member not found');
    return { message: 'Team member deleted successfully' };
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const member = await this.teamService.toggleActive(id, request.user.id);
    if (!member) throw new NotFoundException('Team member not found');
    return member;
  }
}
