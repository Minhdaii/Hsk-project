import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client();

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private publicUser(u: {
    id: number;
    email: string;
    username: string;
    fullName: string | null;
    chineseName: string | null;
    age: number | null;
    targetHskLevel: number | null;
    learningExperience: string | null;
    studyPurpose: string | null;
    dailyStudyMinutes: number | null;
    avatarUrl?: string | null;
    streak: number;
    xp: number;
    role: string;
    createdAt: Date;
  }) {
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      fullName: u.fullName,
      chineseName: u.chineseName,
      age: u.age,
      targetHskLevel: u.targetHskLevel,
      learningExperience: u.learningExperience,
      studyPurpose: u.studyPurpose,
      dailyStudyMinutes: u.dailyStudyMinutes,
      avatarUrl: u.avatarUrl ?? null,
      streak: u.streak,
      xp: u.xp,
      role: u.role,
      createdAt: u.createdAt,
    };
  }

  private sign(u: { id: number; email: string }) {
    return this.jwt.sign({ sub: u.id, email: u.email });
  }

  async register(
    emailRaw: string | undefined,
    password: string,
    usernameRaw?: string,
    fullNameRaw?: string,
    chineseNameRaw?: string,
    age?: number,
  ) {
    if (!emailRaw || !usernameRaw)
      throw new ConflictException('Username và email là bắt buộc');
    const email = emailRaw.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email này đã được đăng ký');
    }
    const username = usernameRaw.trim().toLowerCase();
    if (await this.prisma.user.findFirst({ where: { username } }))
      throw new ConflictException('Username này đã được sử dụng');
    const finalFullName = fullNameRaw?.trim() || username;
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        fullName: finalFullName,
        chineseName: chineseNameRaw?.trim() || null,
        age: age ?? null,
        role: 'user',
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    return { accessToken: this.sign(user), user: this.publicUser(user) };
  }

  async login(identifierRaw: string, password: string) {
    const identifier = identifierRaw.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Tài khoản này được đăng ký bằng Google. Vui lòng chọn Tiếp tục với Google.',
      );
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return { accessToken: this.sign(user), user: this.publicUser(user) };
  }

  async googleAuth(idToken?: string, accessToken?: string) {
    if (!idToken?.trim() && !accessToken?.trim()) {
      throw new UnauthorizedException('Google Token không hợp lệ');
    }

    let payload: any;
    const allowedAudiences = [
      process.env.GOOGLE_WEB_CLIENT_ID?.replace(/^["']|["']$/g, '').trim(),
      process.env.GOOGLE_ANDROID_CLIENT_ID?.replace(/^["']|["']$/g, '').trim(),
    ].filter((id): id is string => Boolean(id && id.trim()));

    if (accessToken?.trim()) {
      try {
        const tokenRes = await fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken.trim())}`,
        );
        if (!tokenRes.ok) {
          throw new Error('Access Token không hợp lệ hoặc đã hết hạn');
        }
        const tokenInfo = await tokenRes.json();

        if (allowedAudiences.length > 0 && tokenInfo.aud && !allowedAudiences.includes(tokenInfo.aud)) {
          throw new UnauthorizedException('Google Client ID không khớp với ứng dụng');
        }

        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken.trim()}` },
        });
        if (!userinfoRes.ok) {
          throw new Error('Không thể lấy thông tin người dùng từ Google');
        }
        payload = await userinfoRes.json();
      } catch (err: any) {
        throw new UnauthorizedException(
          'Google Access Token không hợp lệ: ' + (err?.message || 'Verification failed'),
        );
      }
    } else if (idToken?.trim()) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: idToken.trim(),
          audience: allowedAudiences.length > 0 ? allowedAudiences : undefined,
        });
        payload = ticket.getPayload();
      } catch (err: any) {
        throw new UnauthorizedException(
          'Google ID Token không hợp lệ hoặc đã hết hạn: ' + (err?.message || 'Verification failed'),
        );
      }
    }

    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Thông tin người dùng Google không hợp lệ');
    }

    if (payload.email_verified === false || payload.email_verified === 'false') {
      throw new UnauthorizedException('Tài khoản Google của bạn chưa được xác minh email');
    }

    const googleSub = String(payload.sub);
    const email = String(payload.email).trim().toLowerCase();
    const name = payload.name ? String(payload.name).trim() : null;
    const picture = payload.picture ? String(payload.picture).trim() : null;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra xem Google sub đã được liên kết trong auth_accounts chưa
      const existingAuth = await tx.authAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: 'google',
            providerUserId: googleSub,
          },
        },
        include: { user: true },
      });

      if (existingAuth) {
        let user = existingAuth.user;
        if (!user.avatarUrl && picture) {
          user = await tx.user.update({
            where: { id: user.id },
            data: { avatarUrl: picture },
          });
        }
        return { user, isNew: false };
      }

      // 2. Kiểm tra xem email đã tồn tại trong bảng users chưa
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Tạo liên kết auth_accounts với user này
        await tx.authAccount.create({
          data: {
            userId: existingUser.id,
            provider: 'google',
            providerUserId: googleSub,
            email,
          },
        });
        let user = existingUser;
        if (!user.avatarUrl && picture) {
          user = await tx.user.update({
            where: { id: user.id },
            data: { avatarUrl: picture },
          });
        }
        return { user, isNew: false };
      }

      // 3. User hoàn toàn mới: tạo user và auth_account
      const baseUsername =
        email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '') || 'learner';
      let uniqueUsername = baseUsername.slice(0, 24);
      let count = 0;
      while (await tx.user.findFirst({ where: { username: uniqueUsername } })) {
        count++;
        const suffix = Math.floor(1000 + Math.random() * 9000);
        uniqueUsername = `${baseUsername.slice(0, 18)}_${suffix}`;
        if (count > 10) {
          uniqueUsername = `user_${Date.now()}`;
          break;
        }
      }

      const newUser = await tx.user.create({
        data: {
          email,
          username: uniqueUsername,
          fullName: name || uniqueUsername,
          avatarUrl: picture,
          role: 'user',
          passwordHash: null,
        },
      });

      await tx.authAccount.create({
        data: {
          userId: newUser.id,
          provider: 'google',
          providerUserId: googleSub,
          email,
        },
      });

      return { user: newUser, isNew: true };
    });

    return {
      accessToken: this.sign(result.user),
      user: this.publicUser(result.user),
      isNew: result.isNew,
    };
  }

  async me(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async updateProfile(
    id: number,
    input: {
      fullName?: string;
      username?: string;
      chineseName?: string;
      age?: number | null;
      targetHskLevel?: number | null;
      learningExperience?: string | null;
      studyPurpose?: string | null;
      dailyStudyMinutes?: number | null;
    },
  ) {
    if (input.username) {
      const username = input.username.trim().toLowerCase();
      const existing = await this.prisma.user.findFirst({
        where: { username, NOT: { id } },
      });
      if (existing) throw new ConflictException('Username này đã được sử dụng');
      input.username = username;
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(input.username ? { username: input.username } : {}),
        ...(input.fullName !== undefined ? { fullName: input.fullName.trim() || null } : {}),
        ...(input.chineseName !== undefined ? { chineseName: input.chineseName.trim() || null } : {}),
        ...(input.age !== undefined ? { age: input.age } : {}),
        ...(input.targetHskLevel !== undefined ? { targetHskLevel: input.targetHskLevel } : {}),
        ...(input.learningExperience !== undefined
          ? { learningExperience: input.learningExperience }
          : {}),
        ...(input.studyPurpose !== undefined ? { studyPurpose: input.studyPurpose } : {}),
        ...(input.dailyStudyMinutes !== undefined
          ? { dailyStudyMinutes: input.dailyStudyMinutes }
          : {}),
      },
    });
    return this.publicUser(user);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException();
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Tài khoản đăng ký qua Google chưa có mật khẩu. Vui lòng thiết lập mật khẩu.',
      );
    }
    if (!(await bcrypt.compare(currentPassword, user.passwordHash)))
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    });
    return { ok: true };
  }
}
