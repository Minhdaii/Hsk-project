'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ClozeQuestion, OrderQuestion, Word } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import Confetti from '@/components/Confetti';

type Mode = 'cloze' | 'order' | 'reverse' | 'pinyin';

const MODES: { id: Mode; glyph: string; grad: string; title: string; desc: string }[] = [
  { id: 'cloze', glyph: '填', grad: 'from-rose-500 to-rose-700', title: 'Điền từ vào câu', desc: 'Chọn từ đúng để điền vào chỗ trống.' },
  { id: 'order', glyph: '排', grad: 'from-amber-500 to-orange-600', title: 'Sắp xếp câu', desc: 'Xếp các từ thành câu hoàn chỉnh theo nghĩa tiếng Việt.' },
  { id: 'reverse', glyph: '译', grad: 'from-sky-500 to-sky-700', title: 'Dịch Việt → Hán', desc: 'Nhìn nghĩa tiếng Việt, chọn từ tiếng Trung đúng.' },
  { id: 'pinyin', glyph: '拼', grad: 'from-violet-500 to-violet-700', title: 'Gõ pinyin', desc: 'Nhìn chữ Hán, gõ pinyin (không cần gõ dấu).' },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const shortMeaning = (m: string | null) => (m || '').split(';')[0].trim();
// Bỏ dấu thanh, khoảng trắng, số thanh; ü và v coi như u
const normPinyin = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '').replace(/v/g, 'u');

type GameProps = { level: number; onAgain: () => void; onExit: () => void };
type QuizQ = { word: Word; options: Word[] };

function useFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let off = false;
    api<T>(path).then((d) => { if (!off) setData(d); }).catch((e) => { if (!off) setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'); });
    return () => { off = true; };
  }, [path]);
  return { data, error };
}

function Header({ i, total, score }: { i: number; total: number; score: number }) {
  return (
    <>
      <div className="flex justify-between text-sm font-medium text-stone-500"><span>Câu {i + 1}/{total}</span><span>Điểm: {score}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div className="bar-fill h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${(i / total) * 100}%` }} />
      </div>
    </>
  );
}

function Result({ score, total, onAgain, onExit }: { score: number; total: number; onAgain: () => void; onExit: () => void }) {
  const ratio = score / total;
  return (
    <div className="card animate-pop space-y-3 py-8 text-center">
      {ratio >= 0.8 && <Confetti />}
      <div className="text-5xl">{ratio >= 0.8 ? '🏆' : ratio >= 0.5 ? '👍' : '💪'}</div>
      <p className="text-2xl font-bold">{score}/{total} câu đúng</p>
      <div className="flex justify-center gap-2 pt-2">
        <button className="btn-ghost" onClick={onExit}>Chọn bài khác</button>
        <button className="btn-primary" onClick={onAgain}>Làm lại</button>
      </div>
    </div>
  );
}

function Problem({ msg, onExit }: { msg: string; onExit: () => void }) {
  return (
    <div className="card space-y-3 text-center">
      <p className="text-stone-600">{msg}</p>
      <button className="btn-ghost" onClick={onExit}>Quay lại</button>
    </div>
  );
}

