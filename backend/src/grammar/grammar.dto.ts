import { Type } from 'class-transformer';
import { Allow, ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { EXERCISE_TYPES, ExerciseType } from './grammar-exercises';

class PairDto { @IsInt() @Min(1) left: number; @IsInt() @Min(1) right: number; }

export class AnswerDto {
  @IsIn(EXERCISE_TYPES) type: ExerciseType;
  @IsOptional() @IsInt() @Min(1) grammarId?: number;
  @IsOptional() @IsInt() @Min(1) exampleId?: number;
  @Allow() answer?: unknown; // chuỗi hoặc mảng chuỗi, được kiểm tra kỹ trong service
  @IsOptional() @IsArray() @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => PairDto) pairs?: PairDto[];
}

export class ProgressDto {
  @IsOptional() @IsBoolean() learned?: boolean;
  @IsOptional() @IsBoolean() favorite?: boolean;
}
