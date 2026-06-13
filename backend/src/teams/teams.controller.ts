import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async getAll() {
    return this.teamsService.getAllTeams();
  }

  @Post()
  async create(@Body() body: { name: string }) {
    return this.teamsService.createTeam(body.name);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.teamsService.addMember(id, body.userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamsService.removeMember(id, userId);
  }

  @Post(':id/otp/send')
  async sendOtp(@Param('id') id: string, @Body() body: { email: string, name: string }) {
    const res = await this.teamsService.sendOtp(body.email, body.name);
    // In a real app we'd send an email here.
    console.log(`\n\n--- SIMULATED EMAIL --- \nTo: ${body.email}\nSubject: Team Verification\nOTP Code: ${res.code}\n-----------------------\n\n`);
    return { success: true, simulatedOtp: res.code };
  }

  @Post(':id/otp/verify')
  async verifyOtp(@Param('id') id: string, @Body() body: { email: string, code: string }) {
    try {
      const user = await this.teamsService.verifyOtp(id, body.email, body.code);
      return { success: true, user };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
