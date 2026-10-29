import { IsInt, Max, Min } from 'class-validator';

export class ReviewDto {
  @IsInt() wordId: number;
  @IsInt() @Min(0) @Max(3) rating: number;
}
