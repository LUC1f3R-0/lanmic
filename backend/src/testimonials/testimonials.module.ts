import { Module, forwardRef } from '@nestjs/common';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [forwardRef(() => SimpleWebSocketModule)],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
