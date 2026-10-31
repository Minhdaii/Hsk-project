'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ClipboardCheck, Flame, Layers, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import type { Activity, LeaderRow, LevelProgress } from '@/lib/types';
import Skeleton from '@/components/Skeleton';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import Anim from '@/components/motion/Anim';

const HAN: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级' };
const DESC: Record<number, string> = {
  1: 'Giao tiếp cơ bản: chào hỏi, số đếm, gia đình, sinh hoạt thường nhật.',
  2: 'Giao tiếp mở rộng: mua sắm, đi lại, thời tiết, sức khỏe hằng ngày.',
  3: 'Giao tiếp nâng cao: du lịch, công việc, bày tỏ ý kiến và quan điểm.',
};
const CARD = 'rounded-[22px] bg-white shadow-card';

/** Thẻ màu pastel dẫn tới một nhóm chức năng. Chữ Hán mờ ở góc là họa tiết, không phải nội dung. */
function ToneCard({ href, tone, glyph, title, text, chip }: { href: string; tone: string; glyph: string; title: string; text: string; chip: string }) {
  return (
    <Link href={href} className={`group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[22px] p-6 outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-pop focus-visible:ring-2 focus-visible:ring-brand-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-reduce:transition-none ${tone}`}>
      <span aria-hidden lang="zh-Hans" className="hanzi pointer-events-none absolute -right-2 -top-6 select-none text-[9rem] font-black leading-none text-white/45">{glyph}</span>
      <div className="relative max-w-[85%]">
        <h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{text}</p>
      </div>
      <div className="relative mt-5 flex items-center justify-between gap-3">
        <span className="inline-flex min-h-[36px] items-center rounded-full bg-white/70 px-3.5 text-sm font-medium">{chip}</span>
        <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 transition-transform duration-200 group-hover:scale-105"><ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
      </div>
    </Link>
  );
}

