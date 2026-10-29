import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CredentialsDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) @MaxLength(72) password: string;
}
