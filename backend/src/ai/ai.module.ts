import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { DatabaseModule } from '../database/database.module';
import { AiController } from './ai.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [AiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
