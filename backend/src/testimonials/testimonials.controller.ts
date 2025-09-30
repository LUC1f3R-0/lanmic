import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  create(@Body() createTestimonialDto: CreateTestimonialDto, @Request() req: any) {
    return this.testimonialsService.create(createTestimonialDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  findAll(@Request() req: any) {
    return this.testimonialsService.findAll(req.user.id);
  }

  @Get('active')
  findActive() {
    return this.testimonialsService.findActive();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.testimonialsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @Request() req: any,
  ) {
    return this.testimonialsService.update(id, updateTestimonialDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.testimonialsService.remove(id, req.user.id);
  }

  @Put(':id/active')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  toggleActive(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.testimonialsService.toggleActive(id, req.user.id);
  }
}
