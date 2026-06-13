import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    return this.usersService.getAllUsers();
  }

  @Get('stats')
  async getStats() {
    return this.usersService.getAdminStats();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { role?: any }) {
    return this.usersService.updateUser(id, body);
  }
}
