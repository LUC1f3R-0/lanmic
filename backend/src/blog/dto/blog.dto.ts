import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateBlogPostDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  description!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(250_000)
  content!: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readTime?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  authorName!: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  authorPosition?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorImage?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  blogImage?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateBlogPostDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  description?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(250_000)
  content?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readTime?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  authorName?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  authorPosition?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorImage?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  blogImage?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
