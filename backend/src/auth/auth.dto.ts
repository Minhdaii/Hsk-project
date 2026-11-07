import { IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CredentialsDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(191) identifier?: string;
  @IsString() @MinLength(6) @MaxLength(72) password: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(32) @Matches(/^[a-zA-Z0-9_.-]+$/) username?: string;
  @IsOptional() @IsString() @MaxLength(191) fullName?: string;
  @IsOptional() @IsString() @MaxLength(191) chineseName?: string;
  @IsOptional() @IsInt() @Min(10) @Max(100) age?: number;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(191) fullName?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(32) @Matches(/^[a-zA-Z0-9_.-]+$/) username?: string;
  @IsOptional() @IsString() @MaxLength(191) chineseName?: string;
  @IsOptional() @IsInt() @Min(10) @Max(100) age?: number | null;
  @IsOptional() @IsInt() @Min(1) @Max(6) targetHskLevel?: number | null;
  @IsOptional() @IsIn(['new', 'pinyin', 'basic', 'intermediate', 'advanced']) learningExperience?: string | null;
  @IsOptional() @IsIn(['exam', 'conversation', 'travel', 'work', 'interest']) studyPurpose?: string | null;
  @IsOptional() @IsInt() @Min(5) @Max(240) dailyStudyMinutes?: number | null;
}

export class ChangePasswordDto {
  @IsString() @MinLength(6) @MaxLength(72) currentPassword: string;
  @IsString() @MinLength(8) @MaxLength(72) newPassword: string;
}
