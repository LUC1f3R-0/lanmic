import { IsIn, IsString } from 'class-validator';

export const UPLOAD_TYPES = [
  'authorImage',
  'blogImage',
  'teamImage',
  'executiveImage',
  'testimonialImage',
] as const;

export type UploadType = (typeof UPLOAD_TYPES)[number];

export class UploadImageQueryDto {
  @IsString()
  @IsIn(UPLOAD_TYPES)
  type!: UploadType;
}
