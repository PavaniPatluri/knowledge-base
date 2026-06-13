import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlackService } from './slack.service';
import type { Response } from 'express';

@Controller('slack')
export class SlackController {
  constructor(
    private readonly slackService: SlackService,
    private configService: ConfigService,
  ) {}

  @Get('auth')
  auth(@Res() res: Response) {
    const clientId = this.configService.get<string>('SLACK_CLIENT_ID');
    // Using simple redirect. In production, pass state/nonce.
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,commands,app_mentions:read&user_scope=identity.basic`;
    res.redirect(slackAuthUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('No code provided');
    }
    
    try {
      const { user, token } = await this.slackService.handleOAuthCallback(code);
      // In production, we'd issue a JWT here and set it in an HttpOnly cookie
      // For this enterprise iteration, redirecting back to dashboard with success query
      res.redirect('http://localhost:5173/?auth=success');
    } catch (e) {
      res.redirect('http://localhost:5173/?auth=error');
    }
  }
}
