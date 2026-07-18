import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';



@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const admin = await this.adminRepository.findOne({ where: { username } });

    // Mesma mensagem de erro pra usuário inexistente ou senha errada —
    // evita vazar quais usuários existem no banco.
    if (!admin) {
      this.logger.warn(
        `Tentativa de login com usuário inexistente: ${username}`,
      );
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      this.logger.warn(
        `Tentativa de login com senha inválida para: ${username}`,
      );
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }

    const payload = { sub: admin.id, username: admin.username, role: 'admin' };
    const access_token = this.jwtService.sign(payload);

    this.logger.log(
      `Login de administrador realizado com sucesso: ${username}`,
    );
    return { access_token };
  }

  /**
   * Cria um administrador com senha já hasheada. Não é exposto por nenhuma
   * rota pública — use via seed script ou um endpoint protegido por outro
   * admin, se decidirem permitir múltiplos.
   */
  async createAdmin(
    username: string,
    plainPassword: string,
  ): Promise<{ id: string; username: string }> {
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const admin = this.adminRepository.create({ username, passwordHash });
    const saved = await this.adminRepository.save(admin);
    return { id: saved.id, username: saved.username };
  }
}
