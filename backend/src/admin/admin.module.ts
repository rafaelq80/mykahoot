import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from './jwt.guard.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'fallback-dev-secret',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AdminModule {}
