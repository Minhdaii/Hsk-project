'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import type { GExType, GGraded, GQuestion } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import Skeleton from '@/components/Skeleton';
import ZhMix from '@/components/ZhMix';

const TYPES: { id: GExType; title: string; desc: string; skin: string }[] = [
  { id: 'order', title: 'Sắp xếp từ thành câu', desc: 'Xếp các từ theo đúng trật tự ngữ pháp.', skin: 'order' },
  { id: 'cloze', title: 'Điền thành phần còn thiếu', desc: 'Chọn từ hoặc cấu trúc đúng cho chỗ trống.', skin: 'cloze' },
  { id: 'choose', title: 'Chọn câu đúng ngữ pháp', desc: 'Phân biệt câu đúng với câu sai.', skin: 'dialogue' },
  { id: 'fix', title: 'Tìm và sửa lỗi sai', desc: 'Cho một câu sai, chọn cách sửa đúng.', skin: 'listen' },
  { id: 'match', title: 'Ghép cấu trúc với ý nghĩa', desc: 'Nối công thức với cách dùng của nó.', skin: 'match' },
  { id: 'translate', title: 'Dịch câu Việt sang Trung', desc: 'Dựng câu tiếng Trung từ các từ cho sẵn.', skin: 'order' },
];
const LEVELS: { v: number | null; label: string }[] = [{ v: null, label: 'Tất cả' }, { v: 1, label: 'HSK 1' }, { v: 2, label: 'HSK 2' }, { v: 3, label: 'HSK 3' }, { v: 0, label: 'Ngoài HSK' }];

