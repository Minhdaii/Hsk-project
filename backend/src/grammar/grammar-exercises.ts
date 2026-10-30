// Sinh và chấm bài tập ngữ pháp. Hàm thuần (không đụng database) để kiểm thử độc lập.
export type GE = { id: number; hanzi: string; tokens: string | null; pinyin: string | null; meaningVi: string | null; explanationVi: string | null; isCorrect: boolean; correctedHanzi: string | null; errorExplanation: string | null };
export type GP = { id: number; level: number; title: string; pattern: string; explanation: string; keywords: string[]; examples: GE[] };
export type ExerciseType = 'order' | 'cloze' | 'choose' | 'fix' | 'match' | 'translate';
export const EXERCISE_TYPES: ExerciseType[] = ['order', 'cloze', 'choose', 'fix', 'match', 'translate'];
export type Rng = () => number;

const PUNCT = /^[，。？！、；：,.?!;:]+$/;
const isPunct = (t: string) => PUNCT.test(t);
const words = (e: GE): string[] | null => (e.tokens ? e.tokens.split(/\s+/).filter(Boolean) : null);
const noPunct = (t: string[]) => t.filter((x) => !isPunct(x));
export const shuffle = <T>(a: T[], rng: Rng): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = <T>(a: T[], rng: Rng): T | undefined => a.length ? a[Math.floor(rng() * a.length)] : undefined;

/** Tạo câu sai bằng cách hoán đổi hai từ liền kề. Chỉ nhận câu khác mọi câu đúng đã biết (tránh vô tình tạo câu đúng) */
export function swapDistractors(tokens: string[], avoid: Set<string>, n: number, rng: Rng): string[] {
  const idx: number[] = [];
  for (let i = 0; i + 1 < tokens.length; i++) if (!isPunct(tokens[i]) && !isPunct(tokens[i + 1]) && tokens[i] !== tokens[i + 1]) idx.push(i);
  const out: string[] = [];
  for (const i of shuffle(idx, rng)) {
    const t = [...tokens]; [t[i], t[i + 1]] = [t[i + 1], t[i]];
    const s = t.join('');
    if (!avoid.has(s) && !out.includes(s)) out.push(s);
    if (out.length >= n) break;
  }
  return out;
}

export type OrderQ = { type: 'order' | 'translate'; grammarId: number; exampleId: number; prompt: string; tokens: string[] };
export type ClozeQ = { type: 'cloze'; grammarId: number; exampleId: number; prompt: string | null; before: string; after: string; options: string[] };
export type ChooseQ = { type: 'choose'; grammarId: number; exampleId: number; prompt: string; options: string[] };
export type FixQ = { type: 'fix'; grammarId: number; exampleId: number; wrong: string; prompt: string | null; options: string[] };
export type MatchQ = { type: 'match'; left: { grammarId: number; label: string }[]; right: { grammarId: number; text: string }[] };
export type Question = OrderQ | ClozeQ | ChooseQ | FixQ | MatchQ;

const correct = (p: GP) => p.examples.filter((e) => e.isCorrect);
const shortExplanation = (s: string) => { const first = s.split(/[.;]/)[0].trim(); return first.length > 110 ? first.slice(0, 107) + '…' : first; };

function allCorrectSet(points: GP[]) { const s = new Set<string>(); points.forEach((p) => correct(p).forEach((e) => s.add(e.hanzi))); return s; }

