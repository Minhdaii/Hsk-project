import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CredentialsDto, UpdateProfileDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: CredentialsDto) { return this.auth.register(dto.email, dto.password, dto.username, dto.fullName, dto.chineseName, dto.age); }

  @Post('login')
  login(@Body() dto: CredentialsDto) { return this.auth.login(dto.identifier || dto.email || '', dto.password); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { id: number } }) { return this.auth.me(req.user.id); }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: { user: { id: number } }, @Body() dto: UpdateProfileDto) { return this.auth.updateProfile(req.user.id, dto); }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) { return this.auth.changePassword(req.user.id, dto.currentPassword, dto.newPassword); }
}
