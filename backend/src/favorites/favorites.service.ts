import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: number) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId }, include: { word: true }, orderBy: { createdAt: 'desc' },
    });
    return { items: rows.map((r) => r.word) };
  }

  async ids(userId: number) {
    const rows = await this.prisma.favorite.findMany({ where: { userId }, select: { wordId: true } });
    return { ids: rows.map((r) => r.wordId) };
  }

  async add(userId: number, wordId: number) {
    const word = await this.prisma.word.findUnique({ where: { id: wordId }, select: { id: true } });
    if (!word) throw new NotFoundException('Không tìm thấy từ này');
    await this.prisma.favorite.upsert({
      where: { userId_wordId: { userId, wordId } }, create: { userId, wordId }, update: {},
    });
    return { ok: true };
  }

  async remove(userId: number, wordId: number) {
    await this.prisma.favorite.deleteMany({ where: { userId, wordId } });
    return { ok: true };
  }
}
