import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const firstPos = (pos: string | null) => (pos || '').split(',')[0];

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  /** Bài điền từ vào chỗ trống: chọn 1 trong 4 từ để điền vào câu */
  async cloze(level: number, count: number) {
    const examples = await this.prisma.example.findMany({
      where: { word: { hskLevel: level } },
      include: { word: { select: { id: true, hanzi: true, pinyin: true, pos: true } } },
    });
    if (examples.length < 4) throw new BadRequestException('Chưa đủ câu ví dụ ở cấp này');
    const pool = await this.prisma.word.findMany({
      where: { hskLevel: level, meaningVi: { not: null } },
      select: { id: true, hanzi: true, pinyin: true, pos: true },
    });

    const questions = shuffle(examples).slice(0, count).map((ex) => {
      const target = ex.word;
      const candidates = shuffle(
        pool.filter(
          (w) =>
            w.id !== target.id && w.hanzi !== target.hanzi &&
            !ex.hanzi.includes(w.hanzi) && !target.hanzi.includes(w.hanzi) && !w.hanzi.includes(target.hanzi),
        ),
      );
      // Ưu tiên đáp án nhiễu KHÁC loại từ để tránh có hai đáp án cùng đúng ngữ pháp (vd: 最 / 也)
      const diffPos = candidates.filter((w) => !firstPos(target.pos) || firstPos(w.pos) !== firstPos(target.pos));
      const rest = candidates.filter((w) => !diffPos.includes(w));
      const distractors = [...diffPos, ...rest].slice(0, 3);
      return {
        id: ex.id,
        sentence: ex.hanzi.split(target.hanzi).join('____'),
        fullSentence: ex.hanzi,
        pinyin: ex.pinyin,
        meaningVi: ex.meaningVi,
        answer: { hanzi: target.hanzi, pinyin: target.pinyin },
        options: shuffle([target, ...distractors]).map((w) => ({ hanzi: w.hanzi, pinyin: w.pinyin })),
      };
    });
    return { questions };
  }

  /** Bài sắp xếp các từ thành câu hoàn chỉnh (nhìn nghĩa tiếng Việt) */
  async order(level: number, count: number) {
    const examples = await this.prisma.example.findMany({
      where: { tokens: { not: null }, word: { hskLevel: level } },
    });
    const seen = new Set<string>();
    const usable = examples.filter((e) => {
      const n = (e.tokens || '').split(' ').length;
      if (n < 3 || n > 9 || seen.has(e.hanzi)) return false;
      seen.add(e.hanzi);
      return true;
    });
    if (usable.length < 3) throw new BadRequestException('Chưa đủ câu ví dụ ở cấp này');
    return {
      questions: shuffle(usable).slice(0, count).map((e) => ({
        id: e.id,
        meaningVi: e.meaningVi,
        pinyin: e.pinyin,
        tokens: (e.tokens as string).split(' '),
      })),
    };
  }
}
