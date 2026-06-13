import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TeamsService {
  constructor(private db: DatabaseService) {}

  async getAllTeams() {
    return this.db.team.findMany({
      include: {
        members: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createTeam(name: string) {
    return this.db.team.create({
      data: { name },
      include: {
        members: true,
        documents: true,
      }
    });
  }

  async deleteTeam(id: string) {
    return this.db.team.delete({
      where: { id }
    });
  }

  async addMember(teamId: string, userId: string) {
    return this.db.teamMember.create({
      data: { teamId, userId, role: 'MEMBER' }
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.db.teamMember.delete({
      where: {
        userId_teamId: { userId, teamId }
      }
    });
  }

  // OTP Logic
  private otps = new Map<string, { code: string; name: string; expiresAt: number }>();

  async sendOtp(email: string, name: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    this.otps.set(email, {
      code,
      name,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
    });
    return { code }; // Returning code so controller can log it
  }

  async verifyOtp(teamId: string, email: string, code: string) {
    const record = this.otps.get(email);
    if (!record || record.code !== code || record.expiresAt < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }

    // OTP is valid. Find or create user.
    let user = await this.db.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.db.user.create({
        data: {
          email,
          name: record.name,
          slackId: `manual_${Date.now()}`, // fallback slack id
        }
      });
    }

    // Add to team
    await this.addMember(teamId, user.id);
    
    // Clear OTP
    this.otps.delete(email);

    return user;
  }
}
