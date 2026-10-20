'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import { LEVEL_STYLE } from '@/lib/levels';
import { speak } from '@/lib/speak';
import CountPicker from '@/components/CountPicker';
import SpeakButton from '@/components/SpeakButton';
import { AnswerPanel, GameHeader, GameResult, useCombo } from '@/components/game/GameBits';

type Mode = 'meaning' | 'listen';
type Question = { word: Word; options: Word[] };

const short = (w: Word) => (w.meaningVi || '').split(';')[0].trim();
const MODES: { id: Mode; glyph: string; grad: string; title: string; desc: string }[] = [
  { id: 'meaning', glyph: '义', grad: 'from-emerald-500 to-emerald-700', title: 'Chọn nghĩa', desc: 'Nhìn chữ Hán, chọn nghĩa tiếng Việt đúng.' },
  { id: 'listen', glyph: '听', grad: 'from-sky-500 to-sky-700', title: 'Nghe chọn chữ', desc: 'Nghe phát âm, chọn chữ Hán tương ứng.' },
];

function QuizInner() {
  const sp = useSearchParams();
  const [level, setLevel] = useState(Math.min(3, Math.max(1, Number(sp.get('level')) || 1)));
  const [count, setCount] = useState(Math.min(50, Math.max(3, Number(sp.get('count')) || 10)));
  const [mode, setMode] = useState<Mode>('meaning');
  const [qs, setQs] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'play' | 'end'>('setup');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { combo, best, record } = useCombo();

  useEffect(() => { if (!sp.get('count')) { const n = Number(localStorage.getItem('hsk_count')); if (n >= 3 && n <= 50) setCount(n); } }, [sp]);
  const changeCount = (n: number) => { setCount(n); localStorage.setItem('hsk_count', String(n)); };

  async function start() {
    setErr(''); setBusy(true);
    try {
      const res = await api<{ questions: Question[] }>(`/quiz?level=${level}&count=${count}`);
      setQs(res.questions); setI(0); setScore(0); setPicked(null); setPhase('play');
      if (mode === 'listen') speak(res.questions[0].word.hanzi, res.questions[0].word.audioUrl);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Có lỗi xảy ra'); }
    setBusy(false);
  }

  function choose(opt: Word) {
    if (picked !== null) return;
    const ok = opt.id === qs[i].word.id;
    setPicked(opt.id); record(ok); if (ok) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= qs.length) { setPhase('end'); return; }
    setI(i + 1); setPicked(null);
    if (mode === 'listen') speak(qs[i + 1].word.hanzi, qs[i + 1].word.audioUrl);
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-soft sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
          <span aria-hidden className="hanzi pointer-events-none absolute -right-2 -top-6 animate-float select-none text-[9rem] leading-none text-white/10">测</span>
          <div className="relative">
            <h1 className="text-3xl font-bold sm:text-4xl">Quiz từ vựng</h1>
            <p className="mt-1.5 text-white/85">Trắc nghiệm nhanh theo cấp độ HSK.</p>
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
          {MODES.map((m) => (
            <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
              className={`group relative min-h-[8.5rem] overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-left text-white shadow-lg transition-all duration-300 hover:-translate-y-1 ${m.grad} ${mode === m.id ? 'ring-4 ring-brand/30 ring-offset-2 ring-offset-paper' : 'opacity-70 hover:opacity-100'}`}>
              <span aria-hidden className="hanzi pointer-events-none absolute -bottom-6 -right-2 select-none text-[8rem] leading-none text-white/20 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">{m.glyph}</span>
              <div className="relative">
                <div className="flex items-center gap-2 text-xl font-bold">{m.title}{mode === m.id && <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs">Đang chọn</span>}</div>
                <p className="mt-1 max-w-[14rem] text-sm text-white/85">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {err && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{err}</p>}
        <button className="btn-primary w-full !py-3.5 text-base" disabled={busy} onClick={start}>{busy ? 'Đang chuẩn bị…' : `Bắt đầu · ${count} câu`}</button>
      </div>
    );
  }

  if (phase === 'end') {
    return <div className="mx-auto max-w-md"><GameResult score={score} total={qs.length} best={best} onAgain={() => setPhase('setup')} onExit={() => setPhase('setup')} /></div>;
  }

  const q = qs[i];
  const answered = picked !== null;
  const ok = picked === q.word.id;
  return (
    <div className="mx-auto max-w-md space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <div className="card flex min-h-[10.5rem] flex-col items-center justify-center overflow-hidden text-center shadow-soft">
        <div className={`-mx-5 -mt-5 mb-3 h-1.5 w-[calc(100%+2.5rem)] bg-gradient-to-r ${mode === 'meaning' ? 'from-emerald-500 to-emerald-700' : 'from-sky-500 to-sky-700'}`} />
        {mode === 'meaning' ? (
          <>
            <div className="hanzi break-words text-6xl leading-tight">{q.word.hanzi}</div>
            <div className="mt-1 h-6 font-medium text-brand">{answered ? q.word.pinyin : ''}</div>
          </>
        ) : (
          <button className="btn-primary !px-6 !py-3" onClick={() => speak(q.word.hanzi, q.word.audioUrl)}>🔊 Nghe lại</button>
        )}
      </div>
      <div className="grid gap-2.5">
        {q.options.map((o, k) => {
          const correct = o.id === q.word.id;
          const state = !answered ? 'bg-white hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand-soft hover:shadow-md active:scale-[0.98]'
            : correct ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-800'
            : o.id === picked ? 'animate-shake border-red-400 bg-red-50 text-red-800' : 'bg-white opacity-50';
          return (
            <button key={o.id} disabled={answered} onClick={() => choose(o)}
              className={`flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3.5 text-left shadow-sm transition-all duration-200 ${state}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${answered && correct ? 'bg-emerald-500 text-white' : answered && o.id === picked ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {answered && correct ? '✓' : answered && o.id === picked ? '✕' : k + 1}
              </span>
              {mode === 'meaning'
                ? <span className="min-w-0 break-words font-medium">{short(o)}</span>
                : <span className="hanzi min-w-0 text-2xl">{o.hanzi}{answered && <span className="ml-2 font-sans text-sm text-stone-500">{o.pinyin}</span>}</span>}
            </button>
          );
        })}
      </div>
      {answered && <AnswerPanel ok={ok} hanzi={q.word.hanzi} pinyin={q.word.pinyin} meaning={q.word.meaningVi} audioUrl={q.word.audioUrl} />}
      {answered && <button className="btn-primary w-full animate-fade-up !py-3 text-base" onClick={next}>{i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp theo'} →</button>}
    </div>
  );
}

export default function QuizPage() {
  return <Suspense fallback={<p>Đang tải…</p>}><QuizInner /></Suspense>;
}