function Bar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-stone-200 ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useUser();
  const { stats } = useStats(!!user);
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [levels, setLevels] = useState<LevelProgress[] | null>(null);
  const [board, setBoard] = useState<LeaderRow[] | null>(null);
  const [q, setQ] = useState('');
  const [now, setNow] = useState<{ greeting: string; date: string } | null>(null);

  useEffect(() => {
    const d = new Date();
    const h = d.getHours();
    setNow({
      greeting: h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối',
      date: (t => t.charAt(0).toUpperCase() + t.slice(1))(d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })),
    });
  }, []);

  const load = useCallback(() => {
    api<Activity>('/study/activity').then(setActivity).catch(() => {});
    api<{ levels: LevelProgress[] }>('/study/levels').then((r) => setLevels(r.levels)).catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) return;
    load();
    api<{ items: LeaderRow[] }>('/leaderboard').then((r) => setBoard(r.items)).catch(() => setBoard([]));
    window.addEventListener('stats-changed', load);
    return () => window.removeEventListener('stats-changed', load);
  }, [user, load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-56" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><Skeleton className="h-[480px] !rounded-[22px]" /><Skeleton className="h-[480px] !rounded-[22px]" /></div>
      </div>
    );
  }
  if (!user) return <GuestHome />;

  const due = stats?.due ?? 0;
  const goal = activity?.goal ?? 20;
  const today = activity?.today ?? 0;
  const streak = stats?.streak ?? 0;
  const current = levels?.find((l) => l.started > 0 && l.mastered < l.total)?.level ?? 1;

  // Nhiệm vụ lấy trực tiếp từ số liệu thật: mục tiêu ngày, từ đến hạn, chuỗi ngày
  const tasks = [
    { href: `/study?level=${current}`, icon: ClipboardCheck, title: `Đạt mục tiêu ${goal} lượt ôn`, pct: (Math.min(today, goal) / goal) * 100, done: today >= goal },
    { href: `/study?level=${current}`, icon: Layers, title: due > 0 ? `Ôn ${due} từ đã đến hạn` : 'Ôn các từ đã đến hạn', pct: due === 0 ? 100 : today + due > 0 ? (today / (today + due)) * 100 : 0, done: stats !== null && due === 0 },
    { href: '/study', icon: Flame, title: streak > 0 ? `Giữ chuỗi ${streak} ngày học` : 'Bắt đầu chuỗi ngày học', pct: stats?.studiedToday ? 100 : 0, done: !!stats?.studiedToday },
  ];
  const remaining = tasks.filter((t) => !t.done).length;

  const mine = user.xp;
  const third = board && board.length >= 3 ? board[2].xp : null;
  const gap = third !== null && mine < third ? third - mine : 0;

  return (
    <div className="space-y-6 pb-2">
      <header>
        <h1 className="text-[2rem] font-medium leading-tight tracking-tight sm:text-[2.5rem]">Dashboard</h1>
        {now && <p className="mt-0.5 text-sm text-stone-600">{now.greeting}, {user.username} · {now.date}</p>}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Cột trái: khóa học và ba thẻ chức năng */}
        <Anim each={80} y={14} className="space-y-5">
          <section aria-labelledby="khoa-hoc" className={`${CARD} p-6`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="khoa-hoc" className="text-lg font-semibold tracking-tight">Khóa học của tôi</h2>
                <p className="text-sm text-stone-500">Tiếp tục từ chỗ bạn đã dừng</p>
              </div>
              <Link href="/path" aria-label="Mở lộ trình HSK" className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-brand-soft hover:text-ink"><ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={1.8} /></Link>
            </div>
            <form role="search" onSubmit={(e) => { e.preventDefault(); const t = q.trim(); if (t) router.push(`/words?q=${encodeURIComponent(t)}`); }} className="mt-4 flex items-center gap-2 rounded-full bg-paper py-1.5 pl-5 pr-1.5">
              <label htmlFor="dash-search" className="sr-only">Tìm từ vựng</label>
              <input id="dash-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm từ vựng, chữ Hán, pinyin…" autoComplete="off" className="min-h-[40px] min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-500" />
              <button type="submit" aria-label="Tìm" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform duration-200 hover:scale-105"><Search className="h-[18px] w-[18px]" strokeWidth={1.8} /></button>
            </form>
            <ul className="mt-4 space-y-1">
              {(levels ?? [1, 2, 3].map((level) => ({ level, total: 0, started: 0, mastered: 0 }))).map((l) => (
                <li key={l.level}>
                  <Link href={`/study?level=${l.level}`} className="block rounded-2xl px-3 py-2.5 transition-colors hover:bg-paper">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="flex items-baseline gap-2"><span lang="zh-Hans" className="hanzi text-lg leading-none">{HAN[l.level]}</span><span className="text-sm font-semibold">HSK {l.level}</span></span>
                      <span className="text-xs tabular-nums text-stone-500">{levels ? `${l.started}/${l.total} từ đã học` : '…'}</span>
                    </span>
                    <Bar className="mt-2" value={l.total ? (l.started / l.total) * 100 : 0} />
                    <span className="sr-only">{DESC[l.level]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <ToneCard href="/exercises?mode=dialogue" tone="bg-gradient-to-br from-[#E7E1FF] to-[#CBD3FF]" glyph="说" title="Luyện giao tiếp" text="Làm chủ hội thoại đời sống bằng tiếng Trung, từ chào hỏi đến mua sắm." chip="Tình huống giao tiếp" />
          <ToneCard href={`/study?level=${current}`} tone="bg-gradient-to-br from-[#DAEEFF] to-[#BFE2FB]" glyph="学" title="Nắm vững kiến thức" text="Từ vựng và ngữ pháp cốt lõi để nói trôi chảy hơn." chip={due > 0 ? `Ôn ${due} từ đến hạn` : `Học từ mới HSK ${current}`} />
          <ToneCard href="/writing" tone="bg-gradient-to-br from-[#EAF7C6] to-[#D6F0A8]" glyph="写" title="Nghe và viết như người bản xứ" text="Luyện nghe, gõ pinyin và viết chữ Hán lên giấy để AI nhận diện." chip="Nhận diện chữ viết" />
        </Anim>

        {/* Cột phải: hiệu suất tuần, nhiệm vụ, xếp hạng */}
        <Anim each={100} y={16} className="space-y-6">
          <section aria-labelledby="hieu-suat" className={`${CARD} p-6 sm:p-8`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="hieu-suat" className="text-2xl font-semibold tracking-tight">Hiệu suất học tập</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500">
                  {streak > 0 ? <>Bạn đang giữ chuỗi {streak} ngày, cứ thế tiếp tục<Flame className="h-4 w-4 text-vermilion" strokeWidth={1.8} aria-hidden /></> : 'Học một lượt hôm nay để bắt đầu chuỗi ngày'}
                </p>
              </div>
              <span className="rounded-full border border-line px-3.5 py-1.5 text-sm text-stone-600">7 ngày gần nhất</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-600">
              <li className="flex items-center gap-2"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-brand-ink" />Lượt ôn mỗi ngày</li>
              <li className="flex items-center gap-2"><span aria-hidden className="h-0 w-4 border-t border-dashed border-brand-ink" />Mục tiêu {goal} lượt</li>
            </ul>
            <div className="mt-5">{activity ? <WeeklyChart days={activity.days} goal={activity.goal} /> : <Skeleton className="h-[260px]" />}</div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="nhiem-vu" className={`${CARD} p-6`}>
              <h2 id="nhiem-vu" className="text-xl font-semibold tracking-tight">Nhiệm vụ hôm nay</h2>
              <p className="text-sm text-stone-500">{remaining > 0 ? `Còn ${remaining} nhiệm vụ · Hết hạn tối nay` : 'Bạn đã hoàn thành tất cả'}</p>
              <ul className="mt-5 space-y-4">
                {tasks.map((t) => (
                  <li key={t.title}>
                    <Link href={t.href} className="group flex items-center gap-3.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-ink">
                      <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition-transform duration-200 group-hover:scale-105"><t.icon className="h-5 w-5" strokeWidth={1.8} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-sm ${t.done ? 'text-stone-500 line-through decoration-stone-300' : 'font-medium'}`}>{t.title}</span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">{Math.round(t.pct)}%</span>
                        </span>
                        <Bar className="mt-2" value={t.pct} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="xep-hang" className={`${CARD} p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="xep-hang" className="text-xl font-semibold tracking-tight">Bảng xếp hạng</h2>
                  <p className="text-sm text-stone-500">{gap > 0 ? `Bạn có ${mine.toLocaleString('vi-VN')} XP, còn ${gap.toLocaleString('vi-VN')} XP để vào top 3` : `Bạn có ${mine.toLocaleString('vi-VN')} XP`}</p>
                </div>
                <Link href="/leaderboard" className="shrink-0 whitespace-nowrap rounded-full border border-line px-3.5 py-1.5 text-sm text-stone-600 transition-colors hover:border-stone-400 hover:text-ink">Tất cả</Link>
              </div>
              {board === null ? (
                <div className="mt-5 space-y-3"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>
              ) : board.length === 0 ? (
                <p className="mt-5 text-sm text-stone-600">Chưa có học viên nào trên bảng. Hoàn thành một lượt ôn để lên bảng đầu tiên.</p>
              ) : (
                <ol className="mt-5 space-y-3.5">
                  {board.slice(0, 3).map((r, i) => (
                    <li key={r.rank} className="flex items-center gap-3">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${['bg-[#E7E1FF]', 'bg-[#DAEEFF]', 'bg-[#EAF7C6]'][i] ?? 'bg-stone-100'}`}><span aria-hidden className="tabular-nums">{r.rank}</span><span className="sr-only">Hạng {r.rank}</span></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.name}</span>
                        <span className="flex items-center gap-1 text-xs text-stone-500"><Flame className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />{r.streak} ngày</span>
                      </span>
                      <span className="text-lg font-semibold tabular-nums">{r.xp.toLocaleString('vi-VN')}<span className="sr-only"> XP</span></span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </Anim>
      </div>
    </div>
  );
}

function GuestHome() {
  const [counts, setCounts] = useState<Record<number, number>>({});
  useEffect(() => { api<Record<number, number>>('/words/levels').then(setCounts).catch(() => {}); }, []);
  return (
    <div className="space-y-6">
      <section className={`${CARD} p-6 sm:p-10`}>
        <h1 className="max-w-xl text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">Học tiếng Trung theo từng ô nhỏ mỗi ngày</h1>
        <p className="mt-3 max-w-xl text-stone-600 sm:text-lg">Xem từ vựng, ngữ pháp và luyện tập ngay mà không cần tài khoản. Đăng nhập để lưu tiến độ, ôn tập ngắt quãng và giữ chuỗi ngày học.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/login?mode=up" className="btn-primary !min-h-[48px] !rounded-full !px-6">Tạo tài khoản miễn phí</Link>
          <Link href="/login" className="btn-ghost !min-h-[48px] !rounded-full !px-6">Đăng nhập</Link>
        </div>
      </section>
      <section aria-labelledby="chon-cap" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <h2 id="chon-cap" className="text-xl font-semibold tracking-tight">Chọn cấp độ</h2>
          <p className="mt-1 text-sm text-stone-600">Ba cấp độ theo chuẩn HSK, từ nhập môn đến sơ trung cấp.</p>
        </div>
        <ol className={`${CARD} divide-y divide-line overflow-hidden`}>
          {[1, 2, 3].map((lv) => (
            <li key={lv} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span lang="zh-Hans" aria-hidden className="hanzi w-20 shrink-0 whitespace-nowrap text-3xl leading-none">{HAN[lv]}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">HSK {lv} · {counts[lv] ?? '…'} từ vựng</span>
                <span className="block text-sm text-stone-600">{DESC[lv]}</span>
              </span>
              <span className="flex gap-2">
                <Link className="btn-primary !rounded-full" href={`/words?level=${lv}`}>Từ vựng</Link>
                <Link className="btn-ghost !rounded-full" href="/exercises">Luyện tập</Link>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
