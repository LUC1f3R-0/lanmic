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
import { ExecutiveService } from './executive.service';
import { CreateExecutiveLeadershipDto, UpdateExecutiveLeadershipDto } from './dto/executive-leadership.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllExecutiveLeadership(@Request() req) {
    return await this.executiveService.findAll(req.user.id);
  }

  @Get('active')
  async getActiveExecutiveLeadership() {
    return await this.executiveService.findActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getExecutiveLeadership(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const executive = await this.executiveService.findOne(id, req.user.id);
    if (!executive) {
      throw new NotFoundException('Executive leadership not found');
    }
    return executive;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createExecutiveLeadership(
    @Body() createExecutiveLeadershipDto: CreateExecutiveLeadershipDto,
    @Request() req,
  ) {
    try {
      return await this.executiveService.create(createExecutiveLeadershipDto, req.user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateExecutiveLeadership(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExecutiveLeadershipDto: UpdateExecutiveLeadershipDto,
    @Request() req,
  ) {
    try {
      const executive = await this.executiveService.update(
        id,
        updateExecutiveLeadershipDto,
        req.user.id,
      );
      if (!executive) {
        throw new NotFoundException('Executive leadership not found');
      }
      return executive;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteExecutiveLeadership(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const deleted = await this.executiveService.remove(id, req.user.id);
    if (!deleted) {
      throw new NotFoundException('Executive leadership not found');
    }
    return { message: 'Executive leadership deleted successfully' };
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard)
  async toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const executive = await this.executiveService.toggleActive(id, req.user.id);
    if (!executive) {
      throw new NotFoundException('Executive leadership not found');
    }
    return executive;
  }
}
