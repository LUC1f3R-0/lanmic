import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team-member.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllTeamMembers(@Request() req) {
    return await this.teamService.findAll(req.user.id);
  }

  @Get('active')
  async getActiveTeamMembers() {
    return await this.teamService.findActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTeamMember(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const member = await this.teamService.findOne(id, req.user.id);
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    return member;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTeamMember(
    @Body() createTeamMemberDto: CreateTeamMemberDto,
    @Request() req,
  ) {
    try {
      return await this.teamService.create(createTeamMemberDto, req.user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @Request() req,
  ) {
    try {
      const member = await this.teamService.update(
        id,
        updateTeamMemberDto,
        req.user.id,
      );
      if (!member) {
        throw new NotFoundException('Team member not found');
      }
      return member;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTeamMember(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const deleted = await this.teamService.remove(id, req.user.id);
    if (!deleted) {
      throw new NotFoundException('Team member not found');
    }
    return { message: 'Team member deleted successfully' };
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const member = await this.teamService.toggleActive(id, req.user.id);
    if (!member) {
      throw new NotFoundException('Team member not found');
    }
    return member;
  }
}
