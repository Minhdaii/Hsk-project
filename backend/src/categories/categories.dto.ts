import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min, ValidateNested } from 'class-validator';

const SLUG = /^[a-z0-9\u3400-\u9fff]+(-[a-z0-9\u3400-\u9fff]+)*$/;

export class CreateCategoryDto {
  @IsString() @MaxLength(191) name: string;
  @IsString() @MaxLength(191) @Matches(SLUG, { message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang' }) slug: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsInt() @Min(1) parentId?: number;
  @IsOptional() @IsString() @MaxLength(32) icon?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @MaxLength(191) name?: string;
  @IsOptional() @IsString() @MaxLength(191) @Matches(SLUG) slug?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string | null;
  @IsOptional() @IsInt() @Min(1) parentId?: number | null;
  @IsOptional() @IsString() @MaxLength(32) icon?: string | null;
  @IsOptional() @IsInt() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class ReorderItem { @IsInt() @Min(1) id: number; @IsInt() sortOrder: number; }
export class ReorderDto {
  @IsArray() @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => ReorderItem) items: ReorderItem[];
}
