import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { today } from '../common/dates';
import { dailyIndex, dayNumber } from '../common/daily';

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

  private dailyCache: { date: string; at: number; word: unknown } | null = null;

  /**
   * Chữ Hán của ngày (theo múi giờ TZ_NAME, mặc định Asia/Ho_Chi_Minh). Mọi người dùng cùng thấy một từ trong cùng một ngày.
   * Chỉ chọn từ HSK 1-6 đã có pinyin và nghĩa tiếng Việt, tối đa 4 chữ Hán để vừa khung hiển thị.
   */
  async daily() {
    const date = today();
    const c = this.dailyCache;
    if (c && c.date === date && Date.now() - c.at < 10 * 60 * 1000) return { date, word: c.word };

    const rows = await this.prisma.word.findMany({
      where: {
        hskLevel: { in: [1, 2, 3, 4, 5, 6] },
        AND: [{ pinyin: { not: null } }, { pinyin: { not: '' } }, { meaningVi: { not: null } }, { meaningVi: { not: '' } }],
      },
      select: { id: true, hanzi: true },
      orderBy: { id: 'asc' }, // thứ tự cố định để kết quả ổn định giữa các lần gọi
    });
    const eligible = rows.filter((r) => Array.from(r.hanzi).length <= 4);
    if (!eligible.length) throw new NotFoundException('Chưa có từ vựng phù hợp');
    const pick = eligible[dailyIndex(dayNumber(date), eligible.length)];
    const word = await this.prisma.word.findUniqueOrThrow({ where: { id: pick.id } });
    this.dailyCache = { date, at: Date.now(), word };
    return { date, word };
  }

  async list(level: number | undefined, q: string | undefined, page: number, limit: number) {
    const where: Prisma.WordWhereInput = { hskLevel: level ? level : { in: [1, 2, 3] } };
    const s = q?.trim();
    if (s) {
      where.OR = [
        { hanzi: { contains: s } },
        { pinyin: { contains: s } },
        { meaningVi: { contains: s } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        orderBy: [{ hskLevel: 'asc' }, { frequency: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.word.count({ where }),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  async levels() {
    const rows = await this.prisma.word.groupBy({
      by: ['hskLevel'],
      where: { hskLevel: { in: [1, 2, 3] } },
      _count: { _all: true },
    });
    const out: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    for (const r of rows) if (r.hskLevel) out[r.hskLevel] = r._count._all;
    return out;
  }

  async get(id: number) {
    const word = await this.prisma.word.findUnique({
      where: { id },
      include: { examples: { take: 5, orderBy: { id: 'asc' } } },
    });
    if (!word) throw new NotFoundException('Không tìm thấy từ này');
    return word;
  }
}
