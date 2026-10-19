export type Word = {
  id: number; hanzi: string; traditional: string | null; pinyin: string | null;
  meaningVi: string | null; meaningEn: string | null; pos: string | null;
  hanviet: string | null; hskLevel: number | null; hskOld: number | null;
  frequency: number | null; audioUrl: string | null;
};
export type Example = { id: number; wordId: number; hanzi: string; pinyin: string | null; meaningVi: string | null; source: string | null };
export type WordDetail = Word & { examples: Example[] };
export type WordWithExamples = Word & { examples?: Example[] };
export type ProgressRow = { easeFactor: number; interval: number; repetitions: number; dueDate: string };
export type Card = { word: WordWithExamples; progress: ProgressRow | null };
export type Stats = {
  due: number; learned: number; streak: number; xp: number;
  studiedToday: boolean; atRisk: boolean; brokenStreak: number;
};
export type StreakStatus = 'same' | 'started' | 'continued' | 'relit';
export type ReviewResult = { streak: number; xp: number; streakStatus: StreakStatus; previousStreak: number; progress: ProgressRow };
export type AuthUser = { id: number; email: string; username: string; streak: number; xp: number };

export type GrammarExample = { id: number; hanzi: string; pinyin: string | null; meaningVi: string | null };
export type GrammarPoint = {
  id: number; level: number; title: string; pattern: string; explanation: string; notes: string | null;
  examples: GrammarExample[];
};
export type ClozeQuestion = {
  id: number; sentence: string; fullSentence: string; pinyin: string | null; meaningVi: string | null;
  answer: { hanzi: string; pinyin: string | null };
  options: { hanzi: string; pinyin: string | null }[];
};
export type OrderQuestion = { id: number; meaningVi: string | null; pinyin: string | null; tokens: string[] };
export type Activity = { goal: number; today: number; days: { date: string; reviews: number }[] };
export type LeaderRow = { rank: number; name: string; xp: number; streak: number };
