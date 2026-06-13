import { Inject, Injectable, forwardRef } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';
import { DatabaseService } from '../database.service';
import { SimpleWebSocketGateway } from '../websocket/simple-websocket.gateway';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Injectable()
export class SimpleBlogService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => SimpleWebSocketGateway))
    private readonly webSocketGateway: SimpleWebSocketGateway,
  ) {}

  findAll(userId: number) {
    return this.databaseService.blogPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublished() {
    return this.databaseService.blogPost.findMany({
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

  findOne(id: number, userId: number) {
    return this.databaseService.blogPost.findFirst({ where: { id, userId } });
  }

  async create(dto: CreateBlogPostDto, userId: number) {
    const created = await this.databaseService.blogPost.create({
      data: {
        ...dto,
        title: this.plain(dto.title),
        description: this.plain(dto.description),
        category: this.plain(dto.category),
        authorName: this.plain(dto.authorName),
        authorPosition: dto.authorPosition
          ? this.plain(dto.authorPosition)
          : undefined,
        content: this.richText(dto.content),
        userId,
      },
    });
    this.webSocketGateway.broadcastBlogCreated(created);
    return created;
  }

  async update(id: number, dto: UpdateBlogPostDto, userId: number) {
    const existing = await this.databaseService.blogPost.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const updated = await this.databaseService.blogPost.update({
      where: { id },
      data: {
        ...dto,
        title: dto.title ? this.plain(dto.title) : undefined,
        description: dto.description ? this.plain(dto.description) : undefined,
        category: dto.category ? this.plain(dto.category) : undefined,
        authorName: dto.authorName ? this.plain(dto.authorName) : undefined,
        authorPosition: dto.authorPosition
          ? this.plain(dto.authorPosition)
          : dto.authorPosition,
        content: dto.content ? this.richText(dto.content) : undefined,
      },
    });
    this.webSocketGateway.broadcastBlogUpdated(updated);
    return updated;
  }

  async remove(id: number, userId: number) {
    const existing = await this.databaseService.blogPost.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    await this.databaseService.blogPost.delete({ where: { id } });
    this.webSocketGateway.broadcastBlogDeleted(id);
    return true;
  }

  async togglePublish(id: number, userId: number) {
    const existing = await this.databaseService.blogPost.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const updated = await this.databaseService.blogPost.update({
      where: { id },
      data: { published: !existing.published },
    });
    this.webSocketGateway.broadcastBlogPublished(updated);
    return updated;
  }

  private plain(value: string): string {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  private richText(value: string): string {
    return sanitizeHtml(value, {
      allowedTags: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'blockquote',
        'ul',
        'ol',
        'li',
        'h2',
        'h3',
        'h4',
        'a',
        'code',
        'pre',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          rel: 'noopener noreferrer',
          target: '_blank',
        }),
      },
    });
  }
}
