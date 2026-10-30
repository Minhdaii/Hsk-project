import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RecognizeDto } from './recognize.dto';
import { RecognizeService } from './recognize.service';

@Controller('recognize')
export class RecognizeController {
  constructor(private recognize: RecognizeService) {}

  /** Nhận ảnh một chữ viết tay, trả các ứng viên do Groq nhận diện. Lỗi thì frontend tự dùng bộ nhận diện trên trình duyệt. */
  @Post()
  @HttpCode(200)
  run(@Body() dto: RecognizeDto, @Req() req: Request) {
    return this.recognize.recognize(dto.image, req.ip ?? 'unknown');
  }
}
