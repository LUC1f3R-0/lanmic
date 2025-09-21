import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  readTime?: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsOptional()
  authorPosition?: string;

  @IsString()
  @IsOptional()
  authorImage?: string;

  @IsString()
  @IsOptional()
  blogImage?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}

export class UpdateBlogPostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  readTime?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsString()
  @IsOptional()
  authorPosition?: string;

  @IsString()
  @IsOptional()
  authorImage?: string;

  @IsString()
  @IsOptional()
  blogImage?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
