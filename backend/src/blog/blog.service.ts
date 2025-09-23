import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private databaseService: DatabaseService) {}

  private get prisma() {
    return this.databaseService.getPrismaClient();
  }

  async findAll(userId: number) {
    return await this.prisma.blogPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished() {
    return await this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        category: true,
        readTime: true,
        authorName: true,
        authorPosition: true,
        authorImage: true,
        blogImage: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number, userId: number) {
    return await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });
  }

  async create(createBlogPostDto: CreateBlogPostDto, userId: number) {
    return await this.prisma.blogPost.create({
      data: {
        ...createBlogPostDto,
        userId,
      },
    });
  }

  async update(
    id: number,
    updateBlogPostDto: UpdateBlogPostDto,
    userId: number,
  ) {
    const existingPost = await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });

    if (!existingPost) {
      return null;
    }

    return await this.prisma.blogPost.update({
      where: { id },
      data: updateBlogPostDto,
    });
  }

  async remove(id: number, userId: number) {
    const existingPost = await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });

    if (!existingPost) {
      return null;
    }

    await this.prisma.blogPost.delete({
      where: { id },
    });

    return true;
  }

  async togglePublish(id: number, userId: number) {
    const existingPost = await this.prisma.blogPost.findFirst({
      where: { id, userId },
    });

    if (!existingPost) {
      return null;
    }

    return await this.prisma.blogPost.update({
      where: { id },
      data: { published: !existingPost.published },
    });
  }
}