export function makeQuestion(type: Exclude<ExerciseType, 'match'>, p: GP, all: GP[], rng: Rng): Question | null {
  const good = correct(p);
  if (type === 'order' || type === 'translate') {
    const cands = good.filter((e) => { const w = words(e); return w && noPunct(w).length >= 3 && noPunct(w).length <= 10 && e.meaningVi; });
    const e = pick(cands, rng); if (!e) return null;
    let bank = noPunct(words(e)!);
    if (type === 'translate') {
      const have = new Set(bank);
      const extra = shuffle(all.flatMap((q) => correct(q).flatMap((x) => noPunct(words(x) ?? []))).filter((t) => !have.has(t)), rng);
      const uniq = Array.from(new Set(extra)).slice(0, 2);
      bank = [...bank, ...uniq];
    }
    return { type, grammarId: p.id, exampleId: e.id, prompt: e.meaningVi!, tokens: shuffle(bank, rng) };
  }
  if (type === 'cloze') {
    const kws = new Set(p.keywords);
    const cands = good.filter((e) => { const w = words(e); return w && w.some((t) => kws.has(t)); });
    const e = pick(cands, rng); if (!e) return null;
    const w = words(e)!;
    const i = w.findIndex((t) => kws.has(t));
    const answer = w[i];
    const pool = Array.from(new Set(all.flatMap((q) => q.keywords))).filter((k) => k !== answer && !w.includes(k));
    const options = shuffle([answer, ...shuffle(pool, rng).slice(0, 3)], rng);
    if (options.length < 3) return null;
    return { type: 'cloze', grammarId: p.id, exampleId: e.id, prompt: e.meaningVi, before: w.slice(0, i).join(''), after: w.slice(i + 1).join(''), options };
  }
  // choose / fix cần câu sai có kèm câu sửa đúng
  const bad = p.examples.filter((e) => !e.isCorrect && e.correctedHanzi);
  const b = pick(bad, rng); if (!b) return null;
  const right = good.find((e) => e.hanzi === b.correctedHanzi);
  const rw = right && words(right); if (!rw) return null;
  const avoid = allCorrectSet(all); avoid.add(b.hanzi);
  if (type === 'choose') {
    const sw = swapDistractors(rw, avoid, 1, rng);
    const options = shuffle([b.correctedHanzi!, b.hanzi, ...sw], rng);
    if (options.length < 3) return null;
    return { type: 'choose', grammarId: p.id, exampleId: b.id, prompt: p.title, options };
  }
  const sw = swapDistractors(rw, avoid, 2, rng);
  if (sw.length < 1) return null;
  return { type: 'fix', grammarId: p.id, exampleId: b.id, wrong: b.hanzi, prompt: b.meaningVi, options: shuffle([b.correctedHanzi!, ...sw], rng) };
}

export function makeMatch(points: GP[], rng: Rng): MatchQ | null {
  if (points.length < 3) return null;
  const left = points.map((p) => ({ grammarId: p.id, label: p.pattern }));
  const right = shuffle(points.map((p) => ({ grammarId: p.id, text: shortExplanation(p.explanation) })), rng);
  return { type: 'match', left, right };
}

/** subject: các cấu trúc được hỏi; pool: toàn bộ cấu trúc cùng phạm vi, dùng để lấy đáp án gây nhiễu */
export function buildQuestions(type: ExerciseType, subject: GP[], count: number, rng: Rng, pool: GP[] = subject): Question[] {
  const out: Question[] = [];
  if (type === 'match') {
    if (subject.length === 1) {
      const others = shuffle(pool.filter((p) => p.id !== subject[0].id), rng).slice(0, 3);
      const q = makeMatch([subject[0], ...others], rng);
      return q ? [q] : [];
    }
    const byLevel = new Map<number, GP[]>();
    subject.forEach((p) => (byLevel.get(p.level) ?? byLevel.set(p.level, []).get(p.level)!).push(p));
    const groups: GP[][] = [];
    for (const g of byLevel.values()) { const sh = shuffle(g, rng); for (let i = 0; i + 3 <= sh.length; i += 4) groups.push(sh.slice(i, i + 4)); }
    for (const g of shuffle(groups, rng)) { const q = makeMatch(g, rng); if (q) out.push(q); if (out.length >= count) break; }
    return out;
  }
  const order = shuffle(subject, rng);
  for (let guard = 0; out.length < count && guard < count * 8 && order.length; guard++) {
    const q = makeQuestion(type, order[guard % order.length], pool, rng);
    if (q && !out.some((o) => 'exampleId' in o && 'exampleId' in q && o.exampleId === q.exampleId)) out.push(q);
  }
  return out;
}

export type Graded = { correct: boolean; solution: string; explanation: string | null };

export function gradeAnswer(type: Exclude<ExerciseType, 'match'>, p: GP, e: GE, answer: unknown): Graded {
  const strip = (s: string) => s.replace(/\s+/g, '');
  if (type === 'order' || type === 'translate') {
    const sol = noPunct(words(e) ?? [e.hanzi]).join('');
    const given = Array.isArray(answer) ? answer.map(String).join('') : '';
    return { correct: given === sol && sol.length > 0, solution: e.hanzi, explanation: e.explanationVi ?? p.explanation };
  }
  if (type === 'cloze') {
    const kws = new Set(p.keywords);
    const w = words(e) ?? [];
    const sol = w.find((t) => kws.has(t)) ?? '';
    return { correct: typeof answer === 'string' && answer === sol && sol !== '', solution: e.hanzi, explanation: e.explanationVi ?? p.explanation };
  }
  // choose / fix: ví dụ được nhận là ví dụ sai, đáp án đúng là câu đã sửa
  const sol = e.correctedHanzi ?? '';
  return { correct: typeof answer === 'string' && strip(answer) === strip(sol) && sol !== '', solution: sol, explanation: e.errorExplanation ?? p.explanation };
}
