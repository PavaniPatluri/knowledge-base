import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [DatabaseModule, AiModule, EventsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
