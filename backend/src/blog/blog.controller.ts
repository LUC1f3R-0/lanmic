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
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllBlogPosts(@Request() req) {
    return await this.blogService.findAll(req.user.id);
  }

  @Get('published')
  async getPublishedBlogPosts() {
    return await this.blogService.findPublished();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getBlogPost(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const post = await this.blogService.findOne(id, req.user.id);
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlogPost(
    @Body() createBlogPostDto: CreateBlogPostDto,
    @Request() req,
  ) {
    try {
      return await this.blogService.create(createBlogPostDto, req.user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlogPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
    @Request() req,
  ) {
    try {
      const post = await this.blogService.update(
        id,
        updateBlogPostDto,
        req.user.id,
      );
      if (!post) {
        throw new NotFoundException('Blog post not found');
      }
      return post;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlogPost(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const deleted = await this.blogService.remove(id, req.user.id);
    if (!deleted) {
      throw new NotFoundException('Blog post not found');
    }
    return { message: 'Blog post deleted successfully' };
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard)
  async togglePublish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const post = await this.blogService.togglePublish(id, req.user.id);
    if (!post) {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }
}
