import { Controller, Post, Body, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('knowledge-gaps')
  async getKnowledgeGaps() {
    return this.aiService.detectKnowledgeGaps();
  }

  @Get('summary/:documentId')
  async getSummary(@Param('documentId') documentId: string) {
    const summary = await this.aiService.generateSummary(documentId);
    return { summary };
  }

  @Post('ask')
  async askQuestion(@Body() body: { question: string }) {
    const answer = await this.aiService.askQuestion(body.question);
    return { answer };
  }

  @Post('config')
  async updateConfig(@Body() body: { apiKey: string }) {
    this.aiService.updateApiKey(body.apiKey);
    return { success: true };
  }

  @Post('ask-stream')
  async askQuestionStream(@Body() body: { question: string, clientId: string }) {
    // Fire and forget, the response streams via websocket
    this.aiService.askQuestionStream(body.question, body.clientId).catch(e => console.error(e));
    return { status: 'streaming_started' };
  }
}
