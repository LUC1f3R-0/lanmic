import { Module, forwardRef } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { DatabaseService } from '../database.service';
import { KafkaModule } from '../kafka/kafka.module';
import { SimpleWebSocketModule } from '../websocket/simple-websocket.module';

@Module({
  imports: [
    forwardRef(() => KafkaModule),
    forwardRef(() => SimpleWebSocketModule),
  ],
  controllers: [TestimonialsController],
  providers: [TestimonialsService, DatabaseService],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}
