'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import { speak } from '@/lib/speak';
import CountPicker from '@/components/CountPicker';
import PageHeader from '@/components/PageHeader';
import { AnswerPanel, GameHeader, GameResult, useCombo } from '@/components/game/GameBits';

type Mode = 'meaning' | 'listen';
type Question = { word: Word; options: Word[] };

const short = (w: Word) => (w.meaningVi || '').split(';')[0].trim();
const MODES: { id: Mode; glyph: string; title: string; desc: string }[] = [
  { id: 'meaning', glyph: '义', title: 'Nhận diện nghĩa tiếng Việt', desc: 'Quan sát mặt chữ Hán, lựa chọn giải nghĩa tiếng Việt chuẩn xác.' },
  { id: 'listen', glyph: '听', title: 'Nghe phát âm chọn chữ Hán', desc: 'Nghe phát âm chuẩn, nhận diện chữ Hán tương ứng.' },
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

  useEffect(() => {
    if (!sp.get('count')) {
      const n = Number(localStorage.getItem('hsk_count'));
      if (n >= 3 && n <= 50) setCount(n);
    }
  }, [sp]);

  const changeCount = (n: number) => {
    setCount(n);
    localStorage.setItem('hsk_count', String(n));
  };

  async function start() {
    setErr('');
    setBusy(true);
    try {
      const res = await api<{ questions: Question[] }>(`/quiz?level=${level}&count=${count}`);
      setQs(res.questions);
      setI(0);
      setScore(0);
      setPicked(null);
      setPhase('play');
      if (mode === 'listen') speak(res.questions[0].word.hanzi, res.questions[0].word.audioUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Có lỗi xảy ra khi chuẩn bị bài trắc nghiệm');
    }
    setBusy(false);
  }

  function choose(opt: Word) {
    if (picked !== null) return;
    const ok = opt.id === qs[i].word.id;
    setPicked(opt.id);
    record(ok);
    if (ok) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= qs.length) {
      setPhase('end');
      return;
    }
    setI(i + 1);
    setPicked(null);
    if (mode === 'listen') speak(qs[i + 1].word.hanzi, qs[i + 1].word.audioUrl);
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          glyph="测"
          title="Quiz trắc nghiệm từ vựng"
          subtitle="Kiểm tra phản xạ nghĩa tiếng Việt và nhận diện thính giác theo chuẩn HSK"
        />

        <section className="editorial-card space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-stone-600">
              Cấp độ HSK
            </span>
            <div role="group" aria-label="Chọn cấp độ trắc nghiệm" className="inline-flex rounded-xl border border-line bg-brand-soft/40 p-1">
              {[1, 2, 3].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  aria-pressed={l === level}
                  className={`min-h-[44px] rounded-lg px-4 text-xs font-bold transition-all ${
                    l === level
                      ? 'border border-brand/40 bg-white text-brand-ink shadow-sm'
                      : 'text-stone-600 hover:text-ink'
                  }`}
                >
                  HSK {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-stone-600">
              Số câu hỏi
            </span>
            <CountPicker value={count} onChange={changeCount} />
          </div>
        </section>

        <div className="editorial-card overflow-hidden">
          <div className="border-b border-line bg-brand-soft/30 px-5 py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Chế độ kiểm tra
            </span>
          </div>
          <ul className="divide-y divide-line">
            {MODES.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode === m.id}
                  className={`flex min-h-[72px] w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
                    mode === m.id ? 'bg-brand-soft/40' : 'hover:bg-brand-soft/20'
                  }`}
                >
                  <span
                    lang="zh-Hans"
                    aria-hidden
                    className={`hanzi flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl font-bold transition-colors ${
                      mode === m.id
                        ? 'bg-brand text-white'
                        : 'bg-brand-soft text-brand-ink'
                    }`}
                  >
                    {m.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-ink">{m.title}</h3>
                    <p className="mt-0.5 text-xs text-stone-600">{m.desc}</p>
                  </div>
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      mode === m.id ? 'border-brand bg-brand' : 'border-line'
                    }`}
                  >
                    {mode === m.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {err && (
          <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
            {err}
          </p>
        )}

        <button
          className="btn-editorial-primary w-full !py-3.5 text-xs font-bold"
          disabled={busy}
          onClick={start}
        >
          {busy ? 'Đang chuẩn bị câu hỏi…' : `Bắt đầu trắc nghiệm (${count} câu)`}
        </button>
      </div>
    );
  }

  if (phase === 'end') {
    return (
      <div className="mx-auto max-w-md">
        <GameResult
          score={score}
          total={qs.length}
          best={best}
          onAgain={() => setPhase('setup')}
          onExit={() => setPhase('setup')}
        />
      </div>
    );
  }

  const q = qs[i];
  const answered = picked !== null;
  const ok = picked === q.word.id;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />

      <div className="editorial-card flex min-h-[11rem] flex-col items-center justify-center p-6 text-center sm:p-8">
        <span className="editorial-badge mb-2">
          {mode === 'meaning' ? 'NHÌN CHỮ CHỌN NGHĨA' : 'NGHE PHÁT ÂM CHỌN CHỮ'}
        </span>
        {mode === 'meaning' ? (
          <>
            <div lang="zh-Hans" className="hanzi break-words text-5xl font-bold leading-tight text-ink sm:text-6xl">
              {q.word.hanzi}
            </div>
            <div className="pinyin mt-1 h-5 text-xs font-semibold text-brand-ink">
              {answered ? q.word.pinyin : ''}
            </div>
          </>
        ) : (
          <div className="py-2">
            <button
              className="btn-editorial-primary !min-h-[44px] !px-6 text-xs"
              onClick={() => speak(q.word.hanzi, q.word.audioUrl)}
            >
              Phát âm lại âm thanh
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        {q.options.map((o, k) => {
          const correct = o.id === q.word.id;
          const state = !answered
            ? 'border-line bg-white hover:border-brand hover:bg-brand-soft/30 text-ink active:translate-y-px shadow-sm'
            : correct
            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-sm'
            : o.id === picked
            ? 'border-rose-400 bg-rose-50 text-rose-800 font-semibold'
            : 'border-line bg-white opacity-40 text-stone-600';
          return (
            <button
              key={o.id}
              disabled={answered}
              onClick={() => choose(o)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${state}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  answered && correct
                    ? 'bg-emerald-600 text-white'
                    : answered && o.id === picked
                    ? 'bg-rose-500 text-white'
                    : 'bg-brand-soft text-brand-ink'
                }`}
              >
                {answered && correct ? '✓' : answered && o.id === picked ? '✕' : k + 1}
              </span>
              {mode === 'meaning' ? (
                <span className="min-w-0 break-words text-xs font-medium">{short(o)}</span>
              ) : (
                <span className="hanzi min-w-0 text-xl font-bold text-ink">
                  {o.hanzi}
                  {answered && <span className="pinyin ml-2 font-sans text-xs text-brand-ink">{o.pinyin}</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <AnswerPanel
          ok={ok}
          hanzi={q.word.hanzi}
          pinyin={q.word.pinyin}
          meaning={q.word.meaningVi}
          audioUrl={q.word.audioUrl}
        />
      )}

      {answered && (
        <button
          className="btn-editorial-primary w-full animate-fade-up !py-3.5 text-xs font-bold"
          onClick={next}
        >
          {i + 1 >= qs.length ? 'Hoàn thành và xem kết quả' : 'Câu tiếp theo'} →
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<p className="text-xs text-stone-500">Đang chuẩn bị giao diện quiz…</p>}>
      <QuizInner />
    </Suspense>
  );
}
