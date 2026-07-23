import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { ImageKitController } from './imagekit.controller';

@Module({
  imports: [AdminModule],
  controllers: [ImageKitController],
})
export class MediaModule {}
