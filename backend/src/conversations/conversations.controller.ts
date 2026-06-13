import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getUserConversations(@Query('userId') userId: string) {
    return this.conversationsService.getUserConversations(userId);
  }

  @Get(':id')
  async getConversationHistory(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ) {
    return this.conversationsService.getConversationHistory(id, userId);
  }
}
