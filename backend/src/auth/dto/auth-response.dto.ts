import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'admin@gmail.com' },
      username: { type: 'string', example: 'admin' },
      isActive: { type: 'boolean', example: true },
    },
  })
  user: {
    id: number;
    email: string;
    username: string;
    isActive: boolean;
  };
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Logged out successfully',
  })
  message: string;
}
