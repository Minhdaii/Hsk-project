import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private publicUser(u: { id: number; email: string; username: string; streak: number; xp: number }) {
    return { id: u.id, email: u.email, username: u.username, streak: u.streak, xp: u.xp };
  }

  private sign(u: { id: number; email: string }) {
    return this.jwt.sign({ sub: u.id, email: u.email });
  }

  async register(emailRaw: string, password: string) {
    const email = emailRaw.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email này đã được đăng ký');
    }
    const user = await this.prisma.user.create({
      data: { email, username: email.split('@')[0], passwordHash: await bcrypt.hash(password, 10) },
    });
    return { accessToken: this.sign(user), user: this.publicUser(user) };
  }

  async login(emailRaw: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: emailRaw.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return { accessToken: this.sign(user), user: this.publicUser(user) };
  }

  async me(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }
}
