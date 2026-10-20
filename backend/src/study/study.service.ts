import { NotFoundException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, today } from '../common/dates';
import { sm2 } from '../common/sm2';

const NEW_PER_SESSION = 10;

const FUNCTION_POS = ['u', 'y', 'e', 'o', 'p', 'c', 'cc', 'd', 'q', 'mq', 'k', 'h'];
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

/** Nghĩa ngắn gọn dùng làm đáp án trắc nghiệm: nghĩa đầu tiên (kèm nghĩa thứ hai nếu quá ngắn) */
function optionText(m: string | null): string {
  const defs = (m || '').split(/;\s*/).map((x) => x.trim()).filter(Boolean);
  if (!defs.length) return '';
  let t = defs[0];
  if (t.length < 20 && defs[1]) t += '; ' + defs[1];
  return t.length > 70 ? t.slice(0, 67).trimEnd() + '…' : t;
}
export const DAILY_GOAL = 20;

@Injectable()
export class StudyService {
  constructor(private prisma: PrismaService) {}

  async session(userId: number, level: number) {
    const due = await this.prisma.progress.findMany({
      where: { userId, dueDate: { lte: today() }, word: { hskLevel: level } },
      include: { word: { include: { examples: { take: 1, orderBy: { id: 'asc' } } } } },
      orderBy: { dueDate: 'asc' },
      take: 40,
    });
    const fresh = await this.prisma.word.findMany({
      where: { hskLevel: level, meaningVi: { not: null }, progress: { none: { userId } } },
      include: { examples: { take: 1, orderBy: { id: 'asc' } } },
      orderBy: { frequency: 'asc' },
      take: NEW_PER_SESSION,
    });

    // Kho từ cùng cấp để chọn đáp án nhiễu
    const pool = (
      await this.prisma.word.findMany({
        where: { hskLevel: level, meaningVi: { not: null } },
        select: { id: true, hanzi: true, pos: true, meaningVi: true },
      })
    ).map((w) => ({ ...w, text: optionText(w.meaningVi) })).filter((w) => w.text);

    const withOptions = (word: { id: number; hanzi: string; pos: string | null; meaningVi: string | null; meaningEn: string | null }) => {
      const correct = optionText(word.meaningVi) || optionText(word.meaningEn);
      const pos = (word.pos || '').split(',')[0];
      const seen = new Set([correct]);
      const candidates = shuffle(pool.filter((w) => w.id !== word.id && w.hanzi !== word.hanzi)).filter((w) => {
        if (seen.has(w.text)) return false;
        seen.add(w.text);
        return true;
      });
      const samePos = candidates.filter((w) => pos && (w.pos || '').split(',')[0] === pos);
      const rest = candidates.filter((w) => !samePos.includes(w));
      // Từ chức năng (trợ từ, giới từ, phó từ...) có nghĩa mô tả na ná nhau, nên lấy đáp án nhiễu khác loại từ cho công bằng
      const functional = FUNCTION_POS.includes(pos);
      const distractors = (functional ? [...rest, ...samePos] : [...samePos, ...rest]).slice(0, 3).map((w) => ({ text: w.text, correct: false }));
      return shuffle([{ text: correct, correct: true }, ...distractors]);
    };

    return {
      cards: [
        ...due.map(({ word, ...progress }) => ({ word, progress, options: withOptions(word) })),
        ...fresh.map((word) => ({ word, progress: null, options: withOptions(word) })),
      ],
    };
  }

  async review(userId: number, wordId: number, rating: number) {
    const word = await this.prisma.word.findUnique({ where: { id: wordId }, select: { id: true } });
    if (!word) throw new NotFoundException('Không tìm thấy từ này');

    const current = await this.prisma.progress.findUnique({ where: { userId_wordId: { userId, wordId } } });
    const next = sm2(current ?? { easeFactor: 2.5, interval: 0, repetitions: 0 }, rating);
    const progress = await this.prisma.progress.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: { userId, wordId, ...next },
      update: next,
    });

    const t = today();
    await this.prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: t } },
      create: { userId, date: t, reviews: 1 },
      update: { reviews: { increment: 1 } },
    });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    // started: lần học đầu tiên | continued: học liên tiếp | relit: chuỗi đã đứt, thắp lại | same: hôm nay đã học rồi
    let streakStatus: 'same' | 'started' | 'continued' | 'relit' = 'same';
    let streak = user.streak;
    if (user.lastStudy !== t) {
      if (!user.lastStudy) { streakStatus = 'started'; streak = 1; }
      else if (user.lastStudy === addDays(t, -1)) { streakStatus = 'continued'; streak = user.streak + 1; }
      else { streakStatus = 'relit'; streak = 1; }
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { streak, xp: user.xp + 10, lastStudy: t },
    });
    return {
      progress, streak: updated.streak, xp: updated.xp, streakStatus,
      previousStreak: streakStatus === 'relit' ? user.streak : 0,
    };
  }

  async stats(userId: number) {
    const [due, learned, user] = await Promise.all([
      this.prisma.progress.count({ where: { userId, dueDate: { lte: today() } } }),
      this.prisma.progress.count({ where: { userId, repetitions: { gte: 3 } } }),
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    ]);
    const t = today();
    const studiedToday = user.lastStudy === t;
    const alive = studiedToday || user.lastStudy === addDays(t, -1); // chuỗi còn giữ được nếu hôm nay hoặc hôm qua có học
    return {
      due, learned, xp: user.xp,
      streak: alive ? user.streak : 0,
      studiedToday,
      atRisk: !studiedToday && alive && user.streak > 0,   // chưa học hôm nay, chuỗi sắp đứt
      brokenStreak: !alive && user.streak > 0 ? user.streak : 0, // chuỗi đã đứt (số ngày cũ)
    };
  }

  /** Số lượt ôn trong 7 ngày gần nhất và mục tiêu mỗi ngày */
  async activity(userId: number) {
    const t = today();
    const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 6));
    const rows = await this.prisma.dailyActivity.findMany({ where: { userId, date: { in: days } } });
    const map = new Map(rows.map((r) => [r.date, r.reviews]));
    return { goal: DAILY_GOAL, today: map.get(t) ?? 0, days: days.map((date) => ({ date, reviews: map.get(date) ?? 0 })) };
  }
}
