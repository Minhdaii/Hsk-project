import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialsDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: CredentialsDto) { return this.auth.register(dto.email, dto.password); }

  @Post('login')
  login(@Body() dto: CredentialsDto) { return this.auth.login(dto.email, dto.password); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { id: number } }) { return this.auth.me(req.user.id); }
}
