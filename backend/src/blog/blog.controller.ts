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
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { RolesGuard } from '../common/guards/roles.guard';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { SimpleBlogService } from './simple-blog.service';

const CMS_ROLES = [UserRole.ADMIN, UserRole.EDITOR];

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: SimpleBlogService) {}

  @Get('published')
  getPublishedBlogPosts() {
    return this.blogService.findPublished();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  getAllBlogPosts(@Req() request: AuthenticatedRequest) {
    return this.blogService.findAll(request.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async getBlogPost(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const post = await this.blogService.findOne(id, request.user.id);
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  createBlogPost(
    @Body() dto: CreateBlogPostDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.blogService.create(dto, request.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async updateBlogPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const post = await this.blogService.update(id, dto, request.user.id);
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async deleteBlogPost(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const deleted = await this.blogService.remove(id, request.user.id);
    if (!deleted) throw new NotFoundException('Blog post not found');
    return { message: 'Blog post deleted successfully' };
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)
  @Roles(...CMS_ROLES)
  async togglePublish(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const post = await this.blogService.togglePublish(id, request.user.id);
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }
}
