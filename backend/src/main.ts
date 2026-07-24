import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  const enableSwagger =
    configService.get<string>('ENABLE_SWAGGER') === 'true' ||
    configService.get<string>('NODE_ENV') !== 'production';

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('MyKahoot API')
      .setDescription('API REST + WebSocket para quiz multiplayer em tempo real (estilo Kahoot)')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/swagger', app, document);
  }

  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS: use FRONTEND_URL in production, allow localhost in dev
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  let corsOrigin: string | string[];

  if (frontendUrl) {
    corsOrigin = frontendUrl;
  } else if (isProduction) {
    new Logger('Bootstrap').warn(
      'FRONTEND_URL não configurado em produção — CORS restrito a localhost',
    );
    corsOrigin = 'http://localhost:5173';
  } else {
    corsOrigin = 'http://localhost:5173';
  }

  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap();
