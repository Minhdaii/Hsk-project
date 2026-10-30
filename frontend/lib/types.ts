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
export type CardOption = { text: string; correct: boolean };
export type Card = { word: WordWithExamples; progress: ProgressRow | null; options?: CardOption[]; retry?: boolean };
export type ExerciseMeta = { cloze: number; order: number; reverse: number; pinyin: number; quiz: number };
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

export type LevelProgress = { level: number; total: number; started: number; mastered: number };

/** Chữ Hán của ngày: GET /words/daily */
export type DailyWord = { date: string; word: Word };

/* ---------- Danh mục từ vựng ---------- */
export type CategoryNode = {
  id: number; name: string; slug: string; description: string | null; icon: string | null;
  parentId: number | null; sortOrder: number; wordCount: number; children: CategoryNode[];
};
export type CategoryDetail = { category: CategoryNode; breadcrumb: { id: number; name: string; slug: string }[] };
export type WordPage = { items: Word[]; total: number; page: number; pages: number };

/* ---------- Ngữ pháp (API mở rộng) ---------- */
export type GrammarListItem = {
  id: number; slug: string | null; level: number; title: string; titleZh: string | null; category: string | null; pattern: string; explanation: string;
  source: string; verified: boolean; exampleCount: number; learned: boolean; favorite: boolean;
};
export type GrammarPage = { items: GrammarListItem[]; total: number; page: number; pages: number };
export type GrammarEx = {
  id: number; hanzi: string; tokens: string | null; pinyin: string | null; meaningVi: string | null; explanationVi: string | null;
  isCorrect: boolean; correctedHanzi: string | null; errorExplanation: string | null;
};
export type GrammarNav = { id: number; slug: string | null; title: string; level: number };
export type GrammarDetail = {
  id: number; slug: string; level: number; title: string; titleZh: string | null; category: string | null; pattern: string; explanation: string;
  usageNotes: string | null; notes: string | null; source: string; verified: boolean;
  examples: GrammarEx[]; mistakes: GrammarEx[];
  words: { id: number; hanzi: string; pinyin: string | null; meaningVi: string | null; hskLevel: number | null }[];
  related: { id: number; slug: string; title: string; titleZh: string | null; level: number }[];
  prev: GrammarNav | null; next: GrammarNav | null;
  progress: { learned: boolean; favorite: boolean; attempts: number; correct: number };
};
export type GExType = 'order' | 'cloze' | 'choose' | 'fix' | 'match' | 'translate';
export type GQuestion =
  | { type: 'order' | 'translate'; grammarId: number; exampleId: number; prompt: string; tokens: string[] }
  | { type: 'cloze'; grammarId: number; exampleId: number; prompt: string | null; before: string; after: string; options: string[] }
  | { type: 'choose'; grammarId: number; exampleId: number; prompt: string; options: string[] }
  | { type: 'fix'; grammarId: number; exampleId: number; wrong: string; prompt: string | null; options: string[] }
  | { type: 'match'; left: { grammarId: number; label: string }[]; right: { grammarId: number; text: string }[] };
export type GGraded = { correct: boolean; solution: string; explanation: string | null };
export type GProgressSummary = { summary: { total: number; learned: number; favorites: number; attempts: number; correct: number; accuracy: number | null }; items: unknown[] };
