import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ImageKit } from '@imagekit/nodejs';
import { JwtAuthGuard } from '../admin/jwt.guard';

@Controller('imagekit')
export class ImageKitController {
  private readonly logger = new Logger(ImageKitController.name);
  private readonly imagekit: ImageKit | null;

  constructor() {
    const privateKey = process.env['IMAGEKIT_PRIVATE_KEY'];
    const publicKey = process.env['IMAGEKIT_PUBLIC_KEY'];
    const urlEndpoint = process.env['IMAGEKIT_URL_ENDPOINT'];

    if (!privateKey || !publicKey || !urlEndpoint) {
      this.logger.warn(
        'ImageKit environment variables are missing. The /imagekit/auth endpoint will return a 503.',
      );
      this.imagekit = null;
    } else {
      this.imagekit = new ImageKit({ privateKey });
    }
  }

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  getAuthParams(@Res() res: Response) {
    if (!this.imagekit) {
      this.logger.error(
        'ImageKit is not configured — missing environment variables',
      );
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        message: 'ImageKit is not configured on this server',
      });
    }

    try {
      const params = this.imagekit.helper.getAuthenticationParameters();
      this.logger.log('ImageKit auth parameters generated successfully');
      return res.json(params);
    } catch (err) {
      this.logger.error('Failed to generate ImageKit auth parameters', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate ImageKit auth parameters',
      });
    }
  }
}
