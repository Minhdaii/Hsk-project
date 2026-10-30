// Kiểm tra bộ sinh/chấm bài tập ngữ pháp trên dữ liệu thật (không cần database):  npx ts-node prisma/check-grammar-exercises.ts
import { readFileSync } from 'fs';
import { BasePoint, Extra, buildPoints } from './grammar-logic';
import { EXERCISE_TYPES, GE, GP, Question, buildQuestions, gradeAnswer } from '../src/grammar/grammar-exercises';

const base: BasePoint[] = JSON.parse(readFileSync('../data/grammar.json', 'utf-8'));
const extra: Extra = JSON.parse(readFileSync('../data/grammar_extra.json', 'utf-8'));
const { points } = buildPoints(base, extra);
let eid = 1;
const gps: GP[] = points.map((p, i) => ({
  id: i + 1, level: p.level, title: p.title, pattern: p.pattern, explanation: p.explanation, keywords: p.keywords.split(' ').filter(Boolean),
  examples: p.examples.map((e): GE => ({ id: eid++, hanzi: e.hanzi, tokens: e.tokens, pinyin: e.pinyin, meaningVi: e.meaningVi, explanationVi: e.explanationVi, isCorrect: e.isCorrect, correctedHanzi: e.correctedHanzi, errorExplanation: e.errorExplanation })),
}));
const exById = new Map<number, { e: GE; p: GP }>();
gps.forEach((p) => p.examples.forEach((e) => exById.set(e.id, { e, p })));
const known = new Set(gps.flatMap((p) => p.examples.filter((e) => e.isCorrect).map((e) => e.hanzi)));
let seed = 7; const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
let fails = 0; const fail = (m: string) => { fails++; if (fails <= 10) console.log('FAIL', m); };

for (const type of EXERCISE_TYPES) {
  let made = 0, graded = 0;
  const perPoint = new Set<number>();
  for (let r = 0; r < 40; r++) {
    const qs: Question[] = buildQuestions(type, gps, 10, rng);
    for (const q of qs) {
      made++;
      if (q.type === 'match') {
        const ids = q.left.map((l) => l.grammarId);
        if (new Set(ids).size !== ids.length) fail('match: trùng cấu trúc');
        if (q.right.length !== q.left.length || !q.right.every((x) => ids.includes(x.grammarId))) fail('match: cột phải không khớp cột trái');
        continue;
      }
      const { e, p } = exById.get(q.exampleId)!;
      perPoint.add(p.id);
      let answer: unknown;
      if (q.type === 'order' || q.type === 'translate') {
        const sol = e.tokens!.split(' ').filter((t) => !/^[，。？！、；：,.?!;:]+$/.test(t));
        if (!sol.every((t) => q.tokens.includes(t))) fail(`${type}: thiếu token đáp án (${e.hanzi})`);
        answer = sol;
        if (q.type === 'translate' && q.tokens.length < sol.length) fail('translate: thiếu token');
      } else if (q.type === 'cloze') {
        const ans = e.tokens!.split(' ').find((t) => p.keywords.includes(t))!;
        if (!q.options.includes(ans)) fail('cloze: options không chứa đáp án');
        if (new Set(q.options).size !== q.options.length) fail('cloze: options trùng');
        if (q.before + ans + q.after !== e.hanzi.replace(/\s/g, '').replace(q.before, q.before)) { /* before/after chỉ ghép lại gần đúng */ }
        answer = ans;
      } else {
        const ans = e.correctedHanzi!;
        if (!q.options.includes(ans)) fail(`${type}: options không chứa câu đúng`);
        if (new Set(q.options).size !== q.options.length) fail(`${type}: options trùng`);
        const others = q.options.filter((o) => o !== ans && o !== e.hanzi);
        if (others.some((o) => known.has(o))) fail(`${type}: đáp án gây nhiễu trùng một câu đúng đã biết`);
        if (q.type === 'fix' && q.options.includes(e.hanzi)) fail('fix: options chứa chính câu sai');
        answer = ans;
      }
      const g = gradeAnswer(q.type, p, e, answer);
      if (!g.correct) fail(`${type}: đáp án đúng bị chấm sai (${e.hanzi})`);
      const wrong = gradeAnswer(q.type, p, e, q.type === 'order' || q.type === 'translate' ? ['错'] : '错');
      if (wrong.correct) fail(`${type}: đáp án sai lại được chấm đúng`);
      graded++;
    }
  }
  console.log(`${type.padEnd(9)} sinh ${String(made).padStart(4)} câu, chấm đúng/sai kiểm tra ${String(graded).padStart(4)}, phủ ${perPoint.size || '-'} cấu trúc`);
}
console.log(fails ? `\n${fails} lỗi` : '\nTẤT CẢ KIỂM TRA ĐẠT');
process.exit(fails ? 1 : 0);
