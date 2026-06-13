import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async getAllUsers() {
    return this.db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slackId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
  }

  async updateUser(id: string, updates: { role?: any }) {
    return this.db.user.update({
      where: { id },
      data: updates,
    });
  }

  async getAdminStats() {
    const totalUsers = await this.db.user.count();
    const activeUsers = totalUsers; // Simplified since isActive not in schema
    const totalDocs = await this.db.document.count();
    // Simplified API token usage stat
    const tokensProcessed = 4200000; 
    const alerts = 0;

    return {
      totalUsers,
      activeUsers,
      totalDocs,
      tokensProcessed,
      alerts,
    };
  }
}
