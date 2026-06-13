import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App } from '@slack/bolt';
import axios from 'axios';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SlackService implements OnModuleInit {
  private readonly logger = new Logger(SlackService.name);
  public readonly app: App;

  constructor(
    private configService: ConfigService,
    private db: DatabaseService,
  ) {
    this.app = new App({
      token: this.configService.get<string>('SLACK_BOT_TOKEN'),
      appToken: this.configService.get<string>('SLACK_APP_TOKEN'),
      socketMode: true,
      deferInitialization: true, // Prevents auth.test on dummy tokens
    });
  }

  async onModuleInit() {
    const token = this.configService.get<string>('SLACK_BOT_TOKEN');
    if (!token || token === 'xoxb-your-token' || token === 'xoxb-dummy-token') {
      this.logger.warn('Skipping Slack App start: SLACK_BOT_TOKEN is missing or dummy');
      return;
    }
    
    try {
      await this.app.start();
      this.logger.log('⚡️ Slack Bolt app is running in Socket Mode!');
      
      this.registerListeners();
    } catch (error) {
      this.logger.error('Failed to start Slack App', error);
    }
  }

  private registerListeners() {
    this.app.command('/ask', async ({ command, ack, respond }) => {
      await ack();
      // Logic handled by another service or event router
      await respond(`Got your question: ${command.text}. I am looking into it!`);
    });

    this.app.event('app_mention', async ({ event, say }) => {
      // Logic handled by AI service
      await say(`Hello <@${event.user}>! I am the Intelligent Knowledge Base.`);
    });
  }

  async handleOAuthCallback(code: string) {
    const clientId = this.configService.get<string>('SLACK_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SLACK_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Slack OAuth credentials not configured');
    }

    try {
      // Exchange code for token
      const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
      });

      const data = response.data;
      if (!data.ok) {
        throw new Error(`Slack OAuth error: ${data.error}`);
      }

      // Upsert User in database
      const user = await this.db.user.upsert({
        where: { slackId: data.authed_user.id },
        update: {
          name: data.authed_user.id, // Fallback, we'd normally call users.info
        },
        create: {
          slackId: data.authed_user.id,
          name: data.authed_user.id,
          role: 'EMPLOYEE',
        },
      });

      return { user, token: data.authed_user.access_token };
    } catch (e) {
      this.logger.error('Failed Slack OAuth', e);
      throw e;
    }
  }
}
