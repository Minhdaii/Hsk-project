import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const short = (m: string | null) => (m || '').split(';')[0].trim();

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async build(level: number, count: number) {
    const pool = (
      await this.prisma.word.findMany({
        where: { hskLevel: level, meaningVi: { not: null } },
        select: { id: true, hanzi: true, pinyin: true, meaningVi: true, audioUrl: true },
      })
    ).filter((w) => short(w.meaningVi));
    if (pool.length < 4) throw new BadRequestException('Chưa đủ dữ liệu từ vựng ở cấp này');

    const questions = shuffle(pool).slice(0, count).map((w) => {
      const others = shuffle(
        pool.filter((x) => x.id !== w.id && x.hanzi !== w.hanzi && short(x.meaningVi) !== short(w.meaningVi)),
      ).slice(0, 3);
      return { word: w, options: shuffle([w, ...others]) };
    });
    return { questions };
  }
}
