import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  RegisterEmailDto,
  VerifyOtpDto,
  RegisterDetailsDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  OtpResponseDto,
  VerifyOtpResponseDto,
  RegisterResponseDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP to email for registration',
    description: 'Sends a 6-digit OTP to the provided email address for user registration',
  })
  @ApiBody({ type: RegisterEmailDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: OtpResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists and is verified',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async sendOtp(@Body() registerEmailDto: RegisterEmailDto) {
    return this.authService.sendOtp(registerEmailDto);
  }

  @Post('register/otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP for registration',
    description: 'Verifies the 6-digit OTP sent to the user email',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('register/details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete user registration',
    description: 'Completes user registration by setting username and password',
  })
  @ApiBody({ type: RegisterDetailsDto })
  @ApiResponse({
    status: 200,
    description: 'Registration completed successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or passwords do not match',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or not verified',
  })
  @ApiResponse({
    status: 409,
    description: 'Username already taken',
  })
  async registerDetails(@Body() registerDetailsDto: RegisterDetailsDto) {
    return this.authService.registerDetails(registerDetailsDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user with email and password, returns access and refresh tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or user not verified',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates new access and refresh tokens using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Revokes the refresh token and logs out the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logged out successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async logout(@Request() req: any) {
    // In a real application, you would get the refresh token from the request
    // For now, we'll assume it's passed in the request body or headers
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    return this.authService.logout(refreshToken);
  }
}
