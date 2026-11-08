import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @IsNotEmpty({ message: 'Vui lòng chọn danh mục góp ý' })
  @IsIn(['suggestion', 'bug', 'content', 'compliment'], { message: 'Danh mục không hợp lệ' })
  category: 'suggestion' | 'bug' | 'content' | 'compliment';

  @IsNotEmpty({ message: 'Nội dung góp ý không được để trống' })
  @IsString()
  @MinLength(5, { message: 'Nội dung góp ý tối thiểu 5 ký tự' })
  @MaxLength(1500, { message: 'Nội dung góp ý tối đa 1500 ký tự' })
  content: string;

  @IsOptional()
  @IsIn(['yellow', 'pink', 'blue', 'green', 'purple', 'orange'])
  color?: string;

  @IsOptional()
  @IsIn(['red', 'gold', 'blue', 'green', 'tape'])
  pinType?: string;
}

export class UpdateFeedbackStatusDto {
  @IsNotEmpty()
  @IsIn(['pending', 'reviewed', 'resolved'])
  status: 'pending' | 'reviewed' | 'resolved';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;
}
