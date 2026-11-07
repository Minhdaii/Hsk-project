import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private publicUser(u: { id: number; email: string; username: string; fullName: string | null; chineseName: string | null; age: number | null; targetHskLevel: number | null; learningExperience: string | null; studyPurpose: string | null; dailyStudyMinutes: number | null; streak: number; xp: number; role: string; createdAt: Date }) {
    return { id: u.id, email: u.email, username: u.username, fullName: u.fullName, chineseName: u.chineseName, age: u.age, targetHskLevel: u.targetHskLevel, learningExperience: u.learningExperience, studyPurpose: u.studyPurpose, dailyStudyMinutes: u.dailyStudyMinutes, streak: u.streak, xp: u.xp, role: u.role, createdAt: u.createdAt };
  }

  private sign(u: { id: number; email: string }) {
    return this.jwt.sign({ sub: u.id, email: u.email });
  }

  async register(emailRaw: string | undefined, password: string, usernameRaw?: string, fullNameRaw?: string, chineseNameRaw?: string, age?: number) {
    if (!emailRaw || !usernameRaw || !fullNameRaw?.trim()) throw new ConflictException('Họ tên, username và email là bắt buộc');
    const email = emailRaw.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email này đã được đăng ký');
    }
    const username = usernameRaw.trim().toLowerCase();
    if (await this.prisma.user.findFirst({ where: { username } })) throw new ConflictException('Username này đã được sử dụng');
    const user = await this.prisma.user.create({
      data: { email, username, fullName: fullNameRaw?.trim() || null, chineseName: chineseNameRaw?.trim() || null, age: age ?? null, role: 'user', passwordHash: await bcrypt.hash(password, 12) },
    });
    return { accessToken: this.sign(user), user: this.publicUser(user) };
  }

  async login(identifierRaw: string, password: string) {
    const identifier = identifierRaw.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
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

  async updateProfile(id: number, input: { fullName?: string; username?: string; chineseName?: string; age?: number | null; targetHskLevel?: number | null; learningExperience?: string | null; studyPurpose?: string | null; dailyStudyMinutes?: number | null }) {
    if (input.username) {
      const username = input.username.trim().toLowerCase();
      const existing = await this.prisma.user.findFirst({ where: { username, NOT: { id } } });
      if (existing) throw new ConflictException('Username này đã được sử dụng');
      input.username = username;
    }
    const user = await this.prisma.user.update({ where: { id }, data: {
      ...(input.username ? { username: input.username } : {}),
      ...(input.fullName !== undefined ? { fullName: input.fullName.trim() || null } : {}),
      ...(input.chineseName !== undefined ? { chineseName: input.chineseName.trim() || null } : {}),
      ...(input.age !== undefined ? { age: input.age } : {}),
      ...(input.targetHskLevel !== undefined ? { targetHskLevel: input.targetHskLevel } : {}),
      ...(input.learningExperience !== undefined ? { learningExperience: input.learningExperience } : {}),
      ...(input.studyPurpose !== undefined ? { studyPurpose: input.studyPurpose } : {}),
      ...(input.dailyStudyMinutes !== undefined ? { dailyStudyMinutes: input.dailyStudyMinutes } : {}),
    } });
    return this.publicUser(user);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    await this.prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
    return { ok: true };
  }
}
