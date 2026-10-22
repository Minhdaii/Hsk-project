'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import { LEVEL_STYLE } from '@/lib/levels';
import type { Activity, LevelProgress, Stats } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import StreakCard from '@/components/StreakCard';
import Skeleton from '@/components/Skeleton';
import Icon from '@/components/Icon';

const GLYPH: Record<number, string> = { 1: '你', 2: '学', 3: '说' };
const DESC: Record<number, string> = {
  1: 'Chào hỏi, số đếm, gia đình, đồ ăn thức uống.',
  2: 'Giao tiếp hằng ngày, mua sắm, thời gian, sức khỏe.',
  3: 'Công việc, du lịch, học tập, bày tỏ ý kiến.',
};

export default function Dashboard() {
  const { user, loading } = useUser();
  const { stats } = useStats(!!user);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [levels, setLevels] = useState<LevelProgress[] | null>(null);
  const [now, setNow] = useState<{ greeting: string; date: string } | null>(null);

  useEffect(() => {
    const d = new Date();
    const h = d.getHours();
    setNow({
      greeting: h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối',
      date: d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }),
    });
  }, []);

  const load = useCallback(() => {
    api<Activity>('/study/activity').then(setActivity).catch(() => {});
    api<{ levels: LevelProgress[] }>('/study/levels').then((r) => setLevels(r.levels)).catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) return;
    load();
    window.addEventListener('stats-changed', load);
    return () => window.removeEventListener('stats-changed', load);
  }, [user, load]);

  if (loading) {
    return <div className="space-y-5"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-56 !rounded-3xl" /><Skeleton className="h-64 !rounded-3xl" /></div>;
  }
  if (!user) return <GuestHome />;

  return (
    <div className="space-y-8">
      <PageHeader title={`${now?.greeting ?? 'Xin chào'}, ${user.username}`} subtitle={now?.date ? <span className="capitalize">{now.date}</span> : undefined} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 [&>section]:h-full"><TodayHero stats={stats} activity={activity} /></div>
        <div className="lg:col-span-1 [&>section]:h-full">{stats ? <StreakCard stats={stats} days={activity?.days ?? []} /> : <Skeleton className="h-72 !rounded-2xl" />}</div>
        <div className="lg:col-span-3">{activity && <WeekBars a={activity} />}</div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold">Tiến độ theo cấp độ</h2>
          <Link href="/words" className="text-sm font-semibold text-brand hover:underline">Xem tất cả từ vựng</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((lv, i) => {
            const p = levels?.find((x) => x.level === lv);
            const total = p?.total ?? 0;
            const started = total ? Math.round((p!.started / total) * 100) : 0;
            const mastered = total ? Math.round((p!.mastered / total) * 100) : 0;
            return (
              <div key={lv} style={{ animationDelay: `${i * 90}ms` }} className="card group flex animate-fade-up flex-col overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                <div className={`relative h-20 bg-gradient-to-br ${LEVEL_STYLE[lv].grad}`}>
                  <span aria-hidden className="hanzi absolute -bottom-3 right-4 select-none text-7xl leading-none text-white/25 transition-transform duration-500 group-hover:scale-110">{GLYPH[lv]}</span>
                  <div className="absolute bottom-2.5 left-5 text-xl font-extrabold text-white">HSK {lv}</div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm text-stone-600">{DESC[lv]}</p>
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-stone-700">{levels ? `${p?.started ?? 0}/${total} từ đã học` : '…'}</span>
                      <span className="text-stone-500">{levels ? `${p?.mastered ?? 0} đã thuộc` : ''}</span>
                    </div>
                    <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-stone-200">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-brand/30 transition-all duration-1000" style={{ width: `${started}%` }} />
                      <div className="bar-fill absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-1000" style={{ width: `${mastered}%` }} />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link className="btn-primary" href={`/study?level=${lv}`}>Học</Link>
                    <Link className="btn-ghost" href={`/words?level=${lv}`}>Từ vựng</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** Thẻ "Hôm nay": nhắc việc cần làm và mục tiêu trong ngày */
function TodayHero({ stats, activity }: { stats: Stats | null; activity: Activity | null }) {
  const goal = activity?.goal ?? 20;
  const today = activity?.today ?? 0;
  const pct = Math.min(100, Math.round((today / goal) * 100));
  const reached = today >= goal;
  const due = stats?.due ?? 0;
  const [title, text, cta] = reached
    ? ['Bạn đã hoàn thành mục tiêu hôm nay!', 'Tuyệt vời! Học thêm một chút nếu bạn còn hứng thú.', 'Học thêm']
    : due > 0
      ? [`Có ${due} thẻ cần ôn hôm nay`, 'Ôn đúng lúc giúp bạn nhớ lâu hơn rất nhiều.', 'Ôn ngay']
      : today > 0
        ? ['Tiếp tục bài học hôm nay', `Còn ${goal - today} lượt ôn nữa là đạt mục tiêu hôm nay.`, 'Học tiếp']
        : ['Bắt đầu bài học hôm nay', 'Mỗi lượt có 10 từ mới theo mức độ thông dụng.', 'Học từ mới'];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#a8301f] to-[#6d1b13] p-6 text-white shadow-soft sm:p-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
      <span aria-hidden className="hanzi pointer-events-none absolute -right-3 -top-8 animate-float select-none text-[10rem] leading-none text-white/10">学</span>
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Hôm nay</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 text-white/85">{text}</p>
          <Link href="/study?level=1" className="btn mt-5 bg-white !px-6 !py-3 text-brand shadow-sm hover:-translate-y-px hover:bg-brand-soft">{cta} <Icon name="arrow" className="h-5 w-5" /></Link>
        </div>
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div className="flex h-32 w-32 items-center justify-center rounded-full p-2" style={{ background: `conic-gradient(#fff ${pct * 3.6}deg, rgba(255,255,255,.22) 0)` }}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#8f2a1d]">
              <span className="text-3xl font-extrabold leading-none">{today}<span className="text-base font-semibold text-white/70">/{goal}</span></span>
              <span className="mt-1 text-[11px] text-white/75">lượt ôn</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WeekBars({ a }: { a: Activity }) {
  const max = Math.max(a.goal, ...a.days.map((d) => d.reviews), 1);
  const label = (d: string) => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(d + 'T00:00:00').getDay()];
  const total = a.days.reduce((s, d) => s + d.reviews, 0);
  return (
    <section className="card">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">7 ngày gần đây</h2>
        <span className="text-sm text-stone-500">{total} lượt ôn</span>
      </div>
      <div className="mt-4 flex h-28 items-end gap-2 border-b border-stone-200 sm:gap-4">
        {a.days.map((d, i) => (
          <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-semibold text-stone-600">{d.reviews || ''}</span>
            <div className={`mx-auto w-full max-w-[3.25rem] rounded-t-lg transition-all duration-1000 ${i === a.days.length - 1 ? 'bg-gradient-to-t from-brand to-[#e0584a]' : 'bg-brand/30'}`} style={{ height: `${Math.max(4, (d.reviews / max) * 68)}px` }} />
            <span className={`pb-1 text-[11px] ${i === a.days.length - 1 ? 'font-bold text-brand' : 'text-stone-500'}`}>{label(d.date)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Trang chính cho khách (chưa đăng nhập): vẫn xem từ vựng, ngữ pháp, luyện tập; đăng nhập để lưu tiến độ */
function GuestHome() {
  const [counts, setCounts] = useState<Record<number, number>>({});
  useEffect(() => { api<Record<number, number>>('/words/levels').then(setCounts).catch(() => {}); }, []);
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#a8301f] to-[#6d1b13] p-6 text-white shadow-soft sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <span aria-hidden className="hanzi pointer-events-none absolute -right-3 -top-8 animate-float select-none text-[12rem] leading-none text-white/10">学</span>
        <div className="relative max-w-xl">
          <h1 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">Chào mừng bạn đến với 学汉语</h1>
          <p className="mt-3 text-white/85 sm:text-lg">Chọn một cấp độ để xem từ vựng, học ngữ pháp và luyện tập ngay. Đăng nhập để lưu tiến độ, dùng flashcard ôn tập thông minh và giữ chuỗi ngày học.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login?mode=up" className="btn bg-white !px-6 !py-3 text-brand shadow-sm hover:-translate-y-px hover:bg-brand-soft">Tạo tài khoản miễn phí</Link>
            <Link href="/login" className="btn border border-white/40 !px-6 !py-3 text-white hover:bg-white/10">Đăng nhập</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">Chọn cấp độ</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((lv, i) => (
            <div key={lv} style={{ animationDelay: `${i * 90}ms` }} className="card group flex animate-fade-up flex-col overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
              <div className={`relative h-24 bg-gradient-to-br ${LEVEL_STYLE[lv].grad}`}>
                <span aria-hidden className="hanzi absolute -bottom-3 right-4 select-none text-8xl leading-none text-white/25 transition-transform duration-500 group-hover:scale-110">{GLYPH[lv]}</span>
                <div className="absolute bottom-3 left-5"><div className="text-2xl font-extrabold text-white">HSK {lv}</div><div className="text-sm text-white/85">{counts[lv] ?? '…'} từ vựng</div></div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm text-stone-600">{DESC[lv]}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link className="btn-primary" href={`/words?level=${lv}`}>Từ vựng</Link>
                  <Link className="btn-ghost" href="/exercises">Luyện tập</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/grammar" className="card group flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm"><Icon name="grammar" className="h-6 w-6" /></span>
          <span><span className="block font-bold group-hover:text-brand">Ngữ pháp HSK 1-3</span><span className="text-sm text-stone-600">39 điểm ngữ pháp kèm ví dụ</span></span>
        </Link>
        <Link href="/login?mode=up" className="card group flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm"><Icon name="cards" className="h-6 w-6" /></span>
          <span><span className="block font-bold group-hover:text-brand">Flashcard ôn tập thông minh</span><span className="text-sm text-stone-600">Đăng nhập để lưu tiến độ và giữ chuỗi ngày học</span></span>
        </Link>
      </section>
    </div>
  );
}
