'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ClozeQuestion, ExerciseMeta, OrderQuestion, Word } from '@/lib/types';
import { LEVEL_STYLE } from '@/lib/levels';
import SpeakButton from '@/components/SpeakButton';
import CountPicker from '@/components/CountPicker';
import { AnswerPanel, GameHeader, GameResult, useCombo } from '@/components/game/GameBits';

type Mode = 'cloze' | 'order' | 'reverse' | 'pinyin';

const MODES: { id: Mode; glyph: string; grad: string; title: string; desc: string }[] = [
  { id: 'cloze', glyph: '填', grad: 'from-rose-500 to-rose-700', title: 'Điền từ vào câu', desc: 'Chọn từ đúng để điền vào chỗ trống trong câu.' },
  { id: 'order', glyph: '排', grad: 'from-amber-500 to-orange-600', title: 'Sắp xếp câu', desc: 'Xếp các từ thành câu hoàn chỉnh theo nghĩa tiếng Việt.' },
  { id: 'reverse', glyph: '译', grad: 'from-sky-500 to-sky-700', title: 'Dịch Việt → Hán', desc: 'Nhìn nghĩa tiếng Việt, chọn từ tiếng Trung đúng.' },
  { id: 'pinyin', glyph: '拼', grad: 'from-violet-500 to-violet-700', title: 'Gõ pinyin', desc: 'Nhìn chữ Hán, gõ pinyin (không cần gõ dấu).' },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const shortMeaning = (m: string | null) => (m || '').split(';')[0].trim();
// Bỏ dấu thanh, khoảng trắng, số thanh; ü và v coi như u
const normPinyin = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '').replace(/v/g, 'u');

type GameProps = { level: number; count: number; onAgain: () => void; onExit: () => void };
type QuizQ = { word: Word; options: Word[] };

function useFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let off = false;
    setData(null); setError('');
    api<T>(path).then((d) => { if (!off) setData(d); }).catch((e) => { if (!off) setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'); });
    return () => { off = true; };
  }, [path]);
  return { data, error };
}

function Problem({ msg, onExit }: { msg: string; onExit: () => void }) {
  return (
    <div className="card space-y-3 text-center">
      <p className="text-stone-600">{msg}</p>
      <button className="btn-ghost" onClick={onExit}>Quay lại</button>
    </div>
  );
}

const Loading = () => <div className="card flex h-48 items-center justify-center text-stone-400">Đang chuẩn bị câu hỏi…</div>;

function NextButton({ last, onClick }: { last: boolean; onClick: () => void }) {
  return <button className="btn-primary w-full animate-fade-up !py-3 text-base" onClick={onClick}>{last ? 'Xem kết quả' : 'Câu tiếp theo'} →</button>;
}

const optionBase = 'rounded-2xl border border-stone-200 px-3 py-3.5 text-center shadow-sm transition-all duration-200';
const optionIdle = 'bg-white hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand-soft hover:shadow-md active:scale-95';
const optionRight = 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-800';
const optionWrong = 'animate-shake border-red-400 bg-red-50 text-red-800';
const optionDim = 'bg-white opacity-50';

