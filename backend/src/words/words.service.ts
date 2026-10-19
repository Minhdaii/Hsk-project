import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) {}

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
