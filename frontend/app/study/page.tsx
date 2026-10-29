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

const FALLBACK: CardOption[] = [{ text: 'Tôi đã nhớ từ này', correct: true }, { text: 'Tôi chưa nhớ', correct: false }];

function StudyInner() {
  const sp = useSearchParams();
  const level = Math.min(3, Math.max(1, Number(sp.get('level') || '1')));
  const { user, loading } = useUser();
  const [queue, setQueue] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
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
      setTimeout(() => setShown(true), 380);
      setError('');
    } catch (e) {
      setPicked(null);
      setError(e instanceof Error ? e.message : 'Không lưu được kết quả ôn tập');
    }
    setBusy(false);
  }

  function next() {
    if (!outcome || !card) return;
    const rest = queue.slice(1);
    if (outcome.ok) setDone((d) => d + 1);
    else rest.push({ word: card.word, progress: outcome.progress, options: card.options, retry: true });
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

  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current; touch.current = null;
    if (!t || !outcome) return;
    const dx = e.changedTouches[0].clientX - t.x;
    const dy = e.changedTouches[0].clientY - t.y;
    if (dx < -70 && Math.abs(dy) < 60) next();
  };

  if (loading) return <Skeleton className="mx-auto h-[24rem] max-w-5xl" />;
  if (!user) {
    return (
      <div className="editorial-card mx-auto max-w-md p-8 text-center">
        <p className="hanzi text-4xl text-brand-ink" lang="zh-Hans" aria-hidden>登录</p>
        <h2 className="mt-3 text-base font-bold text-ink">Yêu cầu đăng nhập</h2>
        <p className="mt-1.5 text-xs text-stone-600">Vui lòng đăng nhập để hệ thống ghi nhận lịch ôn tập ngắt quãng SM-2 và lưu kết quả học tập của bạn.</p>
        <div className="mt-5">
          <Link href="/login" className="btn-editorial-primary w-full text-center">Đăng nhập ngay</Link>
        </div>
      </div>
    );
  }

  const pct = total ? Math.round((done / total) * 100) : 0;
  const newLeft = queue.filter((c) => !c.progress).length;
  const reviewLeft = queue.length - newLeft;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {celebrate && (
        <StreakCelebration
          status={celebrate.info.status}
          streak={celebrate.info.streak}
          previousStreak={celebrate.info.previousStreak}
          days={celebrate.days}
          onClose={() => { setCelebrate(null); window.dispatchEvent(new Event('stats-changed')); }}
        />
      )}

      {/* Điều khiển cấp độ và chế độ tự đọc */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-2.5">
        <nav aria-label="Chọn cấp độ ôn tập" className="inline-flex rounded-lg border border-line bg-white p-0.5">
          {[1, 2, 3].map((l) => (
            <Link
              key={l}
              href={`/study?level=${l}`}
              aria-current={l === level ? 'page' : undefined}
              className={`inline-flex min-h-[44px] items-center rounded-md px-3 text-xs font-bold transition-all ${
                l === level
                  ? 'border border-line bg-brand-soft text-brand-ink '
                  : 'text-stone-600 hover:text-ink'
              }`}
            >
              HSK {l}
            </Link>
          ))}
        </nav>

        <button
          onClick={toggleAuto}
          aria-pressed={autoSpeak}
          className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${
            autoSpeak
              ? 'border-line bg-brand-soft text-brand-ink'
              : 'border-line bg-white text-stone-600 hover:border-line'
          }`}
        >
          <span
            aria-hidden
            className={`relative h-3.5 w-6 rounded-full transition-colors ${
              autoSpeak ? 'bg-brand' : 'bg-stone-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${
                autoSpeak ? 'left-3' : 'left-0.5'
              }`}
            />
          </span>
          Tự động phát âm
        </button>
      </div>

      {/* Tiến độ phiên học */}
      <div>
        <div
          role="progressbar"
          aria-label="Tiến độ buổi học"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-2 overflow-hidden rounded-full bg-brand-soft"
        >
          <div
            className="bar-fill h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-stone-600">
          <span className="font-semibold tabular-nums text-ink">{done} / {total} thẻ hoàn thành</span>
          {card && (
            <span className="flex gap-1.5">
              <span className="editorial-badge">{newLeft} từ mới</span>
              <span className="editorial-badge-stone">{reviewLeft} ôn tập</span>
            </span>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          {error}
        </p>
      )}

      {!ready ? (
        <Skeleton className="h-[24rem]" />
      ) : !card ? (
        <div className="editorial-card animate-pop space-y-4 py-12 text-center">
          <p lang="zh-Hans" aria-hidden className="hanzi text-5xl font-bold text-brand-ink">完成</p>
          <div>
            <h2 className="text-xl font-bold text-ink">
              {total ? 'Hoàn thành phiên học hôm nay!' : 'Không còn thẻ nào cần học ở cấp độ này.'}
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              Thuật toán SM-2 đã cập nhật chu kỳ ôn tập ngắt quãng tiếp theo cho bạn.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2.5 pt-2 sm:flex-row">
            <Link href="/dashboard" className="btn-editorial-ghost text-xs">Về trang tổng quan</Link>
            <Link href="/exercises" className="btn-editorial-primary text-xs">Luyện tập mini-games</Link>
          </div>
        </div>
      ) : (
        /* BỐ CỤC HAI CỘT: CÂU HỎI BÊN TRÁI, ĐÁP ÁN BÊN PHẢI */
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-12">
          {/* CỘT TRÁI (6 COLS): NỘI DUNG TỪ VỰNG / CÂU HỎI */}
          <div className="relative flex flex-col [touch-action:pan-y] lg:col-span-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {xpPop > 0 && (
              <span
                key={xpPop}
                aria-hidden
                className="pointer-events-none absolute right-4 top-12 z-10 animate-float-up rounded-md bg-brand px-2 py-0.5 text-xs font-bold text-ink "
              >
                +10 XP
              </span>
            )}
            {queue.length > 1 && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-2 bottom-0 top-2 rounded-2xl border border-line bg-stone-50"
              />
            )}
            <div key={cardKey} className="relative h-full animate-slide-in">
              <FlipCard card={card} flipped={shown} canFlip={!!outcome} onToggle={() => setShown((v) => !v)} />
            </div>
          </div>

          {/* CỘT PHẢI (6 COLS): BẢNG ĐÁP ÁN VÀ ĐIỀU KHIỂN HỌC TẬP */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-line bg-white p-5 sm:p-6 shadow-sm lg:col-span-6">
            {/* Tiêu đề & Thông báo trạng thái */}
            <div>
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  {outcome ? 'Kết quả ôn tập' : 'Lựa chọn đáp án'}
                </span>
                <span className="text-xs text-stone-500">
                  {outcome ? 'Chu kỳ lặp lại SM-2' : 'Phím tắt 1–4'}
                </span>
              </div>

              <div className="mt-3">
                {!outcome ? (
                  <p className="text-xs sm:text-sm font-semibold text-ink">
                    Chọn nghĩa tiếng Việt chính xác của từ vựng:
                  </p>
                ) : outcome.ok ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-emerald-950">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
                      Chính xác!
                    </div>
                    <p className="mt-1 text-xs text-emerald-800">
                      Lịch ôn tập tiếp theo: sau <strong className="font-semibold">{intervalLabel(outcome.days)}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-rose-950">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs text-white">✕</span>
                      Chưa chính xác!
                    </div>
                    <p className="mt-1 text-xs text-rose-800">
                      Thẻ này sẽ tự động quay lại vào cuối lượt học để bạn ôn lại.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách các phương án đáp án: mỗi hàng rõ ràng, căn chỉnh đồng đều */}
            <div className="my-3 space-y-2.5">
              {options.map((o, i) => {
                const answered = !!outcome;
                const isPicked = picked === i;
                const state = !answered
                  ? 'border-line bg-stone-50 hover:border-brand hover:bg-brand-soft/40 active:translate-y-px text-ink'
                  : o.correct
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold  ring-1 ring-emerald-400'
                  : isPicked
                  ? 'border-red-400 bg-red-50 text-red-900 font-semibold ring-1 ring-red-300'
                  : 'border-line bg-white opacity-40 text-stone-400';
                return (
                  <button
                    key={i}
                    disabled={answered || busy}
                    onClick={() => choose(i)}
                    className={`flex min-h-[46px] w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${state}`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        answered && o.correct
                          ? 'bg-emerald-600 text-white'
                          : answered && isPicked
                          ? 'bg-red-500 text-white'
                          : 'bg-brand-soft text-brand-ink'
                      }`}
                    >
                      {answered && o.correct ? '✓' : answered && isPicked ? '✕' : i + 1}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-xs sm:text-sm font-medium leading-snug">
                      {o.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Khu vực hành động phía dưới */}
            <div className="border-t border-line pt-3">
              {!outcome ? (
                <button
                  disabled={busy}
                  onClick={() => choose(null)}
                  className="min-h-[44px] w-full rounded-xl border border-dashed border-line bg-stone-50 py-2 text-center text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-soft"
                >
                  Chưa biết từ này, hiển thị đáp án học <span className="ml-1 opacity-70">(phím 0)</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setShown((v) => !v)}
                    aria-pressed={shown}
                    className="btn-editorial-ghost !min-h-[42px] !px-3 text-xs font-semibold"
                  >
                    {shown ? 'Xem mặt trước' : 'Lật xem nghĩa (Space)'}
                  </button>
                  <button
                    onClick={next}
                    className="btn-editorial-primary !min-h-[42px] !px-3 text-xs sm:text-sm font-bold"
                  >
                    {queue.length === 1 && outcome.ok ? 'Hoàn thành' : 'Tiếp tục (Enter →)'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-[24rem] max-w-5xl" />}>
      <StudyInner />
    </Suspense>
  );
}
