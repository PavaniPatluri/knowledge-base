import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackService } from './slack.service';
import { DatabaseModule } from '../database/database.module';
import { SlackController } from './slack.controller';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [SlackService],
  controllers: [SlackController],
  exports: [SlackService],
})
export class SlackModule {}
