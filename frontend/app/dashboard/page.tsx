'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import type { Activity, LevelProgress } from '@/lib/types';
import Icon from '@/components/Icon';
import Skeleton from '@/components/Skeleton';
import Flame from '@/components/Flame';
import Cells from '@/components/lab/Cells';

const HAN: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级' };
const DESC: Record<number, string> = {
  1: 'Giao tiếp cơ bản: chào hỏi, số đếm, gia đình, sinh hoạt thường nhật.',
  2: 'Giao tiếp mở rộng: mua sắm, đi lại, thời tiết, sức khỏe hằng ngày.',
  3: 'Giao tiếp nâng cao: du lịch, công việc, bày tỏ ý kiến và quan điểm.',
};
const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const CELLS_PER_LEVEL = 40;

/** Dòng danh sách có mũi tên, dùng cho "việc hôm nay" và "khám phá" */
function Row({ href, title, meta, done, plain }: { href: string; title: string; meta?: string; done?: boolean; plain?: boolean }) {
  return (
    <li>
      <Link href={href} className="group flex min-h-[56px] items-center gap-3 px-4 py-2 transition-colors hover:bg-stone-50">
        {!plain && <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${done ? 'border-brand-ink bg-brand-ink text-white' : 'border-stone-300'}`}>{done ? '✓' : ''}</span>}
        <span className="min-w-0 flex-1">
          <span className={`block font-semibold ${done ? 'text-stone-500 line-through decoration-stone-300' : ''}`}>{title}</span>
          {meta && <span className="block text-sm text-stone-600">{meta}</span>}
        </span>
        <Icon name="arrow" className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </Link>
    </li>
  );
}

export default function Dashboard() {
  const { user, loading } = useUser();
  const { stats } = useStats(!!user);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [levels, setLevels] = useState<LevelProgress[] | null>(null);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [now, setNow] = useState<{ greeting: string; date: string } | null>(null);

  useEffect(() => {
    const d = new Date();
    const h = d.getHours();
    setNow({
      greeting: h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối',
      date: (t => t.charAt(0).toUpperCase() + t.slice(1))(d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
    });
  }, []);

  const load = useCallback(() => {
    api<Activity>('/study/activity').then(setActivity).catch(() => {});
    api<{ levels: LevelProgress[] }>('/study/levels').then((r) => setLevels(r.levels)).catch(() => {});
    api<{ items: unknown[] }>('/favorites').then((r) => setFavCount(r.items?.length ?? 0)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    window.addEventListener('stats-changed', load);
    return () => window.removeEventListener('stats-changed', load);
  }, [user, load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-1/2" />
        <div className="grid gap-5 lg:grid-cols-12"><Skeleton className="h-72 lg:col-span-8" /><Skeleton className="h-72 lg:col-span-4" /></div>
      </div>
    );
  }
  if (!user) return <GuestHome />;

  const cur = levels?.find((x) => x.level === selectedLevel);
  const total = cur?.total ?? 0;
  const started = cur?.started ?? 0;
  const mastered = cur?.mastered ?? 0;
  const due = stats?.due ?? 0;
  const goal = activity?.goal ?? 20;
  const today = activity?.today ?? 0;
  const reached = today >= goal;
  const streak = stats?.streak ?? 0;
  const allWords = levels ? levels.reduce((s, l) => s + l.total, 0) : 0;
  const cellOf = (n: number) => (total ? Math.round((n / total) * CELLS_PER_LEVEL) : 0);
  const days = activity?.days ?? [];

  const lead = due > 0
    ? { title: `Ôn ${due} từ đã đến hạn`, text: 'Ôn đúng lúc sắp quên giúp nhớ lâu hơn rất nhiều.', cta: 'Ôn ngay' }
    : reached
      ? { title: 'Bạn đã đạt mục tiêu hôm nay', text: 'Học thêm một lượt nếu bạn còn hứng thú.', cta: 'Học thêm' }
      : { title: today > 0 ? 'Tiếp tục bài học hôm nay' : 'Bắt đầu bài học hôm nay', text: `Còn ${Math.max(0, goal - today)} lượt ôn nữa là đạt mục tiêu.`, cta: today > 0 ? 'Học tiếp' : 'Bắt đầu học' };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{now?.greeting ?? 'Xin chào'}, {user.username}</h1>
        {now?.date && <p className="mt-1 text-stone-600">{now.date}</p>}
      </header>

      {/* Hàng 1: việc nên làm ngay (rộng) + chuỗi ngày (hẹp) */}
      <div className="grid gap-5 lg:grid-cols-12">
        <section aria-labelledby="tiep-tuc" className="lab-surface p-5 sm:p-7 lg:col-span-8">
          <p className="text-sm font-medium text-stone-600">Tiếp tục học · HSK {selectedLevel}</p>
          <h2 id="tiep-tuc" className="mt-1 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">{lead.title}</h2>
          <p className="mt-2 max-w-md text-stone-600">{lead.text}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link href={`/study?level=${selectedLevel}`} className="btn-primary !min-h-[48px] !px-6">{lead.cta}<Icon name="arrow" className="h-4 w-4" /></Link>
            <Link href="/path" className="btn-ghost !min-h-[48px] !px-6">Xem lộ trình</Link>
          </div>

          <div className="mt-7 border-t border-line pt-5">
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-semibold">Hôm nay</h3>
              <span className="text-sm tabular-nums text-stone-600">{today}/{goal} lượt ôn</span>
            </div>
            <Cells total={Math.min(goal, 40)} filled={Math.round((Math.min(today, goal) / goal) * Math.min(goal, 40))} cols={Math.min(goal, 40) <= 20 ? Math.min(goal, 20) : 20}
              label={`${today} trên ${goal} lượt ôn hôm nay`} className="max-w-xl" />
          </div>
        </section>

        <section aria-labelledby="chuoi" className="lab-surface p-5 sm:p-7 lg:col-span-4">
          <h2 id="chuoi" className="text-sm font-semibold">Chuỗi ngày học</h2>
          <div className="mt-2 flex items-end gap-3">
            <Flame size={40} state={stats?.studiedToday ? 'lit' : 'off'} />
            <span className="text-6xl font-extrabold leading-none tabular-nums">{streak}</span>
            <span className="pb-1.5 text-stone-600">ngày</span>
          </div>
          <p className="mt-2 text-sm text-stone-600">
            {stats?.studiedToday ? 'Hôm nay bạn đã giữ lửa.' : stats?.atRisk ? 'Học hôm nay để không mất chuỗi.' : 'Học hôm nay để thắp lại lửa.'}
          </p>
          <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="7 ngày gần nhất">
            {days.map((d, i) => (
              <li key={d.date} className="text-center">
                <span aria-label={`${d.reviews} lượt ôn`} className={`block aspect-square rounded-[4px] ${d.reviews > 0 ? (i === days.length - 1 ? 'bg-brand-ink' : 'bg-brand') : 'bg-stone-100 ring-1 ring-inset ring-line'}`} />
                <span className={`mt-1 block text-[11px] ${i === days.length - 1 ? 'font-bold text-ink' : 'text-stone-500'}`}>{WEEKDAY[new Date(d.date + 'T00:00:00').getDay()]}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Hàng 2: trình độ (hẹp) + việc hôm nay (rộng) */}
      <div className="grid gap-5 lg:grid-cols-12">
        <section aria-labelledby="trinh-do" className="lab-surface p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="trinh-do" className="font-bold">Trình độ</h2>
            <div role="group" aria-label="Chọn cấp độ HSK" className="inline-flex gap-1.5">
              {[1, 2, 3].map((lv) => (
                <button key={lv} onClick={() => setSelectedLevel(lv)} aria-pressed={selectedLevel === lv}
                  className={`min-h-[44px] min-w-[44px] rounded-lg border px-3 text-sm font-bold transition-colors ${selectedLevel === lv ? 'border-brand-ink/50 bg-brand text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400 hover:text-ink'}`}>
                  {lv}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 flex items-baseline gap-2"><span lang="zh-Hans" className="hanzi text-3xl leading-none">{HAN[selectedLevel]}</span><span className="font-semibold">HSK {selectedLevel}</span></p>
          <p className="mt-1 text-sm text-stone-600">{DESC[selectedLevel]}</p>
          <div className="mt-5">
            {levels ? (
              <>
                <Cells total={CELLS_PER_LEVEL} filled={cellOf(started)} strong={cellOf(mastered)} cols={20}
                  label={`HSK ${selectedLevel}: ${started} trên ${total} từ đã học, ${mastered} từ đã thuộc`} />
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="flex items-center gap-1.5 text-stone-600"><span aria-hidden className="h-2.5 w-2.5 rounded-[2px] bg-brand-ink" />Đã thuộc</dt><dd className="text-lg font-bold tabular-nums">{mastered}</dd></div>
                  <div><dt className="flex items-center gap-1.5 text-stone-600"><span aria-hidden className="h-2.5 w-2.5 rounded-[2px] bg-brand" />Đã học</dt><dd className="text-lg font-bold tabular-nums">{started}</dd></div>
                  <div><dt className="text-stone-600">Tổng</dt><dd className="text-lg font-bold tabular-nums">{total}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-stone-500">Mỗi ô ≈ {Math.max(1, Math.round(total / CELLS_PER_LEVEL))} từ.</p>
              </>
            ) : <Skeleton className="h-28" />}
          </div>
        </section>

        <section aria-labelledby="viec-hom-nay" className="lg:col-span-7">
          <h2 id="viec-hom-nay" className="mb-2 font-bold">Việc hôm nay</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
            <Row href={`/study?level=${selectedLevel}`} done={stats !== null && due === 0} title={due > 0 ? `Ôn ${due} từ đến hạn` : 'Không còn từ đến hạn'} meta="Ôn tập ngắt quãng theo thuật toán SM-2" />
            <Row href={`/study?level=${selectedLevel}`} done={reached} title={`Đạt mục tiêu ${goal} lượt ôn`} meta={`Đã làm ${today}/${goal} lượt`} />
            <Row href="/exercises" title="Chơi một trò luyện tập" meta="Ghép cặp, sắp xếp câu, điền từ, nghe và hội thoại" />
            <Row href="/favorites" title="Xem lại sổ tay từ vựng" meta={favCount === null ? undefined : `${favCount} từ đã lưu`} />
          </ul>
        </section>
      </div>

      {/* Hàng 3: khám phá, một mục chính lớn + hai mục phụ nhỏ (không phải ba thẻ bằng nhau) */}
      <section aria-labelledby="kham-pha" className="grid gap-5 lg:grid-cols-12">
        <h2 id="kham-pha" className="sr-only">Khám phá</h2>
        <Link href="/words" className="lab-surface group flex flex-col justify-between gap-6 p-5 transition-colors hover:border-stone-400 sm:p-7 lg:col-span-7">
          <div>
            <p className="text-sm font-medium text-stone-600">Kho từ vựng</p>
            <p className="mt-1 text-balance text-2xl font-extrabold leading-tight sm:text-3xl">{allWords ? `${allWords.toLocaleString('vi-VN')} từ vựng HSK 1–3` : 'Từ vựng HSK 1–3'}</p>
            <p className="mt-2 max-w-md text-stone-600">Tra chữ Hán, pinyin, nghĩa tiếng Việt, câu ví dụ và xem thứ tự nét từng chữ.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand-ink">Mở kho từ vựng<Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </Link>
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white lg:col-span-5">
          <Row plain href="/grammar" title="Ngữ pháp HSK 1–3" meta="39 điểm ngữ pháp kèm ví dụ" />
          <Row plain href="/quiz" title="Quiz từ vựng" meta="Trắc nghiệm nhanh theo cấp độ" />
        </ul>
      </section>
    </div>
  );
}

function GuestHome() {
  const [counts, setCounts] = useState<Record<number, number>>({});
  useEffect(() => { api<Record<number, number>>('/words/levels').then(setCounts).catch(() => {}); }, []);
  return (
    <div className="space-y-10">
      <section className="lab-surface p-5 sm:p-8">
        <h1 className="max-w-xl text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Học tiếng Trung theo từng ô nhỏ mỗi ngày</h1>
        <p className="mt-3 max-w-xl text-stone-600 sm:text-lg">Xem từ vựng, ngữ pháp và luyện tập ngay mà không cần tài khoản. Đăng nhập để lưu tiến độ, ôn tập ngắt quãng và giữ chuỗi ngày học.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/login?mode=up" className="btn-primary !min-h-[48px] !px-6">Tạo tài khoản miễn phí</Link>
          <Link href="/login" className="btn-ghost !min-h-[48px] !px-6">Đăng nhập</Link>
        </div>
      </section>

      <section aria-labelledby="chon-cap" className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="chon-cap" className="font-bold">Chọn cấp độ</h2>
          <p className="mt-1 text-sm text-stone-600">Ba cấp độ theo chuẩn HSK, từ nhập môn đến sơ trung cấp.</p>
        </div>
        <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white lg:col-span-7">
          {[1, 2, 3].map((lv) => (
            <li key={lv} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span lang="zh-Hans" aria-hidden className="hanzi w-14 shrink-0 text-3xl leading-none">{HAN[lv]}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">HSK {lv} · {counts[lv] ?? '…'} từ vựng</span>
                <span className="block text-sm text-stone-600">{DESC[lv]}</span>
              </span>
              <span className="flex gap-2">
                <Link className="btn-primary" href={`/words?level=${lv}`}>Từ vựng</Link>
                <Link className="btn-ghost" href="/exercises">Luyện tập</Link>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        <Row plain href="/grammar" title="Ngữ pháp HSK 1–3" meta="39 điểm ngữ pháp kèm ví dụ" />
        <Row href="/login?mode=up" title="Ôn tập ngắt quãng" meta="Đăng nhập để lưu tiến độ và giữ chuỗi ngày học" />
      </ul>
    </div>
  );
}
