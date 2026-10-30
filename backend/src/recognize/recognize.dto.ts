import { IsString, Matches, MaxLength } from 'class-validator';

export class RecognizeDto {
  // Ảnh canvas dạng data URL. Frontend gửi PNG 256x256 (vài KB); giới hạn thấp hơn mức 100kb mặc định của body parser.
  @IsString()
  @Matches(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, { message: 'Ảnh không hợp lệ' })
  @MaxLength(90_000, { message: 'Ảnh quá lớn' })
  image!: string;
}
