import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, today } from '../common/dates';

// Ẩn bớt tên để không lộ email của người dùng trên bảng xếp hạng công khai
const mask = (name: string) => (name.length <= 2 ? name.slice(0, 1) : name.slice(0, 2)) + '***';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async top() {
    const users = await this.prisma.user.findMany({
      where: { xp: { gt: 0 } },
      orderBy: [{ xp: 'desc' }, { streak: 'desc' }],
      take: 10,
      select: { username: true, xp: true, streak: true, lastStudy: true },
    });
    const t = today();
    const alive = (last: string | null) => last === t || last === addDays(t, -1);
    return { items: users.map((u, i) => ({ rank: i + 1, name: mask(u.username), xp: u.xp, streak: alive(u.lastStudy) ? u.streak : 0 })) };
  }
}

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private lb: LeaderboardService) {}
  @Get() top() { return this.lb.top(); }
}

@Module({ controllers: [LeaderboardController], providers: [LeaderboardService] })
export class LeaderboardModule {}
