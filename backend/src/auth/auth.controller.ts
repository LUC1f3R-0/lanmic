import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  LogoutResponseDto,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user with email and password, sets secure HTTP-only cookies',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account deactivated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates new access and refresh tokens using a valid refresh token, updates cookies',
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
  async refreshToken(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Get refresh token from HTTP-only cookie
    const refreshToken = (req.cookies as any)?.refresh_token || '';
    const refreshTokenDto: RefreshTokenDto = { refreshToken };
    return this.authService.refreshToken(refreshTokenDto, res);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns current user profile if authenticated',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getProfile(@Req() req: any) {
    return await this.authService.getProfile(req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Revokes the refresh token and clears authentication cookies',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    type: LogoutResponseDto,
  })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    // Get refresh token from HTTP-only cookie
    const refreshToken = (req.cookies as any)?.refresh_token || '';
    return this.authService.logout(refreshToken, res);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends an OTP to the user email for password reset',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully (if email exists)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or account deactivated',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verifies the OTP sent to user email',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
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

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password after OTP verification',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input, passwords do not match, or OTP expired',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('register/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send registration OTP',
    description: 'Sends an OTP to the user email for registration verification',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or email already exists',
  })
  async sendRegistrationOtp(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.sendRegistrationOtp(forgotPasswordDto);
  }

  @Post('register/otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify registration OTP',
    description: 'Verifies the OTP sent to user email during registration',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyRegistrationOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyRegistrationOtp(verifyOtpDto);
  }

  @Post('register/details')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete registration',
    description: 'Completes user registration with username and password',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Registration completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or passwords do not match',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async registerDetails(@Body() registerDetailsDto: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) {
    return this.authService.registerDetails(registerDetailsDto);
  }

  @Post('send-verification-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send email verification',
    description: 'Sends a verification email to the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async sendVerificationEmail(@Req() req: any) {
    return this.authService.sendVerificationEmail((req as any).user);
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with OTP',
    description: 'Verifies user email using OTP sent to their email',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async verifyEmail(@Req() req: any, @Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyEmail((req as any).user, verifyOtpDto);
  }

  @Get('verify-email/:token')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({
    summary: 'Verify email with token',
    description: 'Verifies user email using token from email link, logs user in, and redirects to dashboard',
  })
  @ApiResponse({
    status: 302,
    description: 'Email verified successfully and redirected to dashboard',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyEmailByToken(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    console.log('=== EMAIL VERIFICATION ENDPOINT CALLED ===');
    console.log('Token received:', token);
    console.log('BACKEND_URL:', process.env.BACKEND_URL);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    
    try {
      await this.authService.verifyEmailByToken(token, res);
      
      // Redirect to frontend dashboard
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.log(`Redirecting to: ${frontendUrl}/dashboard`);
      res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      console.error('Email verification error:', error);
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.log(`Redirecting to error page: ${frontendUrl}/admin?error=verification_failed`);
      res.redirect(`${frontendUrl}/admin?error=verification_failed`);
    }
  }

  @Get('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test endpoint',
    description: 'Simple test endpoint to verify server is running',
  })
  async test() {
    return { 
      message: 'Backend server is running!', 
      timestamp: new Date().toISOString(),
      backendUrl: process.env.BACKEND_URL,
      frontendUrl: process.env.FRONTEND_URL
    };
  }

  @Get('debug/user/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Debug user lookup',
    description: 'Debug endpoint to check if user exists in database',
  })
  async debugUserLookup(@Param('email') email: string) {
    return this.authService.debugUserLookup(email);
  }
}
