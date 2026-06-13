import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'ok',
      message: 'Knowledge Base API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
