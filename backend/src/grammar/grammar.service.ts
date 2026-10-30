import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerDto } from './grammar.dto';
import { EXERCISE_TYPES, ExerciseType, GE, GP, buildQuestions, gradeAnswer } from './grammar-exercises';

const PUBLISHED = { isPublished: true } as const;
const ORDER: Prisma.GrammarPointOrderByWithRelationInput[] = [{ level: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }];

@Injectable()
export class GrammarService {
  constructor(private prisma: PrismaService) {}

  /** API cũ, giữ nguyên hình dạng dữ liệu: chỉ trả ví dụ đúng và chỉ cấu trúc đã xuất bản */
  list(level?: number) {
    return this.prisma.grammarPoint.findMany({
      where: { ...PUBLISHED, ...(level !== undefined ? { level } : {}) },
      orderBy: ORDER,
      include: { examples: { where: { isCorrect: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
    });
  }

  /** Danh sách có tìm kiếm, lọc và phân trang (không kèm ví dụ để nhẹ) */
  async find(q: { q?: string; level?: number; category?: string; page: number; limit: number }, userId?: number) {
    const text = q.q?.trim();
    const where: Prisma.GrammarPointWhereInput = {
      ...PUBLISHED,
      ...(q.level !== undefined ? { level: q.level } : {}),
      ...(q.category ? { category: q.category } : {}),
      ...(text ? { OR: [{ title: { contains: text } }, { titleZh: { contains: text } }, { pattern: { contains: text } }, { explanation: { contains: text } }] } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.grammarPoint.count({ where }),
      this.prisma.grammarPoint.findMany({
        where, orderBy: ORDER, skip: (q.page - 1) * q.limit, take: q.limit,
        select: { id: true, slug: true, level: true, title: true, titleZh: true, category: true, pattern: true, explanation: true, source: true, verified: true, _count: { select: { examples: { where: { isCorrect: true } } } } },
      }),
    ]);
    const prog = userId ? await this.prisma.grammarProgress.findMany({ where: { userId, grammarId: { in: rows.map((r) => r.id) } } }) : [];
    const pm = new Map(prog.map((p) => [p.grammarId, p]));
    return {
      items: rows.map(({ _count, ...r }) => ({ ...r, exampleCount: _count.examples, learned: pm.get(r.id)?.learned ?? false, favorite: pm.get(r.id)?.favorite ?? false })),
      total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)),
    };
  }

  async categories() {
    const g = await this.prisma.grammarPoint.groupBy({ by: ['category'], where: { ...PUBLISHED, category: { not: null } }, _count: { _all: true } });
    return { items: g.map((x) => ({ category: x.category as string, count: x._count._all })).sort((a, b) => a.category.localeCompare(b.category, 'vi')) };
  }

  /** Chi tiết theo slug (hoặc id số để tương thích), kèm ví dụ, lỗi sai, từ vựng, cấu trúc liên quan và bài trước/sau */
  async detail(key: string, userId?: number) {
    const where: Prisma.GrammarPointWhereInput = /^\d+$/.test(key) ? { id: Number(key), ...PUBLISHED } : { slug: key, ...PUBLISHED };
    const p = await this.prisma.grammarPoint.findFirst({
      where,
      include: {
        examples: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
        words: { include: { word: { select: { id: true, hanzi: true, pinyin: true, meaningVi: true, hskLevel: true } } } },
        related: { include: { to: { select: { id: true, slug: true, title: true, titleZh: true, level: true, isPublished: true } } } },
      },
    });
    if (!p) throw new NotFoundException('Không tìm thấy cấu trúc ngữ pháp');
    const ordered = await this.prisma.grammarPoint.findMany({ where: PUBLISHED, orderBy: ORDER, select: { id: true, slug: true, title: true, level: true } });
    const i = ordered.findIndex((x) => x.id === p.id);
    const progress = userId ? await this.prisma.grammarProgress.findUnique({ where: { userId_grammarId: { userId, grammarId: p.id } } }) : null;
    const { examples, words: gw, related, ...rest } = p;
    return {
      ...rest,
      examples: examples.filter((e) => e.isCorrect),
      mistakes: examples.filter((e) => !e.isCorrect),
      words: gw.map((x) => x.word),
      related: related.map((r) => r.to).filter((t) => t.isPublished).map(({ isPublished: _ip, ...t }) => t),
      prev: i > 0 ? ordered[i - 1] : null,
      next: i >= 0 && i + 1 < ordered.length ? ordered[i + 1] : null,
      progress: { learned: progress?.learned ?? false, favorite: progress?.favorite ?? false, attempts: progress?.attempts ?? 0, correct: progress?.correct ?? 0 },
    };
  }

  async examples(key: string) {
    const d = await this.detail(key);
    return { examples: d.examples, mistakes: d.mistakes };
  }

  // ---------------- Luyện tập ----------------
  private toGP(p: { id: number; level: number; title: string; pattern: string; explanation: string; keywords: string | null; examples: GE[] }): GP {
    return { id: p.id, level: p.level, title: p.title, pattern: p.pattern, explanation: p.explanation, keywords: (p.keywords ?? '').split(/\s+/).filter(Boolean), examples: p.examples };
  }

  async exercises(q: { type: ExerciseType; level?: number; grammarId?: number; count: number }) {
    const rows = await this.prisma.grammarPoint.findMany({
      where: { ...PUBLISHED, ...(q.level !== undefined ? { level: q.level } : {}) },
      orderBy: ORDER, take: 200,
      select: { id: true, level: true, title: true, pattern: true, explanation: true, keywords: true, examples: { orderBy: { id: 'asc' } } },
    });
    const points = rows.map((r) => this.toGP(r as never));
    let subject = points;
    let pool = points;
    if (q.grammarId) {
      const one = points.find((p) => p.id === q.grammarId);
      if (!one) throw new NotFoundException('Không tìm thấy cấu trúc ngữ pháp');
      subject = [one];
      pool = points.filter((p) => p.level === one.level); // đáp án gây nhiễu lấy từ các cấu trúc cùng cấp
    }
    return { type: q.type, available: EXERCISE_TYPES, questions: buildQuestions(q.type, subject, q.count, Math.random, pool) };
  }

  /** Chấm điểm phía server theo dữ liệu thật. Có đăng nhập thì ghi nhận lượt làm và cập nhật tiến độ */
  async answer(dto: AnswerDto, userId?: number) {
    if (dto.type === 'match') {
      const pairs = dto.pairs ?? [];
      if (!pairs.length) throw new BadRequestException('Thiếu cặp ghép');
      const results = pairs.map((p) => ({ left: p.left, right: p.right, correct: p.left === p.right }));
      if (userId) for (const r of results) await this.record(userId, r.left, 'match', r.correct);
      return { correct: results.every((r) => r.correct), results };
    }
    if (!dto.exampleId) throw new BadRequestException('Thiếu exampleId');
    const ex = await this.prisma.grammarExample.findUnique({ where: { id: dto.exampleId } });
    if (!ex) throw new NotFoundException('Không tìm thấy câu ví dụ');
    const p = await this.prisma.grammarPoint.findFirst({ where: { id: ex.grammarId, ...PUBLISHED }, select: { id: true, level: true, title: true, pattern: true, explanation: true, keywords: true } });
    if (!p) throw new NotFoundException('Cấu trúc chưa được xuất bản');
    const ans = dto.answer;
    if (!(typeof ans === 'string' ? ans.length <= 500 : Array.isArray(ans) && ans.length <= 30 && ans.every((x) => typeof x === 'string' && x.length <= 40))) throw new BadRequestException('Đáp án không hợp lệ');
    const g = gradeAnswer(dto.type, this.toGP({ ...p, examples: [] }), ex as unknown as GE, ans);
    if (userId) await this.record(userId, p.id, dto.type, g.correct);
    return g;
  }

  private async record(userId: number, grammarId: number, kind: string, correct: boolean) {
    await this.prisma.$transaction([
      this.prisma.grammarAttempt.create({ data: { userId, grammarId, kind, correct } }),
      this.prisma.grammarProgress.upsert({
        where: { userId_grammarId: { userId, grammarId } },
        create: { userId, grammarId, attempts: 1, correct: correct ? 1 : 0, lastPracticed: new Date() },
        update: { attempts: { increment: 1 }, correct: { increment: correct ? 1 : 0 }, lastPracticed: new Date() },
      }),
    ]);
  }

  // ---------------- Tiến độ ----------------
  async setProgress(userId: number, grammarId: number, d: { learned?: boolean; favorite?: boolean }) {
    if (!(await this.prisma.grammarPoint.findFirst({ where: { id: grammarId, ...PUBLISHED }, select: { id: true } }))) throw new NotFoundException('Không tìm thấy cấu trúc ngữ pháp');
    const p = await this.prisma.grammarProgress.upsert({
      where: { userId_grammarId: { userId, grammarId } },
      create: { userId, grammarId, learned: d.learned ?? false, favorite: d.favorite ?? false },
      update: { ...(d.learned !== undefined ? { learned: d.learned } : {}), ...(d.favorite !== undefined ? { favorite: d.favorite } : {}) },
    });
    return { grammarId, learned: p.learned, favorite: p.favorite };
  }

  async progress(userId: number) {
    const [total, rows] = await Promise.all([
      this.prisma.grammarPoint.count({ where: PUBLISHED }),
      this.prisma.grammarProgress.findMany({ where: { userId }, select: { grammarId: true, learned: true, favorite: true, attempts: true, correct: true, lastPracticed: true } }),
    ]);
    const attempts = rows.reduce((s, r) => s + r.attempts, 0);
    const correct = rows.reduce((s, r) => s + r.correct, 0);
    return {
      summary: { total, learned: rows.filter((r) => r.learned).length, favorites: rows.filter((r) => r.favorite).length, attempts, correct, accuracy: attempts ? Math.round((correct / attempts) * 100) : null },
      items: rows,
    };
  }
}
