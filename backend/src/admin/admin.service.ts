import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly jwtService: JwtService) {}

  login(password: string): { access_token: string } {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      this.logger.warn('Tentativa de login com senha inválida');
      throw new UnauthorizedException('Senha incorreta');
    }

    const payload = { role: 'admin' };
    const access_token = this.jwtService.sign(payload);

    this.logger.log('Login de administrador realizado com sucesso');
    return { access_token };
  }
}
