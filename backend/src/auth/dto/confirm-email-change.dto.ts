import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class ConfirmEmailChangeDto {
  @ApiProperty({
    description: 'New email address from localStorage',
    example: 'newemail@example.com',
  })
  @IsString({ message: 'New email must be a string' })
  @IsNotEmpty({ message: 'New email is required' })
  newEmail: string;

  @ApiProperty({
    description: 'New password from localStorage',
    example: 'NewPassword123!',
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