function Practice() {
  const sp = useSearchParams();
  const { user } = useUser();
  const grammarId = Number(sp.get('grammarId')) || 0;
  const [type, setType] = useState<GExType>((TYPES.find((t) => t.id === sp.get('type'))?.id) ?? 'order');
  const [level, setLevel] = useState<number | null>(null);
  const [count, setCount] = useState(10);
  const [qs, setQs] = useState<GQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    setLoading(true); setError('');
    const p = new URLSearchParams({ type, count: String(count) });
    if (grammarId) p.set('grammarId', String(grammarId)); else if (level !== null) p.set('level', String(level));
    try {
      const r = await api<{ questions: GQuestion[] }>(`/grammar/exercises?${p}`);
      if (!r.questions.length) setError('Chưa đủ dữ liệu cho dạng bài này ở phạm vi đã chọn. Hãy thử dạng bài hoặc cấp độ khác.');
      else { setQs(r.questions); setI(0); setScore(0); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được bài tập'); } finally { setLoading(false); }
  };

  const skin = TYPES.find((t) => t.id === type)!.skin;

  if (qs && i >= qs.length) {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center">
        <div className="lab-surface space-y-2 p-8">
          <p className="text-sm font-semibold text-stone-600">Kết quả</p>
          <p className="text-6xl font-extrabold tabular-nums">{score}<span className="text-3xl text-stone-500">/{qs.length}</span></p>
          <p className="text-stone-700">{pct >= 80 ? 'Rất tốt, bạn nắm chắc phần này.' : pct >= 50 ? 'Khá ổn, hãy xem lại các câu sai.' : 'Hãy đọc lại cấu trúc rồi thử lần nữa.'}</p>
          {!user && <p className="text-sm text-stone-600">Kết quả chưa được lưu. <Link href="/login" className="font-semibold text-brand-ink underline">Đăng nhập</Link> để theo dõi tiến độ.</p>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button className="btn-primary !min-h-[48px]" onClick={start}>Làm bộ khác</button>
          <button className="btn-ghost !min-h-[48px]" onClick={() => setQs(null)}>Đổi dạng bài</button>
          <Link href="/grammar" className="btn-ghost !min-h-[48px]">Về ngữ pháp</Link>
        </div>
      </div>
    );
  }

  if (qs) {
    return (
      <div data-game={skin} className="lab-game mx-auto max-w-lg space-y-4">
        <div className="flex items-center gap-3 border-b border-line pb-3">
          <button className="btn-ghost !px-3" onClick={() => setQs(null)}>← Thoát</button>
          <h1 className="min-w-0 flex-1 truncate font-bold">{TYPES.find((t) => t.id === type)!.title}</h1>
          <span className="text-sm tabular-nums text-stone-600">Câu {i + 1}/{qs.length}</span>
        </div>
        <div role="progressbar" aria-label="Tiến độ" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={i} className="h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="g-bar h-full rounded-full transition-[width] duration-300" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
        <Question key={i} q={qs[i]} onDone={(ok) => { if (ok) setScore((s) => s + 1); setI(i + 1); }} last={i + 1 >= qs.length} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header>
        <Link href="/grammar" className="inline-flex min-h-[44px] items-center text-sm text-stone-600 hover:text-ink hover:underline">← Ngữ pháp</Link>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Luyện tập ngữ pháp</h1>
        <p className="mt-1 text-stone-600">{grammarId ? 'Bài tập về cấu trúc bạn vừa xem.' : 'Sáu dạng bài, câu hỏi sinh từ ví dụ ngữ pháp có trong hệ thống.'}</p>
      </header>

      <fieldset>
        <legend className="mb-2 font-bold">Dạng bài</legend>
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {TYPES.map((t) => (
            <li key={t.id}>
              <label className={`flex min-h-[64px] cursor-pointer items-center gap-3 px-4 py-2.5 ${type === t.id ? 'bg-brand-soft' : 'hover:bg-stone-50'}`}>
                <input type="radio" name="dang-bai" checked={type === t.id} onChange={() => setType(t.id)} className="h-5 w-5 accent-[rgb(91,63,209)]" />
                <span className="min-w-0 flex-1"><span className="block font-semibold">{t.title}</span><span className="block text-sm text-stone-600">{t.desc}</span></span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="lab-surface flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        {!grammarId && (
          <div role="group" aria-label="Cấp độ" className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 w-14 text-sm font-semibold text-stone-600">Cấp độ</span>
            {LEVELS.map((l) => <button key={l.label} onClick={() => setLevel(l.v)} aria-pressed={level === l.v} className={`min-h-[44px] rounded-lg border px-3 text-sm font-bold ${level === l.v ? 'border-brand-ink/50 bg-brand text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400'}`}>{l.label}</button>)}
          </div>
        )}
        <div role="group" aria-label="Số câu" className="flex items-center gap-1.5">
          <span className="mr-1 w-14 text-sm font-semibold text-stone-600">Số câu</span>
          {[5, 10, 15].map((n) => <button key={n} onClick={() => setCount(n)} aria-pressed={count === n} className={`min-h-[44px] min-w-[44px] rounded-lg border px-3 text-sm font-bold ${count === n ? 'border-brand-ink/50 bg-brand text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400'}`}>{n}</button>)}
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      <button className="btn-primary !min-h-[52px] w-full text-base" onClick={start} disabled={loading}>{loading ? 'Đang tạo bài…' : 'Bắt đầu'}</button>
      {!user && <p className="text-center text-sm text-stone-600">Bạn vẫn làm bài được khi chưa đăng nhập, nhưng kết quả sẽ không được lưu.</p>}
    </div>
  );
}

/** Một câu hỏi: nhận đáp án, gọi server chấm điểm, hiển thị lời giải rồi chuyển câu */
function Question({ q, onDone, last }: { q: GQuestion; onDone: (ok: boolean) => void; last: boolean }) {
  const [result, setResult] = useState<GGraded | null>(null);
  const [matchRes, setMatchRes] = useState<{ left: number; right: number; correct: boolean }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [bank, setBank] = useState<{ id: number; t: string }[]>(() => ('tokens' in q ? q.tokens.map((t, k) => ({ id: k, t })) : []));
  const [ans, setAns] = useState<{ id: number; t: string }[]>([]);
  const [selL, setSelL] = useState<number | null>(null);
  const [pairs, setPairs] = useState<{ left: number; right: number }[]>([]);

  const submit = async (answer: unknown) => {
    if (q.type === 'match') return;
    setBusy(true); setErr('');
    try { setResult(await api<GGraded>('/grammar/exercises/answer', { method: 'POST', body: { type: q.type, grammarId: q.grammarId, exampleId: q.exampleId, answer } })); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'Không chấm được, hãy thử lại'); } finally { setBusy(false); }
  };
  const submitMatch = async (p: { left: number; right: number }[]) => {
    setBusy(true); setErr('');
    try { const r = await api<{ correct: boolean; results: { left: number; right: number; correct: boolean }[] }>('/grammar/exercises/answer', { method: 'POST', body: { type: 'match', pairs: p } }); setMatchRes(r.results); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'Không chấm được, hãy thử lại'); } finally { setBusy(false); }
  };

  const done = result !== null || matchRes !== null;
  const ok = result ? result.correct : matchRes ? matchRes.every((r) => r.correct) : false;
  const choose = (o: string) => { if (done || busy) return; setPicked(o); submit(o); };
  const optState = (o: string) => !result ? '' : o === result.solution || (q.type === 'cloze' && o === picked && result.correct) ? '!border-emerald-500 bg-emerald-50 text-emerald-950' : o === picked ? 'animate-shake !border-red-400 bg-red-50 text-red-900' : 'opacity-40';

  return (
    <div className="space-y-4">
      {(q.type === 'order' || q.type === 'translate') && (
        <>
          <div className="lab-surface g-rule p-5">
            <p className="text-xs font-semibold text-stone-600">{q.type === 'order' ? 'Xếp thành câu tiếng Trung có nghĩa:' : 'Dịch sang tiếng Trung (có từ thừa, hãy chọn đúng):'}</p>
            <p className="mt-1 text-xl font-bold leading-snug sm:text-2xl">{q.prompt}</p>
          </div>
          <div className={`flex min-h-[5rem] flex-wrap items-end gap-2 border-b-[3px] px-1 pb-2 pt-3 ${!result ? 'g-line' : result.correct ? 'border-emerald-500' : 'animate-shake border-red-400'}`}>
            {ans.length === 0 && <span className="pb-1 text-sm text-stone-500">Chạm các từ bên dưới để đặt vào dòng…</span>}
            {ans.map((c) => <button key={c.id} disabled={done} onClick={() => { setAns(ans.filter((x) => x.id !== c.id)); setBank([...bank, c]); }} lang="zh-Hans" className="lab-key hanzi g-soft g-line min-h-[48px] animate-pop px-3.5 text-xl">{c.t}</button>)}
          </div>
          <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-2 pt-1">
            {bank.map((c) => <button key={c.id} disabled={done} onClick={() => { setBank(bank.filter((x) => x.id !== c.id)); setAns([...ans, c]); }} lang="zh-Hans" className="lab-key hanzi min-h-[48px] px-3.5 text-xl">{c.t}</button>)}
          </div>
          {!done && <button className="btn-primary w-full !min-h-[48px]" disabled={ans.length === 0 || busy} onClick={() => submit(ans.map((x) => x.t))}>Kiểm tra</button>}
        </>
      )}

      {q.type === 'cloze' && (
        <>
          <figure className="lab-surface space-y-3 border-l-4 p-5 g-line !border-l-[rgb(var(--g))]">
            <p className="text-xs font-semibold text-stone-600">Chọn từ điền vào chỗ trống:</p>
            <div lang="zh-Hans" className="hanzi break-words text-3xl leading-relaxed">{q.before}<span className={`mx-1.5 inline-block min-w-[3.5rem] border-b-[3px] px-1.5 text-center ${!result ? 'g-line text-transparent' : result.correct ? 'border-emerald-600 text-emerald-800' : 'border-red-500 text-red-600'}`}>{picked && result ? picked : '＿＿'}</span>{q.after}</div>
            {q.prompt && <figcaption className="text-sm text-stone-600">{q.prompt}</figcaption>}
          </figure>
          <div className="grid grid-cols-2 gap-2.5">{q.options.map((o) => <button key={o} disabled={done || busy} onClick={() => choose(o)} className={`lab-key min-h-[64px] px-3 text-center ${optState(o)}`}><span lang="zh-Hans" className="hanzi text-3xl">{o}</span></button>)}</div>
        </>
      )}

      {(q.type === 'choose' || q.type === 'fix') && (
        <>
          <div className="lab-surface g-rule p-5">
            <p className="text-xs font-semibold text-stone-600">{q.type === 'choose' ? `Câu nào đúng ngữ pháp? (${q.prompt})` : 'Câu sau có lỗi. Chọn cách sửa đúng:'}</p>
            {q.type === 'fix' && <><p lang="zh-Hans" className="hanzi mt-2 break-words text-2xl text-red-900 line-through decoration-red-400/70">{q.wrong}</p>{q.prompt && <p className="mt-1 text-sm text-stone-600">Ý định: {q.prompt}</p>}</>}
          </div>
          <div className="space-y-2.5">{q.options.map((o) => <button key={o} disabled={done || busy} onClick={() => choose(o)} className={`lab-key block min-h-[60px] w-full px-4 py-3 text-left ${optState(o)}`}><span lang="zh-Hans" className="hanzi text-2xl">{o}</span></button>)}</div>
        </>
      )}

      {q.type === 'match' && (
        <>
          <p className="text-sm text-stone-600">Chạm một công thức ở cột trái, rồi chạm cách dùng tương ứng ở cột phải.</p>
          <div className="space-y-2.5">
            {q.left.map((l) => {
              const p = pairs.find((x) => x.left === l.grammarId);
              const res = matchRes?.find((x) => x.left === l.grammarId);
              return (
                <div key={l.grammarId} className="space-y-1.5">
                  <button disabled={done || !!p} onClick={() => setSelL(l.grammarId)} aria-pressed={selL === l.grammarId}
                    className={`lab-key block min-h-[56px] w-full px-4 py-2 text-left ${selL === l.grammarId ? 'g-line g-soft !border-[rgb(var(--g))]' : ''} ${res ? (res.correct ? '!border-emerald-500 bg-emerald-50' : 'animate-shake !border-red-400 bg-red-50') : ''}`}>
                    <span className="block break-words text-lg"><ZhMix text={l.label} /></span>
                    {p && <span className="mt-1 block text-sm text-stone-700">→ {q.right.find((r) => r.grammarId === p.right)?.text}</span>}
                  </button>
                </div>
              );
            })}
          </div>
          {!done && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-600">Cách dùng:</p>
              {q.right.filter((r) => !pairs.some((p) => p.right === r.grammarId)).map((r) => (
                <button key={r.grammarId} disabled={selL === null || busy}
                  onClick={() => { const np = [...pairs, { left: selL!, right: r.grammarId }]; setPairs(np); setSelL(null); if (np.length === q.left.length) submitMatch(np); }}
                  className="lab-key block min-h-[52px] w-full px-4 py-2 text-left text-sm disabled:opacity-60">{r.text}</button>
              ))}
              {pairs.length > 0 && <button className="btn-ghost" onClick={() => { setPairs([]); setSelL(null); }}>Làm lại các cặp</button>}
            </div>
          )}
        </>
      )}

      {err && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{err}</p>}

      {done && (
        <div role="status" aria-live="polite" className={`animate-fade-up space-y-1.5 rounded-xl border p-4 ${ok ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
          <p className={`font-bold ${ok ? 'text-emerald-900' : 'text-red-900'}`}>{ok ? '✓ Chính xác!' : '✕ Chưa đúng'}</p>
          {result && (
            <>
              {!result.correct && <p className="text-sm text-stone-800">Đáp án: <span lang="zh-Hans" className="hanzi text-lg">{result.solution}</span></p>}
              {result.correct && <p lang="zh-Hans" className="hanzi text-lg text-emerald-950">{result.solution}</p>}
              {result.explanation && <p className="text-sm text-stone-700">{result.explanation}</p>}
              <SpeakButton text={result.solution} label />
            </>
          )}
          {matchRes && <p className="text-sm text-stone-700">Đúng {matchRes.filter((r) => r.correct).length}/{matchRes.length} cặp.</p>}
        </div>
      )}
      {done && <button className="btn-primary w-full !min-h-[48px]" onClick={() => onDone(ok)}>{last ? 'Xem kết quả' : 'Câu tiếp theo'}</button>}
    </div>
  );
}

export default function GrammarPracticePage() {
  return <Suspense fallback={<Skeleton className="mx-auto h-72 max-w-2xl" />}><Practice /></Suspense>;
}
