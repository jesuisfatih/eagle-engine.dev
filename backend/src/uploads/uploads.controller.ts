import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';

@Controller('uploads')
@Public()
export class UploadsController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    return {
      url: `/uploads/${file?.filename || 'unknown'}`,
      filename: file?.filename,
      size: file?.size,
    };
  }
}

