import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailChangeOtpDto {
  @ApiProperty({
    description: '5-digit OTP code',
    example: '12345',
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(5, 5, { message: 'OTP must be exactly 5 digits' })
  otp: string;
}
