import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ConversationsService {
  constructor(private db: DatabaseService) {}

  async getUserConversations(userId: string) {
    return this.db.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversationHistory(conversationId: string, userId: string) {
    const conversation = await this.db.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation not found`);
    }

    return conversation;
  }
}
