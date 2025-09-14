import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
      username: { type: 'string', example: 'johndoe' },
      isVerified: { type: 'boolean', example: true },
    },
  })
  user: {
    id: number;
    email: string;
    username: string;
    isVerified: boolean;
  };
}

export class OtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP sent successfully to your email',
  })
  message: string;

  @ApiProperty({
    description: 'OTP expiry time in minutes',
    example: 5,
  })
  expiresInMinutes: number;
}

export class VerifyOtpResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'OTP verified successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the user can proceed to registration',
    example: true,
  })
  canProceed: boolean;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Registration completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
      username: { type: 'string', example: 'johndoe' },
      isVerified: { type: 'boolean', example: true },
    },
  })
  user: {
    id: number;
    email: string;
    username: string;
    isVerified: boolean;
  };
}