/* ---------- Điền từ vào câu ---------- */
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
      <div className="card space-y-3 overflow-hidden text-center shadow-soft">
        <div className="-mx-5 -mt-5 mb-1 h-1.5 bg-gradient-to-r from-rose-500 to-rose-700" />
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Điền từ còn thiếu</p>
        <div className="hanzi break-words text-3xl leading-relaxed sm:text-4xl">
          {before}
          <span className={`mx-1 inline-block min-w-[3.2rem] border-b-4 px-1 transition-colors ${!answered ? 'border-brand text-transparent' : correct ? 'border-emerald-500 text-emerald-600' : 'border-red-400 text-red-500'}`}>
            {answered ? picked : '＿＿'}
          </span>
          {after}
        </div>
        {q.meaningVi && <p className="text-stone-500">{q.meaningVi}</p>}
        {answered && (
          <div className="animate-fade-up space-y-1 border-t border-stone-100 pt-3">
            <p className={`text-sm font-bold ${correct ? 'text-emerald-600' : 'text-red-600'}`}>{correct ? 'Chính xác!' : <>Đáp án đúng: <span className="hanzi text-lg text-emerald-600">{q.answer.hanzi}</span></>}</p>
            {q.pinyin && <p className="text-brand">{q.pinyin}</p>}
            <SpeakButton text={q.fullSentence} label />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((o) => {
          const isAnswer = o.hanzi === q.answer.hanzi;
          const state = !answered ? optionIdle : isAnswer ? optionRight : o.hanzi === picked ? optionWrong : optionDim;
          return (
            <button key={o.hanzi} disabled={answered} onClick={() => pick(o.hanzi)} className={`${optionBase} ${state}`}>
              <span className="hanzi block text-2xl">{o.hanzi}</span>
              {answered && <span className="block text-xs text-stone-500">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>
      {answered && <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }} />}
    </div>
  );
}

/* ---------- Sắp xếp câu ---------- */
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
  const chip = 'hanzi rounded-xl border px-3.5 py-2 text-xl shadow-sm transition-all duration-200 active:scale-95';

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <div className="card space-y-1 overflow-hidden text-center shadow-soft">
        <div className="-mx-5 -mt-5 mb-2 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Dịch sang tiếng Trung</p>
        <p className="text-xl font-bold leading-snug">{q.meaningVi}</p>
      </div>

      <div className={`flex min-h-[4.75rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors ${checked === null ? 'border-stone-300 bg-white' : checked ? 'border-emerald-400 bg-emerald-50' : 'animate-shake border-red-300 bg-red-50'}`}>
        {ans.length === 0 && <span className="px-1 text-sm text-stone-400">Chạm vào các từ bên dưới để xếp câu…</span>}
        {ans.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setAns(ans.filter((x) => x.id !== c.id)); setBank([...bank, c]); }}
            className={`${chip} animate-pop border-stone-300 bg-white hover:border-brand`}>{c.t}</button>
        ))}
      </div>

      <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-2">
        {bank.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setBank(bank.filter((x) => x.id !== c.id)); setAns([...ans, c]); }}
            className={`${chip} border-stone-300 bg-stone-50 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft`}>{c.t}</button>
        ))}
      </div>

      {locked && (
        <div className={`card animate-pop space-y-1 text-center ${checked ? 'border-emerald-300 bg-emerald-50/70' : 'border-red-300 bg-red-50/70'}`}>
          <p className={`font-bold ${checked ? 'text-emerald-700' : 'text-red-700'}`}>{checked ? 'Chính xác!' : 'Chưa đúng, câu đúng là:'}</p>
          <p className="hanzi text-2xl">{q.tokens.join('')}</p>
          {q.pinyin && <p className="text-brand">{q.pinyin}</p>}
          <SpeakButton text={q.tokens.join('')} label />
        </div>
      )}

      {!locked ? (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ghost !py-3" disabled={ans.length === 0} onClick={() => { setBank([...bank, ...ans]); setAns([]); }}>Xếp lại</button>
          <button className="btn-primary !py-3" disabled={bank.length > 0} onClick={check}>Kiểm tra</button>
        </div>
      ) : <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else setI(i + 1); }} />}
    </div>
  );
}

/* ---------- Dịch Việt → Hán (chọn đáp án) ---------- */
function ReverseGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: QuizQ[] }>(`/quiz?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

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
      <div className="card space-y-1 overflow-hidden text-center shadow-soft">
        <div className="-mx-5 -mt-5 mb-2 h-1.5 bg-gradient-to-r from-sky-500 to-sky-700" />
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Từ tiếng Trung nào có nghĩa là</p>
        <p className="break-words text-2xl font-bold leading-snug">{shortMeaning(q.word.meaningVi)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((o) => {
          const isAnswer = o.id === q.word.id;
          const state = !answered ? optionIdle : isAnswer ? optionRight : o.id === picked ? optionWrong : optionDim;
          return (
            <button key={o.id} disabled={answered} onClick={() => pick(o.id)} className={`${optionBase} ${state}`}>
              <span className="hanzi block break-words text-2xl">{o.hanzi}</span>
              {answered && <span className="block text-xs text-stone-500">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>
      {answered && <AnswerPanel ok={ok} hanzi={q.word.hanzi} pinyin={q.word.pinyin} meaning={q.word.meaningVi} audioUrl={q.word.audioUrl} />}
      {answered && <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }} />}
    </div>
  );
}

/* ---------- Gõ pinyin ---------- */
function PinyinGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: QuizQ[] }>(`/quiz?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  const qs = data.questions;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const w = qs[i].word;
  const settle = (ok: boolean) => { setResult(ok); record(ok); if (ok) setScore((s) => s + 1); };
  const check = () => settle(normPinyin(text) !== '' && normPinyin(text) === normPinyin(w.pinyin || ''));
  const next = () => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setText(''); setResult(null); } };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <div className="card space-y-2 overflow-hidden text-center shadow-soft">
        <div className="-mx-5 -mt-5 mb-2 h-1.5 bg-gradient-to-r from-violet-500 to-violet-700" />
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Gõ pinyin của từ này</p>
        <div className="hanzi break-words text-6xl leading-tight">{w.hanzi}</div>
        <p className="text-stone-500">{shortMeaning(w.meaningVi)}</p>
        <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} label />
      </div>
      <input
        autoFocus value={text} disabled={result !== null} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { if (result === null) check(); else next(); } }}
        placeholder="Ví dụ: ni hao" className="input text-center text-lg"
      />
      {result !== null && <AnswerPanel ok={result} hanzi={w.hanzi} pinyin={w.pinyin} meaning={w.meaningVi} audioUrl={w.audioUrl} />}
      {result === null
        ? <div className="grid grid-cols-2 gap-2"><button className="btn-ghost !py-3" onClick={() => settle(false)}>Bỏ qua</button><button className="btn-primary !py-3" disabled={!text.trim()} onClick={check}>Kiểm tra</button></div>
        : <NextButton last={i + 1 >= qs.length} onClick={next} />}
    </div>
  );
}

