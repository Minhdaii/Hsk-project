'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import { speak } from '@/lib/speak';
import Confetti from '@/components/Confetti';

type Mode = 'meaning' | 'listen';
type Question = { word: Word; options: Word[] };
const N = 10;

const short = (w: Word) => (w.meaningVi || '').split(';')[0].trim();

export default function QuizPage() {
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState<Mode>('meaning');
  const [qs, setQs] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'play' | 'end'>('setup');
  const [err, setErr] = useState('');

  async function start() {
    setErr('');
    let questions: Question[];
    try {
      const res = await api<{ questions: Question[] }>(`/quiz?level=${level}&count=${N}`);
      questions = res.questions;
    } catch (e) { setErr(e instanceof Error ? e.message : 'Có lỗi xảy ra'); return; }
    setQs(questions); setI(0); setScore(0); setPicked(null); setPhase('play');
    if (mode === 'listen') speak(questions[0].word.hanzi);
  }

  function choose(opt: Word) {
    if (picked !== null) return;
    setPicked(opt.id);
    if (opt.id === qs[i].word.id) setScore((s) => s + 1);
  }

  function next() {
    if (i + 1 >= qs.length) { setPhase('end'); return; }
    setI(i + 1); setPicked(null);
    if (mode === 'listen') speak(qs[i + 1].word.hanzi);
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Quiz từ vựng</h1>
        <div className="card space-y-5">
          <div>
            <div className="mb-2 text-sm font-medium text-stone-500">Cấp độ</div>
            <div className="flex gap-2">{[1, 2, 3].map((l) => <button key={l} onClick={() => setLevel(l)} className={l === level ? 'btn-primary' : 'btn-ghost'}>HSK {l}</button>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-stone-500">Dạng bài</div>
            <div className="flex gap-2">
              <button onClick={() => setMode('meaning')} className={mode === 'meaning' ? 'btn-primary' : 'btn-ghost'}>Chọn nghĩa</button>
              <button onClick={() => setMode('listen')} className={mode === 'listen' ? 'btn-primary' : 'btn-ghost'}>Nghe chọn chữ</button>
            </div>
          </div>
          <button className="btn-primary w-full" onClick={start}>Bắt đầu ({N} câu)</button>
          {err && <p className="text-sm text-brand">{err}</p>}
        </div>
      </div>
    );
  }

  if (phase === 'end') {
    return (
      <div className="card mx-auto max-w-md animate-pop space-y-3 text-center">
        {score >= 8 && <Confetti />}
        <div className="text-4xl">{score >= 8 ? '🏆' : score >= 5 ? '👍' : '💪'}</div>
        <p className="text-2xl font-bold">{score}/{qs.length} câu đúng</p>
        <button className="btn-primary" onClick={() => setPhase('setup')}>Làm lại</button>
      </div>
    );
  }

  const q = qs[i];
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex justify-between text-sm font-medium text-stone-500"><span>Câu {i + 1}/{qs.length}</span><span>Điểm: {score}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200"><div className="bar-fill h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${((i + (picked !== null ? 1 : 0)) / qs.length) * 100}%` }} /></div>
      <div className="card flex min-h-[10rem] flex-col items-center justify-center text-center shadow-soft">
        {mode === 'meaning' ? (
          <>
            <div className="hanzi break-words text-6xl">{q.word.hanzi}</div>
            <div className="mt-1 text-brand">{picked !== null ? q.word.pinyin : ''}</div>
          </>
        ) : (
          <button className="btn-primary" onClick={() => speak(q.word.hanzi)}>🔊 Nghe lại</button>
        )}
      </div>
      <div className="grid gap-2">
        {q.options.map((o) => {
          const correct = o.id === q.word.id;
          const state = picked === null ? 'bg-white hover:border-brand hover:bg-brand-soft' : correct ? 'animate-pop bg-emerald-50 border-emerald-400 text-emerald-800' : o.id === picked ? 'animate-shake bg-red-50 border-red-400 text-red-800' : 'bg-white opacity-50';
          return (
            <button key={o.id} onClick={() => choose(o)} className={`break-words rounded-xl border border-stone-200 px-4 py-3 text-left transition ${state}`}>
              {mode === 'meaning' ? short(o) : <span className="hanzi text-2xl">{o.hanzi} <span className="text-sm text-stone-500">{picked !== null ? o.pinyin : ''}</span></span>}
            </button>
          );
        })}
      </div>
      {picked !== null && <button className="btn-primary w-full" onClick={next}>{i + 1 >= qs.length ? 'Xem kết quả' : 'Câu tiếp theo'}</button>}
    </div>
  );
}
