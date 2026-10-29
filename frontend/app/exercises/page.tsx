'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ClozeQuestion, ExerciseMeta, OrderQuestion, Word } from '@/lib/types';
import { speak } from '@/lib/speak';
import SpeakButton from '@/components/SpeakButton';
import CountPicker from '@/components/CountPicker';
import { AnswerPanel, GameHeader, GameResult, useCombo } from '@/components/game/GameBits';

type GameMode = 'match' | 'order' | 'cloze' | 'listen' | 'dialogue';

const GAMES: { id: GameMode; glyph: string; title: string; desc: string; duration: string }[] = [
  { id: 'match', glyph: '配', title: '1. Ghép từ với nghĩa', desc: 'Chọn từng cặp chữ Hán và giải nghĩa tiếng Việt tương ứng.', duration: '2–3 phút' },
  { id: 'order', glyph: '排', title: '2. Sắp xếp từ thành câu', desc: 'Sắp đặt các thẻ từ theo đúng trật tự ngữ pháp chuẩn.', duration: '3–5 phút' },
  { id: 'cloze', glyph: '填', title: '3. Điền từ còn thiếu', desc: 'Chọn từ vựng chính xác để hoàn thành vị trí trống trong câu.', duration: '3–5 phút' },
  { id: 'listen', glyph: '听', title: '4. Nghe và chọn đáp án', desc: 'Lắng nghe phát âm âm thanh và chọn mặt chữ Hán chuẩn xác.', duration: '2–4 phút' },
  { id: 'dialogue', glyph: '话', title: '5. Tình huống giao tiếp', desc: 'Chọn câu phản hồi phù hợp trong các bối cảnh đời sống hằng ngày.', duration: '3–5 phút' },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const shortMeaning = (m: string | null) => (m || '').split(';')[0].trim();

type GameProps = { level: number; count: number; onAgain: () => void; onExit: () => void };

function useFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let off = false;
    setData(null); setError('');
    api<T>(path)
      .then((d) => { if (!off) setData(d); })
      .catch((e) => { if (!off) setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải bài tập'); });
    return () => { off = true; };
  }, [path]);
  return { data, error };
}

function Problem({ msg, onExit }: { msg: string; onExit: () => void }) {
  return (
    <div className="editorial-card space-y-4 p-8 text-center">
      <p className="text-xs text-stone-600">{msg}</p>
      <button className="btn-editorial-ghost text-xs" onClick={onExit}>Quay lại danh mục trò chơi</button>
    </div>
  );
}

const Loading = () => <div className="editorial-card flex h-48 items-center justify-center text-xs text-stone-600">Đang chuẩn bị nội dung bài tập…</div>;

function NextButton({ last, onClick }: { last: boolean; onClick: () => void }) {
  return (
    <button className="btn-editorial-primary w-full animate-fade-up !py-3.5 text-xs font-bold" onClick={onClick}>
      {last ? 'Hoàn thành và xem kết quả' : 'Câu tiếp theo'} →
    </button>
  );
}

const optionBase = 'rounded-lg border px-3.5 py-3 text-center transition-all duration-150';
const optionIdle = 'border-line bg-white hover:border-brand hover:bg-stone-50 text-ink active:translate-y-px';
const optionRight = 'animate-pop border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs';
const optionWrong = 'animate-shake border-red-400 bg-red-50 text-red-900 font-semibold';
const optionDim = 'border-line bg-white opacity-40 text-stone-400';

/* ============================================================
   GAME 1: GHÉP TỪ VỚI NGHĨA (Matching Pairs)
   ============================================================ */
type MatchItem = { id: number; text: string; wordId: number; type: 'hanzi' | 'meaning'; matched: boolean };

function MatchGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ items: Word[] }>(`/words?level=${level}&limit=${Math.min(count, 8)}`);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<MatchItem | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  useEffect(() => {
    if (!data?.items?.length) return;
    const cards: MatchItem[] = [];
    data.items.slice(0, 6).forEach((w, idx) => {
      cards.push({ id: idx * 2 + 1, text: w.hanzi, wordId: w.id, type: 'hanzi', matched: false });
      cards.push({ id: idx * 2 + 2, text: shortMeaning(w.meaningVi || w.meaningEn), wordId: w.id, type: 'meaning', matched: false });
    });
    setItems(shuffle(cards));
    setSelected(null);
    setWrongIds([]);
    setScore(0);
    setDone(false);
  }, [data]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  if (done) return <GameResult score={score} total={items.length / 2} best={best} onAgain={onAgain} onExit={onExit} />;

  const handleSelect = (item: MatchItem) => {
    if (item.matched || wrongIds.length > 0) return;
    if (!selected) {
      setSelected(item);
      return;
    }
    if (selected.id === item.id) {
      setSelected(null);
      return;
    }
    // So sánh xem có cùng wordId nhưng khác loại (hanzi ↔ meaning) không
    if (selected.wordId === item.wordId && selected.type !== item.type) {
      // Đúng
      record(true);
      setScore((s) => s + 1);
      const updated = items.map((x) =>
        x.wordId === item.wordId ? { ...x, matched: true } : x
      );
      setItems(updated);
      setSelected(null);
      if (updated.every((x) => x.matched)) {
        setTimeout(() => setDone(true), 600);
      }
    } else {
      // Sai
      record(false);
      setWrongIds([selected.id, item.id]);
      setTimeout(() => {
        setWrongIds([]);
        setSelected(null);
      }, 700);
    }
  };

  const matchedCount = items.filter((x) => x.matched).length / 2;
  const totalPairs = items.length / 2;

  return (
    <div className="space-y-4">
      <GameHeader i={matchedCount} total={totalPairs} score={score} combo={combo} />
      <p className="text-sm text-stone-600">Chạm một chữ Hán ở cột trái, rồi chạm nghĩa tiếng Việt tương ứng ở cột phải.</p>

      <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5">
        {(['hanzi', 'meaning'] as const).map((col) => (
          <div key={col} className="space-y-2.5">
            <h2 className="px-1 text-xs font-semibold text-stone-600">{col === 'hanzi' ? 'Chữ Hán' : 'Nghĩa tiếng Việt'}</h2>
            {items.filter((x) => x.type === col).map((item) => {
              const isSelected = selected?.id === item.id;
              const isWrong = wrongIds.includes(item.id);
              const state = item.matched
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-50'
                : isWrong
                ? 'animate-shake border-red-400 bg-red-50 text-red-900'
                : isSelected
                ? 'g-line g-soft -translate-y-0.5 !border-[rgb(var(--g))]'
                : '';
              return (
                <button key={item.id} disabled={item.matched} onClick={() => handleSelect(item)} aria-pressed={isSelected}
                  className={`lab-key flex min-h-[64px] w-full items-center justify-center gap-2 px-3 py-2 text-center ${state}`}>
                  {item.matched && <span aria-hidden className="text-sm">✓</span>}
                  <span lang={col === 'hanzi' ? 'zh-Hans' : undefined} className={col === 'hanzi' ? 'hanzi text-3xl leading-tight' : 'text-sm font-semibold leading-snug'}>{item.text}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   GAME 2: SẮP XẾP TỪ THÀNH CÂU (Sentence Order)
   ============================================================ */
type Chip = { id: number; t: string };

function OrderGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: OrderQuestion[] }>(`/exercises/order?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [bank, setBank] = useState<Chip[]>([]);
  const [ans, setAns] = useState<Chip[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();
  const qs = data?.questions;

  useEffect(() => {
    const q = qs?.[i];
    if (!q) return;
    setBank(shuffle(q.tokens.map((t, id) => ({ id, t }))));
    setAns([]); setChecked(null);
  }, [qs, i]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!qs) return <Loading />;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const locked = checked !== null;
  const check = () => {
    const ok = ans.map((c) => c.t).join('') === q.tokens.join('');
    setChecked(ok); record(ok);
    if (ok) setScore((s) => s + 1);
  };
  const chip = 'hanzi rounded-lg border px-3 py-1.5 text-lg font-bold transition-all duration-150 active:translate-y-px';

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <div className="lab-surface g-rule p-5">
        <p className="text-xs font-semibold text-stone-600">Xếp thành câu tiếng Trung có nghĩa:</p>
        <p className="mt-1 text-xl font-bold leading-snug sm:text-2xl">{q.meaningVi}</p>
      </div>

      {/* Dòng viết: các quân chữ đã chọn nằm trên đường kẻ */}
      <div className={`flex min-h-[5rem] flex-wrap items-end gap-2 border-b-[3px] px-1 pb-2 pt-3 transition-colors ${checked === null ? 'g-line' : checked ? 'border-emerald-500' : 'animate-shake border-red-400'}`}>
        {ans.length === 0 && <span className="pb-1 text-sm text-stone-500">Chạm các quân chữ bên dưới để đặt vào dòng…</span>}
        {ans.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setAns(ans.filter((x) => x.id !== c.id)); setBank([...bank, c]); }}
            lang="zh-Hans" className="lab-key hanzi animate-pop g-soft g-line min-h-[48px] px-3.5 text-xl">{c.t}</button>
        ))}
      </div>

      <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-2 pt-1">
        {bank.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setBank(bank.filter((x) => x.id !== c.id)); setAns([...ans, c]); }}
            lang="zh-Hans" className="lab-key hanzi min-h-[48px] px-3.5 text-xl">{c.t}</button>
        ))}
      </div>

      {locked && (
        <div className={`rounded-xl border p-4 text-center ${checked ? 'border-emerald-500/50 bg-emerald-50/70' : 'border-red-400/50 bg-red-50/80'}`}>
          <p className={`text-xs font-bold ${checked ? 'text-emerald-800' : 'text-red-800'}`}>{checked ? '✓ Rất chính xác!' : '✕ Chưa đúng. Câu chuẩn là:'}</p>
          <p className="hanzi mt-1 text-2xl font-bold text-ink">{q.tokens.join('')}</p>
          {q.pinyin && <p className="pinyin mt-0.5 text-xs font-semibold text-brand-ink">{q.pinyin}</p>}
          <div className="mt-2">
            <SpeakButton text={q.tokens.join('')} label />
          </div>
        </div>
      )}

      {!locked ? (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-editorial-ghost !py-3 text-xs" disabled={ans.length === 0} onClick={() => { setBank([...bank, ...ans]); setAns([]); }}>Xếp lại</button>
          <button className="btn-editorial-primary !py-3 text-xs" disabled={bank.length > 0} onClick={check}>Kiểm tra đáp án</button>
        </div>
      ) : <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else setI(i + 1); }} />}
    </div>
  );
}

/* ============================================================
   GAME 3: ĐIỀN TỪ CÒN THIẾU (Cloze Question)
   ============================================================ */
function ClozeGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: ClozeQuestion[] }>(`/exercises/cloze?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  const qs = data.questions;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const answered = picked !== null;
  const correct = picked === q.answer.hanzi;
  const [before, after] = q.sentence.split('____');
  const pick = (hanzi: string) => {
    if (answered) return;
    const ok = hanzi === q.answer.hanzi;
    setPicked(hanzi); record(ok); if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <figure className="lab-surface space-y-3 border-l-4 p-5 sm:p-7 g-line !border-l-[rgb(var(--g))]">
        <p className="text-xs font-semibold text-stone-600">Chọn từ điền vào chỗ trống:</p>
        <div lang="zh-Hans" className="hanzi break-words text-3xl leading-relaxed sm:text-4xl">
          {before}
          <span className={`mx-1.5 inline-block min-w-[3.5rem] border-b-[3px] px-1.5 text-center transition-colors ${!answered ? 'g-line text-transparent' : correct ? 'border-emerald-600 text-emerald-800' : 'border-red-500 text-red-600'}`}>
            {answered ? picked : '＿＿'}
          </span>
          {after}
        </div>
        {q.meaningVi && <figcaption className="text-sm text-stone-600">{q.meaningVi}</figcaption>}
        {answered && (
          <div className="animate-fade-up space-y-1 border-t border-line pt-3">
            <p className={`text-sm font-bold ${correct ? 'text-emerald-800' : 'text-red-700'}`}>
              {correct ? '✓ Chính xác!' : <>Đáp án đúng: <span className="hanzi text-lg text-emerald-800">{q.answer.hanzi}</span></>}
            </p>
            {q.pinyin && <p className="pinyin text-base font-medium text-brand-ink">{q.pinyin}</p>}
            <div className="pt-1"><SpeakButton text={q.fullSentence} label /></div>
          </div>
        )}
      </figure>
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((o) => {
          const isAnswer = o.hanzi === q.answer.hanzi;
          const state = !answered ? '' : isAnswer ? '!border-emerald-500 bg-emerald-50 text-emerald-950' : o.hanzi === picked ? 'animate-shake !border-red-400 bg-red-50 text-red-900' : 'opacity-40';
          return (
            <button key={o.hanzi} disabled={answered} onClick={() => pick(o.hanzi)} className={`lab-key min-h-[68px] px-3 py-2 text-center ${state}`}>
              <span lang="zh-Hans" className="hanzi block text-3xl leading-tight">{o.hanzi}</span>
              {answered && <span className="pinyin block text-sm font-medium text-stone-600">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>
      {answered && <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }} />}
    </div>
  );
}

/* ============================================================
   GAME 5: NGHE VÀ CHỌN ĐÁP ÁN (Listening Quiz)
   ============================================================ */
type QuizQ = { word: Word; options: Word[] };

function ListenGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: QuizQ[] }>(`/quiz?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { combo, best, record } = useCombo();

  // Phát âm và làm sóng âm chuyển động trong lúc phát (không lặp vô hạn)
  const play = (hanzi: string, audioUrl: string | null) => {
    speak(hanzi, audioUrl);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1400);
  };

  useEffect(() => {
    if (data?.questions?.[i]) {
      play(data.questions[i].word.hanzi, data.questions[i].word.audioUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, i]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  const qs = data.questions;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const answered = picked !== null;
  const ok = picked === q.word.id;
  const pick = (id: number) => {
    if (answered) return;
    setPicked(id); record(id === q.word.id); if (id === q.word.id) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      
      <div className="lab-surface flex flex-col items-center gap-4 px-5 py-8 text-center">
        <button onClick={() => play(q.word.hanzi, q.word.audioUrl)} aria-label="Phát lại âm thanh"
          className="g-solid flex h-24 w-24 items-center justify-center rounded-full ring-8 ring-[rgb(var(--g)/.12)] transition-transform duration-150 hover:scale-105 active:scale-95">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
        </button>
        <div aria-hidden className="flex h-8 items-center gap-1.5">
          {[16, 28, 20, 32, 14, 26, 18].map((h, k) => (
            <span key={k} style={{ height: h, animationDelay: `${k * 70}ms` }} className={`g-solid w-1.5 rounded-full opacity-70 ${playing ? 'animate-pulse' : ''}`} />
          ))}
        </div>
        <p className="text-sm text-stone-600">Nghe và chọn chữ Hán bạn vừa nghe. Chạm nút tròn để nghe lại.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((o) => {
          const isAnswer = o.id === q.word.id;
          const state = !answered ? '' : isAnswer ? '!border-emerald-500 bg-emerald-50 text-emerald-950' : o.id === picked ? 'animate-shake !border-red-400 bg-red-50 text-red-900' : 'opacity-40';
          return (
            <button key={o.id} disabled={answered} onClick={() => pick(o.id)} className={`lab-key min-h-[76px] px-3 py-2 text-center ${state}`}>
              <span lang="zh-Hans" className="hanzi block text-3xl leading-tight">{o.hanzi}</span>
              {answered && <span className="pinyin mt-0.5 block text-sm font-medium text-brand-ink">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>

      {answered && <AnswerPanel ok={ok} hanzi={q.word.hanzi} pinyin={q.word.pinyin} meaning={q.word.meaningVi} audioUrl={q.word.audioUrl} />}
      {answered && <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }} />}
    </div>
  );
}

/* ============================================================
   GAME 6: TÌNH HUỐNG GIAO TIẾP (Dialogue Scenarios)
   ============================================================ */
type ScenarioQ = {
  scenario: string;
  speakerA: string;
  speakerAPinyin: string;
  speakerAMeaning: string;
  options: { hanzi: string; pinyin: string; meaning: string; correct: boolean }[];
  explanation: string;
};

const SCENARIOS: ScenarioQ[] = [
  {
    scenario: 'Chào hỏi lần đầu gặp gỡ',
    speakerA: '你好！很高兴认识你。',
    speakerAPinyin: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
    speakerAMeaning: 'Xin chào! Rất vui được quen biết bạn.',
    options: [
      { hanzi: '我也很高兴认识你。', pinyin: 'Wǒ yě hěn gāoxìng rènshí nǐ.', meaning: 'Tôi cũng rất vui được quen bạn.', correct: true },
      { hanzi: '没关系。', pinyin: 'Méi guānxi.', meaning: 'Không có gì.', correct: false },
      { hanzi: '多少钱？', pinyin: 'Duōshao qián?', meaning: 'Bao nhiêu tiền?', correct: false },
      { hanzi: '再见！', pinyin: 'Zàijiàn!', meaning: 'Tạm biệt!', correct: false },
    ],
    explanation: 'Khi đối phương nói "很高兴认识你", câu đáp chuẩn lịch sự là "我也很高兴认识你" (Tôi cũng rất vui...).',
  },
  {
    scenario: 'Hỏi giá khi mua sắm',
    speakerA: '这个苹果多少钱一斤？',
    speakerAPinyin: 'Zhège píngguǒ duōshao qián yī jīn?',
    speakerAMeaning: 'Táo này bao nhiêu tiền một cân?',
    options: [
      { hanzi: '五块钱一斤。', pinyin: 'Wǔ kuài qián yī jīn.', meaning: 'Năm tệ một cân.', correct: true },
      { hanzi: '我是越南人。', pinyin: 'Wǒ shì yuènán rén.', meaning: 'Tôi là người Việt Nam.', correct: false },
      { hanzi: '太谢谢你了。', pinyin: 'Tài xièxie nǐ le.', meaning: 'Cảm ơn bạn rất nhiều.', correct: false },
      { hanzi: '现在三点。', pinyin: 'Xiànzài sān diǎn.', meaning: 'Bây giờ là ba giờ.', correct: false },
    ],
    explanation: 'Câu hỏi về giá tiền "多少钱" cần câu trả lời có số tiền và đơn vị tệ ("五块钱...").',
  },
  {
    scenario: 'Hỏi thăm thời gian',
    speakerA: '请问，现在几点了？',
    speakerAPinyin: 'Qǐngwèn, xiànzài jǐ diǎn le?',
    speakerAMeaning: 'Xin hỏi, bây giờ là mấy giờ rồi?',
    options: [
      { hanzi: '现在上午十点半。', pinyin: 'Xiànzài shàngwǔ shí diǎn bàn.', meaning: 'Bây giờ là mười giờ rưỡi sáng.', correct: true },
      { hanzi: '明天见。', pinyin: 'Míngtiān jiàn.', meaning: 'Ngày mai gặp.', correct: false },
      { hanzi: '我不去。', pinyin: 'Wǒ bù qù.', meaning: 'Tôi không đi.', correct: false },
      { hanzi: '很好吃。', pinyin: 'Hěn hǎochī.', meaning: 'Rất ngon miệng.', correct: false },
    ],
    explanation: 'Câu hỏi giờ "几点了" đáp lại bằng thời điểm cụ thể ("十点半").',
  },
  {
    scenario: 'Lời cảm ơn và đáp lễ',
    speakerA: '今天太谢谢你了！',
    speakerAPinyin: 'Jīntiān tài xièxie nǐ le!',
    speakerAMeaning: 'Hôm nay cảm ơn bạn nhiều lắm nhé!',
    options: [
      { hanzi: '不客气，不用谢。', pinyin: 'Bù kèqi, bù yòng xiè.', meaning: 'Không có chi, đừng khách sáo.', correct: true },
      { hanzi: '对不起。', pinyin: 'Duìbuqǐ.', meaning: 'Xin lỗi.', correct: false },
      { hanzi: '欢迎光临。', pinyin: 'Huānyíng guānglín.', meaning: 'Hoan nghênh quý khách.', correct: false },
      { hanzi: '去医院。', pinyin: 'Qù yīyuàn.', meaning: 'Đi bệnh viện.', correct: false },
    ],
    explanation: 'Khi nhận lời cảm ơn "谢谢", câu đáp lễ chuẩn mực là "不客气" hoặc "不用谢".',
  },
];

function DialogueGame({ onAgain, onExit }: { onAgain: () => void; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  if (done) return <GameResult score={score} total={SCENARIOS.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = SCENARIOS[i];
  const answered = picked !== null;
  const isCorrect = picked !== null && q.options[picked].correct;

  const handlePick = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    const ok = q.options[idx].correct;
    record(ok);
    if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={SCENARIOS.length} score={score} combo={combo} />
      
      <p className="text-sm text-stone-600"><span className="font-semibold text-ink">Bối cảnh:</span> {q.scenario}</p>

      {/* Lời của đối phương (trái) */}
      <div className="flex items-start gap-3">
        <span aria-hidden lang="zh-Hans" className="hanzi g-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg">友</span>
        <div className="lab-surface rounded-tl-sm p-4">
          <div lang="zh-Hans" className="hanzi text-2xl leading-snug">{q.speakerA}</div>
          <div className="pinyin mt-0.5 text-base font-medium text-brand-ink">{q.speakerAPinyin}</div>
          <div className="mt-0.5 text-sm text-stone-600">{q.speakerAMeaning}</div>
          <div className="mt-2"><SpeakButton text={q.speakerA} label /></div>
        </div>
      </div>

      {/* Lựa chọn trả lời của bạn (phải) */}
      <p className="pt-1 text-right text-xs font-semibold text-stone-600">Bạn đáp lại thế nào?</p>
      <div className="space-y-2.5">
        {q.options.map((o, idx) => {
          const isSelected = picked === idx;
          const state = !answered ? 'g-line hover:g-soft' : o.correct ? '!border-emerald-500 bg-emerald-50 text-emerald-950' : isSelected ? 'animate-shake !border-red-400 bg-red-50 text-red-900' : 'opacity-40';
          return (
            <button key={idx} disabled={answered} onClick={() => handlePick(idx)}
              className={`ml-auto block w-[92%] rounded-xl rounded-tr-sm border-2 bg-white p-3.5 text-left transition-colors sm:w-[85%] ${state}`}>
              <span lang="zh-Hans" className="hanzi block text-xl leading-snug">{o.hanzi}</span>
              <span className="mt-0.5 block text-sm text-stone-600">{o.meaning}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`rounded-xl border p-4 text-xs ${isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-rose-400 bg-rose-50 text-rose-950'}`}>
          <div className="font-bold">{isCorrect ? '✓ Đáp án chuẩn xác!' : '✕ Chưa phù hợp.'}</div>
          <p className="mt-1 leading-relaxed text-stone-700">{q.explanation}</p>
        </div>
      )}

      {answered && (
        <NextButton
          last={i + 1 >= SCENARIOS.length}
          onClick={() => {
            if (i + 1 >= SCENARIOS.length) setDone(true);
            else { setI(i + 1); setPicked(null); }
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   TRANG CHÍNH: PHÒNG LUYỆN TẬP TỔNG HỢP (GAME HUB)
   ============================================================ */
function ExercisesContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') as GameMode | null;
  const initialLevel = Number(searchParams.get('level')) || 1;

  const [mode, setMode] = useState<GameMode | null>(
    initialMode && ['match', 'order', 'cloze', 'listen', 'dialogue'].includes(initialMode)
      ? initialMode
      : null
  );
  const [level, setLevel] = useState(initialLevel >= 1 && initialLevel <= 3 ? initialLevel : 1);
  const [count, setCount] = useState(10);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const qMode = searchParams.get('mode') as GameMode | null;
    if (qMode && ['match', 'order', 'cloze', 'listen', 'dialogue'].includes(qMode)) {
      setMode(qMode as GameMode);
    }
  }, [searchParams]);

  useEffect(() => {
    const n = Number(localStorage.getItem('hsk_count'));
    if (n >= 3 && n <= 50) setCount(n);
  }, []);
  const changeCount = (n: number) => {
    setCount(n);
    localStorage.setItem('hsk_count', String(n));
  };

  if (mode) {
    const selectedGame = GAMES.find((x) => x.id === mode)!;
    return (
      <div data-game={mode} className="lab-game mx-auto max-w-lg space-y-4">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <button className="btn-ghost !px-3" onClick={() => setMode(null)}>← Danh mục</button>
          <span lang="zh-Hans" aria-hidden className="hanzi g-solid flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg">{selectedGame.glyph}</span>
          <h1 className="min-w-0 flex-1 truncate font-bold">
            {selectedGame.title.replace(/^\d+\.\s*/, '')} <span className="text-sm font-normal text-stone-600">· HSK {level}</span>
          </h1>
        </div>

        {mode === 'match' && <MatchGame key={`m-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'order' && <OrderGame key={`o-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'cloze' && <ClozeGame key={`c-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'listen' && <ListenGame key={`l-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'dialogue' && <DialogueGame key={`d-${round}`} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
      </div>
    );
  }

  const tile = (id: GameMode, span: string, preview: React.ReactNode, hint?: string) => {
    const g = GAMES.find((x) => x.id === id)!;
    return (
      <button key={id} onClick={() => setMode(id)} data-game={id}
        className={`lab-game lab-tile g-solid group relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-xl p-5 text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-offset-4 sm:p-6 ${span}`}>
        <span aria-hidden lang="zh-Hans" className="lab-glyph hanzi pointer-events-none absolute -bottom-7 -right-1 select-none text-[9.5rem] font-black leading-none text-white/15">{g.glyph}</span>
        <span className="relative block">
          {hint && <span className="mb-2 inline-block rounded-md bg-white px-2 py-0.5 text-xs font-bold g-ink">{hint}</span>}
          <span className="block text-xl font-bold leading-tight sm:text-2xl">{g.title.replace(/^\d+\.\s*/, '')}</span>
          <span className="mt-1 block max-w-[17rem] text-sm text-white/95">{g.desc}</span>
        </span>
        <span aria-hidden className="relative my-4 block">{preview}</span>
        <span className="relative flex items-center justify-between text-sm font-semibold">
          <span className="text-white/90">{g.duration}</span>
          <span className="inline-flex items-center gap-1.5">Chơi <span className="lab-nudge inline-block">→</span></span>
        </span>
      </button>
    );
  };
  const chipW = 'rounded-md bg-white px-2.5 py-1.5 text-ink';

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Phòng luyện tập</h1>
        <p className="mt-1 max-w-xl text-stone-600">Năm trò chơi, mỗi trò rèn một kỹ năng khác nhau. Chọn cấp độ và số câu rồi bắt đầu.</p>
      </header>

      <div className="lab-surface flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-sm font-semibold text-stone-600">Cấp độ</span>
          <div role="group" aria-label="Chọn cấp độ luyện tập" className="flex gap-1.5">
            {[1, 2, 3].map((l) => (
              <button key={l} onClick={() => setLevel(l)} aria-pressed={l === level}
                className={`min-h-[44px] min-w-[68px] rounded-lg border px-3 text-sm font-bold transition-colors ${l === level ? 'border-brand-ink/50 bg-brand text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400 hover:text-ink'}`}>
                HSK {l}
              </button>
            ))}
          </div>
        </div>
        <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-14 shrink-0 text-sm font-semibold text-stone-600">Số câu</span>
          <CountPicker value={count} onChange={changeCount} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {tile('match', 'lg:col-span-7', (
          <span className="grid max-w-sm grid-cols-2 gap-x-3 gap-y-1.5 text-sm font-semibold">
            {[['你好', 'Xin chào'], ['谢谢', 'Cảm ơn'], ['再见', 'Tạm biệt']].map(([h, v], k) => (
              <span key={h} className="contents">
                <span lang="zh-Hans" className={`hanzi ${chipW} text-lg`}>{h}</span>
                <span className={`${chipW} ${k === 0 ? 'ring-2 ring-white/70' : 'opacity-90'}`}>{k === 0 ? '✓ ' : ''}{v}</span>
              </span>
            ))}
          </span>
        ), 'Nên bắt đầu từ đây')}
        {tile('listen', 'lg:col-span-5', (
          <span className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white g-ink">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
            </span>
            <span className="flex h-8 items-center gap-1.5">{[14, 26, 18, 30, 12, 22].map((h, k) => <span key={k} style={{ height: h }} className="w-1.5 rounded-full bg-white/80" />)}</span>
          </span>
        ))}
        {tile('order', 'lg:col-span-5', (
          <span className="block max-w-xs">
            <span className="flex min-h-[2.5rem] items-end gap-1.5 border-b-[3px] border-white/70 pb-1.5">
              {['我', '是'].map((c) => <span key={c} lang="zh-Hans" className={`hanzi ${chipW} text-lg`}>{c}</span>)}
            </span>
            <span className="mt-2.5 flex gap-1.5">
              {['学生', '们'].map((c) => <span key={c} lang="zh-Hans" className={`hanzi ${chipW} text-lg opacity-90`}>{c}</span>)}
            </span>
          </span>
        ))}
        {tile('cloze', 'lg:col-span-7', (
          <span className="block">
            <span lang="zh-Hans" className="hanzi block text-2xl leading-snug">我喜欢 <span className="inline-block min-w-[3rem] border-b-[3px] border-white/80 align-bottom">&nbsp;</span> 咖啡</span>
            <span className="mt-3 flex gap-1.5">
              {['喝', '看', '吃'].map((c, k) => <span key={c} lang="zh-Hans" className={`hanzi ${chipW} text-lg ${k === 0 ? 'ring-2 ring-white/70' : 'opacity-90'}`}>{c}</span>)}
            </span>
          </span>
        ))}
        {tile('dialogue', 'lg:col-span-12', (
          <span className="flex max-w-xl flex-col gap-2 text-sm font-semibold">
            <span lang="zh-Hans" className={`hanzi ${chipW} self-start text-base`}>很高兴认识你。</span>
            <span lang="zh-Hans" className={`hanzi ${chipW} self-end text-base`}>我也很高兴认识你。</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="lab-surface flex h-48 items-center justify-center text-sm text-stone-600">Đang tải phòng luyện tập…</div>}>
      <ExercisesContent />
    </Suspense>
  );
}
