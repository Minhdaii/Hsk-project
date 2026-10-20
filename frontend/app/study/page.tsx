'use client';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { speak } from '@/lib/speak';
import { intervalLabel, nextIntervalDays, type Rating } from '@/lib/sm2preview';
import type { Activity, Card, CardOption, ProgressRow, ReviewResult, StreakStatus } from '@/lib/types';
import FlipCard from '@/components/FlipCard';
import Skeleton from '@/components/Skeleton';
import StreakCelebration from '@/components/StreakCelebration';

type StreakInfo = { status: StreakStatus; streak: number; previousStreak: number };
type Outcome = { ok: boolean; rating: Rating; days: number | null; progress: ProgressRow };

// Dự phòng nếu thẻ không có đáp án trắc nghiệm
const FALLBACK: CardOption[] = [{ text: 'Tôi đã nhớ từ này', correct: true }, { text: 'Tôi chưa nhớ', correct: false }];

function StudyInner() {
  const sp = useSearchParams();
  const level = Math.min(3, Math.max(1, Number(sp.get('level') || '1')));
  const { user, loading } = useUser();
  const [queue, setQueue] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<number | null>(null); // -1 = "Chưa biết"
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [cardKey, setCardKey] = useState(0);
  const [xpPop, setXpPop] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [celebrate, setCelebrate] = useState<{ info: StreakInfo; days: Activity['days'] } | null>(null);
  const infoRef = useRef<StreakInfo | null>(null);

  useEffect(() => { setAutoSpeak(localStorage.getItem('hsk_autospeak') === '1'); }, []);
  const toggleAuto = () => setAutoSpeak((v) => { localStorage.setItem('hsk_autospeak', v ? '0' : '1'); return !v; });

  useEffect(() => {
    if (!user) return;
    setReady(false); setError(''); setCelebrate(null); infoRef.current = null;
    setPicked(null); setOutcome(null); setShown(false);
    api<{ cards: Card[] }>(`/study/session?level=${level}`)
      .then((res) => { setQueue(res.cards); setTotal(res.cards.length); setDone(0); setReady(true); })
      .catch((e) => { setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'); setReady(true); });
  }, [user, level]);

  const card = queue[0];
  const options = card ? (card.options && card.options.length > 1 ? card.options : FALLBACK) : [];

  useEffect(() => {
    if (!autoSpeak || !card) return;
    const t = setTimeout(() => speak(card.word.hanzi, card.word.audioUrl), 450);
    return () => clearTimeout(t);
  }, [cardKey, autoSpeak, card?.word.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(async (info: StreakInfo) => {
    let days: Activity['days'] = [];
    try { days = (await api<Activity>('/study/activity')).days; } catch { /* vẫn hiện hiệu ứng */ }
    setCelebrate({ info, days });
  }, []);

  /** Chọn một đáp án (idx) hoặc bấm "Chưa biết" (null). Hệ thống tự chấm: đúng = Tốt, đúng sau khi đã sai = Khó, sai = Quên */
  async function choose(idx: number | null) {
    if (busy || outcome || !card) return;
    const ok = idx !== null && !!options[idx]?.correct;
    const rating: Rating = ok ? (card.retry ? 1 : 2) : 0;
    setPicked(idx === null ? -1 : idx);
    setBusy(true);
    try {
      const res = await api<ReviewResult>('/study/review', { body: { wordId: card.word.id, rating } });
      const prev = infoRef.current;
      infoRef.current = prev && prev.status !== 'same'
        ? { ...prev, streak: res.streak }
        : { status: res.streakStatus, streak: res.streak, previousStreak: res.previousStreak };
      setXpPop((n) => n + 1);
      window.dispatchEvent(new CustomEvent('stats-changed', { detail: { streak: res.streak, xp: res.xp, studiedToday: true, atRisk: false, brokenStreak: 0 } }));
      setOutcome({ ok, rating, days: nextIntervalDays(card.progress, rating), progress: res.progress });
      setTimeout(() => setShown(true), 380); // chọn xong thẻ tự lật để xem nghĩa
      setError('');
    } catch (e) {
      setPicked(null);
      setError(e instanceof Error ? e.message : 'Không lưu được kết quả');
    }
    setBusy(false);
  }

  function next() {
    if (!outcome || !card) return;
    const rest = queue.slice(1);
    if (outcome.ok) setDone((d) => d + 1);
    else rest.push({ word: card.word, progress: outcome.progress, options: card.options, retry: true }); // trả lời sai: học lại cuối lượt
    setQueue(rest);
    setPicked(null); setOutcome(null); setShown(false); setCardKey((k) => k + 1);
    if (rest.length === 0 && infoRef.current) finish(infoRef.current);
  }

  useEffect(() => {
    if (celebrate || !card) return;
    const onKey = (e: KeyboardEvent) => {
      if (!outcome) {
        if (['1', '2', '3', '4'].includes(e.key) && Number(e.key) <= options.length) choose(Number(e.key) - 1);
        else if (e.key === '0') choose(null);
        return;
      }
      if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === ' ') { e.preventDefault(); setShown((v) => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (loading) return <Skeleton className="mx-auto h-[27rem] max-w-xl !rounded-3xl" />;
  if (!user) {
    return (
      <div className="card mx-auto max-w-md space-y-3 text-center">
        <div className="text-4xl">🔐</div>
        <p>Bạn cần đăng nhập để lưu tiến độ học và lịch ôn tập.</p>
        <Link href="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  const pct = total ? Math.round((done / total) * 100) : 0;
  const newLeft = queue.filter((c) => !c.progress).length;
  const reviewLeft = queue.length - newLeft;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {celebrate && (
        <StreakCelebration status={celebrate.info.status} streak={celebrate.info.streak}
          previousStreak={celebrate.info.previousStreak} days={celebrate.days}
          onClose={() => { setCelebrate(null); window.dispatchEvent(new Event('stats-changed')); }} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-stone-100 p-1">
          {[1, 2, 3].map((l) => (
            <Link key={l} href={`/study?level=${l}`}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${l === level ? 'bg-white text-brand shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}>HSK {l}</Link>
          ))}
        </div>
        <button onClick={toggleAuto} aria-pressed={autoSpeak}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${autoSpeak ? 'border-brand/30 bg-brand-soft text-brand' : 'border-stone-200 bg-white text-stone-500'}`}>
          <span className={`relative h-4 w-7 rounded-full transition ${autoSpeak ? 'bg-brand' : 'bg-stone-300'}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${autoSpeak ? 'left-3.5' : 'left-0.5'}`} />
          </span>
          Tự đọc
        </button>
      </div>

      <div>
        <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
          <div className="bar-fill h-full rounded-full bg-brand transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>{done}/{total} thẻ</span>
          {card && <span className="flex gap-1.5"><span className="pill bg-sky-50 text-sky-700">{newLeft} từ mới</span><span className="pill bg-amber-50 text-amber-700">{reviewLeft} ôn lại</span></span>}
        </div>
      </div>
      {error && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}

      {!ready ? <Skeleton className="h-[27rem] !rounded-3xl" /> : !card ? (
        <div className="card animate-pop space-y-3 py-10 text-center">
          <div className="text-5xl">🎉</div>
          <p className="text-lg font-semibold">{total ? 'Hoàn thành lượt ôn hôm nay!' : 'Hôm nay không còn thẻ nào cần học ở cấp này.'}</p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href="/" className="btn-ghost">Về trang chủ</Link>
            <Link href="/exercises" className="btn-primary">Luyện tập</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="relative pb-5">
            {xpPop > 0 && <span key={xpPop} className="pointer-events-none absolute right-6 top-14 z-10 animate-float-up rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold text-amber-700 shadow-sm">+10 XP</span>}
            {queue.length > 2 && <div aria-hidden className="absolute inset-x-8 bottom-0 top-8 rounded-3xl border border-stone-200 bg-white/50" />}
            {queue.length > 1 && <div aria-hidden className="absolute inset-x-4 bottom-2.5 top-4 rounded-3xl border border-stone-200 bg-white/80 shadow-sm" />}
            <div key={cardKey} className="relative animate-slide-in">
              <FlipCard card={card} flipped={shown} canFlip={!!outcome} onToggle={() => setShown((v) => !v)} />
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-center text-sm font-medium text-stone-500">{outcome ? (outcome.ok ? 'Chính xác!' : 'Chưa đúng, xem đáp án màu xanh') : 'Nghĩa tiếng Việt của từ trên là gì?'}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o, i) => {
                const answered = !!outcome;
                const isPicked = picked === i;
                const state = !answered ? 'border-stone-200 bg-white hover:-translate-y-0.5 hover:border-brand/50 hover:bg-brand-soft hover:shadow-md active:scale-[0.98]'
                  : o.correct ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-800'
                  : isPicked ? 'animate-shake border-red-400 bg-red-50 text-red-800'
                  : 'border-stone-200 bg-white opacity-50';
                return (
                  <button key={i} disabled={answered || busy} onClick={() => choose(i)}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left shadow-sm transition-all duration-200 ${state}`}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${answered && o.correct ? 'bg-emerald-500 text-white' : answered && isPicked ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      {answered && o.correct ? '✓' : answered && isPicked ? '✕' : i + 1}
                    </span>
                    <span className="min-w-0 break-words font-medium leading-snug">{o.text}</span>
                  </button>
                );
              })}
            </div>

            {!outcome ? (
              <button disabled={busy} onClick={() => choose(null)} className="mx-auto block rounded-full px-4 py-1.5 text-sm text-stone-500 underline-offset-4 transition hover:text-brand hover:underline">
                Chưa biết, cho tôi xem đáp án (phím 0)
              </button>
            ) : (
              <div className="animate-fade-up space-y-2.5 pt-1">
                <p className="text-center text-xs text-stone-500">
                  {outcome.ok ? `Sẽ ôn lại sau ${intervalLabel(outcome.days)}` : 'Từ này sẽ quay lại ở cuối lượt học'} · Chạm vào thẻ để lật lại
                </p>
                <button onClick={next} className="btn-primary w-full !py-3 text-base">
                  {queue.length === 1 && outcome.ok ? 'Hoàn thành' : 'Tiếp tục'} →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function StudyPage() {
  return <Suspense fallback={<Skeleton className="mx-auto h-[27rem] max-w-xl !rounded-3xl" />}><StudyInner /></Suspense>;
}
