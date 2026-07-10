import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: LoginDto): { access_token: string } {
    return this.adminService.login(dto.password);
  }
}