/* ---------- Trang chính ---------- */
export default function ExercisesPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState(1);
  const [count, setCount] = useState(10);
  const [round, setRound] = useState(0);
  const { data: meta } = useFetch<ExerciseMeta>(`/exercises/meta?level=${level}`);

  useEffect(() => { const n = Number(localStorage.getItem('hsk_count')); if (n >= 3 && n <= 50) setCount(n); }, []);
  const changeCount = (n: number) => { setCount(n); localStorage.setItem('hsk_count', String(n)); };

  if (mode) {
    const Game = { cloze: ClozeGame, order: OrderGame, reverse: ReverseGame, pinyin: PinyinGame }[mode];
    const m = MODES.find((x) => x.id === mode)!;
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center gap-3">
          <button className="btn-ghost !px-3 !py-1.5" onClick={() => setMode(null)}>← Quay lại</button>
          <span className={`hanzi flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl text-white shadow-sm ${m.grad}`}>{m.glyph}</span>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{m.title} <span className="font-medium text-stone-400">· HSK {level}</span></h1>
        </div>
        <Game key={`${mode}-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />
      </div>
    );
  }

  const available = (id: Mode | 'quiz') => (meta ? meta[id] : null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#a8301f] to-[#6d1b13] p-6 text-white shadow-soft sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <span aria-hidden className="hanzi pointer-events-none absolute -right-2 -top-6 animate-float select-none text-[9rem] leading-none text-white/10">练</span>
        <div className="relative">
          <h1 className="text-3xl font-bold sm:text-4xl">Luyện tập</h1>
          <p className="mt-1.5 max-w-md text-white/85">Chọn cấp độ, số câu hỏi và dạng bài để bắt đầu.</p>
        </div>
      </section>

      <section className="card space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <span className="w-28 shrink-0 text-sm font-bold text-stone-700">Cấp độ</span>
          <div className="inline-flex rounded-xl bg-stone-100 p-1">
            {[1, 2, 3].map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className={`rounded-lg px-5 py-1.5 text-sm font-bold transition-all duration-300 ${l === level ? `bg-white shadow-sm ${LEVEL_STYLE[l].text}` : 'text-stone-500 hover:text-stone-800'}`}>HSK {l}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <span className="w-28 shrink-0 text-sm font-bold text-stone-700">Số câu hỏi</span>
          <CountPicker value={count} onChange={changeCount} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((m, i) => {
          const max = available(m.id);
          const disabled = max !== null && max < 3;
          return (
            <button key={m.id} disabled={disabled} onClick={() => setMode(m.id)} style={{ animationDelay: `${i * 70}ms` }}
              className={`group relative min-h-[10.5rem] animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-left text-white shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${m.grad}`}>
              <span aria-hidden className="hanzi pointer-events-none absolute -bottom-6 -right-2 select-none text-[9rem] leading-none text-white/20 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">{m.glyph}</span>
              <div className="relative flex h-full flex-col">
                <div className="text-xl font-bold">{m.title}</div>
                <p className="mt-1 max-w-[15rem] text-sm text-white/85">{m.desc}</p>
                <div className="mt-auto flex items-center gap-2 pt-5">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {max === null ? '…' : disabled ? 'Chưa đủ dữ liệu' : count > max ? `${max} câu (tối đa)` : `${count} câu`}
                  </span>
                  <span className="text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">Bắt đầu →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Link href={`/quiz?level=${level}&count=${count}`}
        className="group card flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-soft">
        <span className="hanzi flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-3xl text-white shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">测</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold group-hover:text-emerald-700">Quiz từ vựng</span>
          <span className="block text-sm text-stone-600">Chọn nghĩa tiếng Việt hoặc nghe và chọn chữ Hán.</span>
        </span>
        <span className="text-xl text-stone-400 transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
