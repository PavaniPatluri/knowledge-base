import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, AiModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
