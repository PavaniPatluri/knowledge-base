import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SlackModule } from './slack/slack.module';
import { AiModule } from './ai/ai.module';
import { DocumentsModule } from './documents/documents.module';
import { ConversationsModule } from './conversations/conversations.module';
import { EventsModule } from './events/events.module';
import { SearchModule } from './search/search.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AiModule,
    SlackModule,
    DocumentsModule,
    ConversationsModule,
    EventsModule,
    SearchModule,
    UsersModule,
    TeamsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
