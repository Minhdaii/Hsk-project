'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import type { Activity } from '@/lib/types';
import { LEVEL_STYLE } from '@/lib/levels';
import StreakCard from '@/components/StreakCard';

const LEVELS = [
  { level: 1, glyph: '你', desc: 'Nhập môn: chào hỏi, số đếm, gia đình, đồ ăn thức uống.' },
  { level: 2, glyph: '学', desc: 'Sơ cấp: giao tiếp hằng ngày, mua sắm, thời gian.' },
  { level: 3, glyph: '说', desc: 'Sơ trung cấp: công việc, du lịch, học tập.' },
];

export default function Home() {
  const { user } = useUser();
  const { stats } = useStats(!!user);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Record<number, number>>('/words/levels').then(setCounts).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!user) { setActivity(null); return; }
    api<Activity>('/study/activity').then(setActivity).catch(() => {});
  }, [user]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#a8301f] to-[#6d1b13] p-7 text-white shadow-soft sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <span aria-hidden className="hanzi pointer-events-none absolute -right-2 -top-8 animate-float select-none text-[11rem] leading-none text-white/10 sm:text-[16rem]">学</span>
        <span aria-hidden className="hanzi pointer-events-none absolute -bottom-10 right-24 hidden select-none text-[8rem] leading-none text-white/[0.07] sm:block">汉</span>
        <div className="relative max-w-2xl">
          {user && stats && (
            <span className="mb-3 inline-flex max-w-full items-center gap-2 rounded-2xl bg-white/15 px-3 py-1.5 text-sm font-medium backdrop-blur">
              Xin chào, {user.username}{stats.streak > 0 && <> · 🔥 {stats.streak} ngày liên tiếp</>}
            </span>
          )}
          <h1 className="text-balance text-3xl font-bold leading-tight sm:text-5xl">Học tiếng Trung theo cấp độ HSK</h1>
          <p className="mt-3 max-w-xl text-white/85 sm:text-lg">Flashcard lặp lại ngắt quãng, ngữ pháp, bài tập điền từ, nghe phát âm và tập viết chữ Hán. Miễn phí.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/study?level=1" className="btn bg-white !px-5 !py-2.5 text-brand shadow-sm hover:-translate-y-px hover:bg-brand-soft">{stats && stats.due > 0 ? `Học tiếp · ${stats.due} thẻ cần ôn` : 'Bắt đầu học'}</Link>
            <Link href="/exercises" className="btn border border-white/40 !px-5 !py-2.5 text-white hover:bg-white/10">Luyện tập</Link>
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}

      {user && stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2"><StreakCard stats={stats} days={activity?.days ?? []} /></div>
            <div className="md:col-span-3">{activity && <ActivityCard a={activity} />}</div>
          </div>
        </>
      ) : !user ? (
        <p className="card text-sm text-stone-600">
          <Link href="/login" className="font-semibold text-brand underline">Đăng nhập</Link> để lưu tiến độ học, chuỗi ngày học và lịch ôn tập.
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-bold">Chọn cấp độ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {LEVELS.map((l, i) => (
            <div key={l.level} style={{ animationDelay: `${i * 90}ms` }}
              className="card flex animate-fade-up flex-col overflow-hidden !p-0 transition hover:-translate-y-1 hover:shadow-soft">
              <div className={`relative h-24 bg-gradient-to-br ${LEVEL_STYLE[l.level].grad}`}>
                <span aria-hidden className="hanzi absolute -bottom-3 right-4 select-none text-8xl leading-none text-white/25">{l.glyph}</span>
                <div className="absolute bottom-3 left-5 text-2xl font-bold text-white">HSK {l.level}</div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm text-stone-600">{l.desc}</p>
                <p className="mt-3 text-sm font-medium text-stone-500">{counts[l.level] ?? '…'} từ vựng</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link className="btn-primary" href={`/study?level=${l.level}`}>Học</Link>
                  <Link className="btn-ghost" href={`/words?level=${l.level}`}>Danh sách</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ActivityCard({ a }: { a: Activity }) {
  const max = Math.max(a.goal, ...a.days.map((d) => d.reviews), 1);
  const pct = Math.min(100, Math.round((a.today / a.goal) * 100));
  const dayLabel = (d: string) => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(d + 'T00:00:00').getDay()];
  return (
    <section className="card h-full space-y-4">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold">Mục tiêu hôm nay</h2>
          <span className="text-sm text-stone-500">{a.today}/{a.goal} lượt ôn {a.today >= a.goal && '🎉'}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-200">
          <div className={`bar-fill h-full rounded-full transition-all duration-700 ${a.today >= a.goal ? 'bg-emerald-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex h-32 items-end gap-2 border-b border-stone-200">
        {a.days.map((d, i) => (
          <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-medium text-stone-600">{d.reviews || ''}</span>
            <div className={`w-full rounded-t-md transition-all duration-700 ${i === a.days.length - 1 ? 'bg-brand' : 'bg-brand/40'}`} style={{ height: `${Math.max(4, (d.reviews / max) * 84)}px` }} />
            <span className="pb-1 text-[11px] text-stone-500">{dayLabel(d.date)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