/* ---------- Điền từ vào câu ---------- */
function ClozeGame({ level, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: ClozeQuestion[] }>(`/exercises/cloze?level=${level}&count=10`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <p>Đang tải…</p>;
  const qs = data.questions;
  if (done) return <Result score={score} total={qs.length} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const answered = picked !== null;
  const correct = picked === q.answer.hanzi;
  const [before, after] = q.sentence.split('____');

  return (
    <div className="space-y-4">
      <Header i={i} total={qs.length} score={score} />
      <div className="card space-y-3 text-center shadow-soft">
        <div className="hanzi break-words text-3xl leading-relaxed sm:text-4xl">
          {before}
          <span className={`mx-1 inline-block min-w-[3rem] border-b-4 px-1 ${!answered ? 'border-brand text-transparent' : correct ? 'border-emerald-500 text-emerald-600' : 'border-red-400 text-red-500'}`}>
            {answered ? picked : '＿＿'}
          </span>
          {after}
        </div>
        {q.meaningVi && <p className="text-sm text-stone-500">{q.meaningVi}</p>}
        {answered && (
          <div className="space-y-1 border-t border-stone-100 pt-3">
            {!correct && <p className="text-sm">Đáp án đúng: <b className="hanzi text-lg text-emerald-600">{q.answer.hanzi}</b></p>}
            {q.pinyin && <p className="text-brand">{q.pinyin}</p>}
            <SpeakButton text={q.fullSentence} label />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o) => {
          const isAnswer = o.hanzi === q.answer.hanzi;
          const state = !answered ? 'bg-white hover:border-brand hover:bg-brand-soft'
            : isAnswer ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-800'
            : o.hanzi === picked ? 'animate-shake border-red-400 bg-red-50 text-red-800' : 'bg-white opacity-50';
          return (
            <button key={o.hanzi} disabled={answered} onClick={() => { setPicked(o.hanzi); if (isAnswer) setScore((s) => s + 1); }}
              className={`rounded-xl border border-stone-200 px-3 py-3 text-center transition ${state}`}>
              <span className="hanzi block text-2xl">{o.hanzi}</span>
              {answered && <span className="block text-xs text-stone-500">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>
      {answered && <button className="btn-primary w-full" onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }}>{i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp theo'}</button>}
    </div>
  );
}

/* ---------- Sắp xếp câu ---------- */
type Chip = { id: number; t: string };

function OrderGame({ level, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: OrderQuestion[] }>(`/exercises/order?level=${level}&count=8`);
  const [i, setI] = useState(0);
  const [bank, setBank] = useState<Chip[]>([]);
  const [ans, setAns] = useState<Chip[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const qs = data?.questions;

  useEffect(() => {
    const q = qs?.[i];
    if (!q) return;
    setBank(shuffle(q.tokens.map((t, id) => ({ id, t }))));
    setAns([]); setChecked(null);
  }, [qs, i]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!qs) return <p>Đang tải…</p>;
  if (done) return <Result score={score} total={qs.length} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const locked = checked !== null;
  const check = () => {
    const ok = ans.map((c) => c.t).join('') === q.tokens.join('');
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <Header i={i} total={qs.length} score={score} />
      <div className="card space-y-1 text-center shadow-soft">
        <p className="text-sm text-stone-500">Dịch sang tiếng Trung</p>
        <p className="text-xl font-semibold">{q.meaningVi}</p>
      </div>

      <div className={`flex min-h-[4.5rem] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-3 ${checked === null ? 'border-stone-300 bg-white' : checked ? 'border-emerald-400 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
        {ans.length === 0 && <span className="text-sm text-stone-400">Chạm vào các từ bên dưới để xếp câu…</span>}
        {ans.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setAns(ans.filter((x) => x.id !== c.id)); setBank([...bank, c]); }}
            className="hanzi rounded-xl border border-stone-300 bg-white px-3 py-2 text-xl shadow-sm">{c.t}</button>
        ))}
      </div>

      <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-2">
        {bank.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setBank(bank.filter((x) => x.id !== c.id)); setAns([...ans, c]); }}
            className="hanzi rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-xl shadow-sm transition hover:border-brand">{c.t}</button>
        ))}
      </div>

      {locked && (
        <div className="card space-y-1 text-center">
          <p className={checked ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>{checked ? 'Chính xác!' : 'Chưa đúng'}</p>
          {!checked && <p className="hanzi text-xl">{q.tokens.join('')}</p>}
          {q.pinyin && <p className="text-brand">{q.pinyin}</p>}
          <SpeakButton text={q.tokens.join('')} label />
        </div>
      )}

      {!locked ? (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-ghost" disabled={ans.length === 0} onClick={() => { setBank([...bank, ...ans]); setAns([]); }}>Xếp lại</button>
          <button className="btn-primary" disabled={bank.length > 0} onClick={check}>Kiểm tra</button>
        </div>
      ) : (
        <button className="btn-primary w-full" onClick={() => { if (i + 1 >= qs.length) setDone(true); else setI(i + 1); }}>{i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp theo'}</button>
      )}
    </div>
  );
}

/* ---------- Dịch Việt → Hán (chọn đáp án) ---------- */
function ReverseGame({ level, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: QuizQ[] }>(`/quiz?level=${level}&count=10`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <p>Đang tải…</p>;
  const qs = data.questions;
  if (done) return <Result score={score} total={qs.length} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const answered = picked !== null;
  return (
    <div className="space-y-4">
      <Header i={i} total={qs.length} score={score} />
      <div className="card space-y-1 text-center shadow-soft">
        <p className="text-sm text-stone-500">Từ tiếng Trung nào có nghĩa là</p>
        <p className="break-words text-2xl font-bold">{shortMeaning(q.word.meaningVi)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((o) => {
          const isAnswer = o.id === q.word.id;
          const state = !answered ? 'bg-white hover:border-brand hover:bg-brand-soft'
            : isAnswer ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-800'
            : o.id === picked ? 'animate-shake border-red-400 bg-red-50 text-red-800' : 'bg-white opacity-50';
          return (
            <button key={o.id} disabled={answered} onClick={() => { setPicked(o.id); if (isAnswer) setScore((s) => s + 1); }}
              className={`rounded-xl border border-stone-200 px-3 py-3 text-center transition ${state}`}>
              <span className="hanzi block break-words text-2xl">{o.hanzi}</span>
              {answered && <span className="block text-xs text-stone-500">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>
      {answered && <button className="btn-primary w-full" onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }}>{i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp theo'}</button>}
    </div>
  );
}

/* ---------- Gõ pinyin ---------- */
function PinyinGame({ level, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: QuizQ[] }>(`/quiz?level=${level}&count=10`);
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <p>Đang tải…</p>;
  const qs = data.questions;
  if (done) return <Result score={score} total={qs.length} onAgain={onAgain} onExit={onExit} />;

  const w = qs[i].word;
  const check = () => {
    const ok = normPinyin(text) !== '' && normPinyin(text) === normPinyin(w.pinyin || '');
    setResult(ok);
    if (ok) setScore((s) => s + 1);
  };
  const next = () => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setText(''); setResult(null); } };

  return (
    <div className="space-y-4">
      <Header i={i} total={qs.length} score={score} />
      <div className="card space-y-2 text-center shadow-soft">
        <div className="hanzi break-words text-6xl">{w.hanzi}</div>
        <p className="text-sm text-stone-500">{shortMeaning(w.meaningVi)}</p>
        <SpeakButton text={w.hanzi} label />
      </div>
      <input
        autoFocus value={text} disabled={result !== null} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { if (result === null) check(); else next(); } }}
        placeholder="Gõ pinyin, ví dụ: ni hao" className="input text-center text-lg"
      />
      {result !== null && (
        <div className={`card animate-pop space-y-1 text-center ${result ? 'border-emerald-300 bg-emerald-50' : 'animate-shake border-red-300 bg-red-50'}`}>
          <p className={`font-semibold ${result ? 'text-emerald-700' : 'text-red-700'}`}>{result ? 'Chính xác!' : 'Chưa đúng'}</p>
          <p className="text-xl text-brand">{w.pinyin}</p>
        </div>
      )}
      {result === null
        ? <div className="grid grid-cols-2 gap-2"><button className="btn-ghost" onClick={() => { setResult(false); }}>Bỏ qua</button><button className="btn-primary" disabled={!text.trim()} onClick={check}>Kiểm tra</button></div>
        : <button className="btn-primary w-full" onClick={next}>{i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp theo'}</button>}
    </div>
  );
}

/* ---------- Trang chính ---------- */
export default function ExercisesPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);

  if (mode) {
    const Game = { cloze: ClozeGame, order: OrderGame, reverse: ReverseGame, pinyin: PinyinGame }[mode];
    const meta = MODES.find((m) => m.id === mode)!;
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center gap-2">
          <button className="btn-ghost !px-3 !py-1.5" onClick={() => setMode(null)}>← Quay lại</button>
          <span className={`hanzi flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl text-white shadow-sm ${meta.grad}`}>{meta.glyph}</span>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{meta.title} · HSK {level}</h1>
        </div>
        <Game key={`${mode}-${level}-${round}`} level={level} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Luyện tập</h1>
        <p className="text-sm text-stone-500">Chọn cấp độ và dạng bài.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((l) => <button key={l} onClick={() => setLevel(l)} className={l === level ? 'btn-primary' : 'btn-ghost'}>HSK {l}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{ animationDelay: `${i * 70}ms` }}
            className="card group flex animate-fade-up items-center gap-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-soft">
            <span className={`hanzi flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-4xl text-white shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${m.grad}`}>{m.glyph}</span>
            <span className="min-w-0">
              <span className="block font-semibold group-hover:text-brand">{m.title}</span>
              <span className="mt-0.5 block text-sm text-stone-600">{m.desc}</span>
            </span>
          </button>
        ))}
        <Link href="/quiz" style={{ animationDelay: '280ms' }}
          className="card group flex animate-fade-up items-center gap-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-soft">
          <span className="hanzi flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-4xl text-white shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">测</span>
          <span className="min-w-0">
            <span className="block font-semibold group-hover:text-brand">Quiz từ vựng</span>
            <span className="mt-0.5 block text-sm text-stone-600">Chọn nghĩa hoặc nghe và chọn chữ Hán.</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
