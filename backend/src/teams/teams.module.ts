import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TeamsService],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
