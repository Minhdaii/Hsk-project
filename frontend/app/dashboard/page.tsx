'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import type { Activity, LevelProgress, Stats } from '@/lib/types';
import Icon from '@/components/Icon';
import Skeleton from '@/components/Skeleton';
import Flame from '@/components/Flame';

const HAN: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级' };
const DESC: Record<number, string> = {
  1: 'Giao tiếp cơ bản: Chào hỏi, số đếm, gia đình, sinh hoạt thường nhật.',
  2: 'Giao tiếp mở rộng: Mua sắm, đi lại, thời tiết, sức khỏe hằng ngày.',
  3: 'Giao tiếp nâng cao: Du lịch, công việc, bày tỏ ý kiến và quan điểm.',
};

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
      date: d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
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
        <Skeleton className="h-16 w-1/2" />
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 lg:col-span-8" />
          <Skeleton className="h-96 lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!user) return <GuestHome />;

  // Tính toán số liệu cấp độ đang chọn
  const curLv = levels?.find((x) => x.level === selectedLevel);
  const totalInLevel = curLv?.total ?? (selectedLevel === 1 ? 506 : selectedLevel === 2 ? 750 : 953);
  const startedInLevel = curLv?.started ?? 0;
  const masteredInLevel = curLv?.mastered ?? 0;
  const pctStarted = Math.min(100, Math.round((startedInLevel / totalInLevel) * 100));
  const pctMastered = Math.min(100, Math.round((masteredInLevel / totalInLevel) * 100));
  const dueCount = stats?.due ?? 0;
  const dailyGoal = activity?.goal ?? 20;
  const dailyDone = activity?.today ?? 0;

  return (
    <div className="space-y-8">
      {/* ============================================================
          TOP HEADER: GREETING & HSK LEVEL PILL SELECTOR (Inspired by Mondly)
          ============================================================ */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E7E2F0] pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#302B3D] sm:text-3xl">
            {now?.greeting ?? 'Chào mừng bạn trở lại'}, <span className="text-[#55449E]">{user.username}</span>!
          </h1>
          <p className="mt-1 text-xs text-[#777184]">
            {now?.date ? <span className="capitalize">{now.date}</span> : 'Không gian học tiếng Trung hiện đại'} · Chuẩn hóa HSK 3.0
          </p>
        </div>

        {/* HSK Level Pill Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#777184]">Cấp độ:</span>
          <div role="group" aria-label="Chọn cấp độ HSK" className="inline-flex rounded-xl border border-[#D8D1EE] bg-white p-1 shadow-2xs">
            {[1, 2, 3].map((lv) => (
              <button
                key={lv}
                onClick={() => setSelectedLevel(lv)}
                aria-pressed={selectedLevel === lv}
                className={`min-h-[36px] rounded-lg px-4 text-xs font-bold transition-all ${
                  selectedLevel === lv
                    ? 'bg-[#55449E] text-white shadow-xs'
                    : 'text-[#777184] hover:bg-[#FAF9FD] hover:text-[#302B3D]'
                }`}
              >
                HSK {lv} <span className="ml-0.5 text-[10px] font-normal opacity-80">({HAN[lv]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN DASHBOARD GRID: 8 COLS (MAIN) + 4 COLS (SIDEBAR)
          ============================================================ */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ============================================================
            CỘT CHÍNH (8 COLS): LỘ TRÌNH, PHÂN TÍCH NĂNG LỰC & DANH MỤC
            ============================================================ */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card 1: Khóa học tự học hiện tại (Self-study course - Inspired by Image 1) */}
          <section
            aria-labelledby="self-study-heading"
            className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white overflow-hidden shadow-sm transition-all hover:border-[#A99AE8]"
          >
            {/* Banner đầu thẻ: Màu Lavender gradient đậm đà, chuyên nghiệp */}
            <div className="bg-gradient-to-r from-[#55449E] via-[#6552B5] to-[#7B66CD] p-5 text-white sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                  Đang học · HSK Cấp {selectedLevel}
                </span>
                <span className="text-xs font-semibold text-white/90">
                  {startedInLevel} / {totalInLevel} từ đã học
                </span>
              </div>
              <h2 id="self-study-heading" className="mt-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
                Lộ trình từ vựng & phản xạ câu HSK {selectedLevel}
              </h2>
              <p className="mt-1 max-w-xl text-xs text-white/80 line-clamp-2">
                {DESC[selectedLevel]}
              </p>

              {/* Thanh tiến độ bên trong banner */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-medium text-white/85">
                  <span>Tiến độ hoàn thành cấp độ</span>
                  <span className="font-bold">{pctStarted}%</span>
                </div>
                <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-black/20">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.max(5, pctStarted)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Danh sách các mô-đun bài học bên dưới banner */}
            <div className="divide-y divide-[#F0ECF6] p-2 sm:p-3">
              <div className="flex items-center justify-between p-3 transition-colors hover:bg-[#FAF9FD] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF8F1] text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#302B3D]">Phát âm Pinyin & 4 Thanh điệu</h3>
                    <p className="text-[11px] text-[#777184]">Nguyên âm, phụ âm và quy tắc biến điệu thanh ba</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">Đã sẵn sàng</span>
              </div>

              <div className="flex items-center justify-between p-3 transition-colors hover:bg-[#FAF9FD] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEE9FC] text-xs font-bold text-[#55449E]">
                    ●
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#302B3D]">Kho từ vựng & Thuật toán SM-2</h3>
                    <p className="text-[11px] text-[#777184]">{startedInLevel} từ đang củng cố, {masteredInLevel} từ thuộc vững</p>
                  </div>
                </div>
                <Link
                  href={`/study?level=${selectedLevel}`}
                  className="btn-editorial-primary !min-h-[34px] !px-4 text-xs font-bold shadow-xs"
                >
                  Học tiếp →
                </Link>
              </div>

              <div className="flex items-center justify-between p-3 transition-colors hover:bg-[#FAF9FD] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FAF9FD] border border-[#E7E2F0] text-xs font-bold text-[#777184]">
                    练
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#302B3D]">Luyện phản xạ câu & 5 Mini-games</h3>
                    <p className="text-[11px] text-[#777184]">Ghép từ, sắp xếp câu cú pháp, điền từ khuyết</p>
                  </div>
                </div>
                <Link
                  href="/exercises"
                  className="btn-editorial-ghost !min-h-[34px] !px-3.5 text-xs font-semibold"
                >
                  Luyện tập
                </Link>
              </div>
            </div>
          </section>

          {/* Card 2: Đánh giá Năng lực HSK (Level Skills Breakdown - Inspired by Image 1 "Level B1") */}
          <section
            aria-labelledby="level-skills-heading"
            className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E2F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEE9FC] text-xl font-black text-[#55449E]">
                  {selectedLevel}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A99AE8]">Năng lực học viên</span>
                    <span className="text-[#D8CFF2]">·</span>
                    <span className="text-xs text-[#777184]">Chuẩn HSK 3.0</span>
                  </div>
                  <h2 id="level-skills-heading" className="text-base font-bold text-[#302B3D]">
                    Phân tích kỹ năng HSK Cấp {selectedLevel}
                  </h2>
                </div>
              </div>

              <Link
                href="/quiz"
                className="btn-editorial-ghost !min-h-[36px] !px-4 text-xs font-bold"
              >
                Kiểm tra Quiz trắc nghiệm ▷
              </Link>
            </div>

            {/* Lưới 3 thanh kỹ năng trực quan */}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {/* Kỹ năng 1: Nhận diện mặt chữ Hán */}
              <div className="rounded-xl border border-[#E7E2F0] bg-[#FAF9FD] p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#302B3D]">
                  <span>Nhận diện chữ Hán</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">
                    {pctStarted}%
                  </span>
                </div>
                <div className="mt-2 text-lg font-extrabold text-[#302B3D]">
                  {startedInLevel} <span className="text-xs font-normal text-[#777184]">/ {totalInLevel} từ</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E7E2F0]">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pctStarted}%` }} />
                </div>
              </div>

              {/* Kỹ năng 2: Bộ nhớ ngắt quãng SM-2 */}
              <div className="rounded-xl border border-[#E7E2F0] bg-[#FAF9FD] p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#302B3D]">
                  <span>Trí nhớ dài hạn SM-2</span>
                  <span className="rounded bg-[#EEE9FC] px-1.5 py-0.5 text-[10px] text-[#55449E]">
                    {pctMastered}%
                  </span>
                </div>
                <div className="mt-2 text-lg font-extrabold text-[#302B3D]">
                  {masteredInLevel} <span className="text-xs font-normal text-[#777184]">từ thuộc vững</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E7E2F0]">
                  <div className="h-full rounded-full bg-[#A99AE8]" style={{ width: `${pctMastered}%` }} />
                </div>
              </div>

              {/* Kỹ năng 3: Cú pháp & Ngữ pháp */}
              <div className="rounded-xl border border-[#E7E2F0] bg-[#FAF9FD] p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#302B3D]">
                  <span>Ngữ pháp trọng điểm</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
                    39 điểm
                  </span>
                </div>
                <div className="mt-2 text-lg font-extrabold text-[#302B3D]">
                  HSK 1–3 <span className="text-xs font-normal text-[#777184]">chuẩn hóa</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E7E2F0]">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Danh mục Học tập Trọng điểm (Education Directions Catalog - Inspired by Image 2 LabAcademy) */}
          <section aria-labelledby="catalog-directions-heading" className="space-y-4">
            <div className="flex items-end justify-between border-b border-[#E7E2F0] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A99AE8]">Hệ sinh thái kiến thức</span>
                <h2 id="catalog-directions-heading" className="text-base font-bold text-[#302B3D]">
                  Hướng học tập & Khám phá chuyên sâu
                </h2>
              </div>
              <span className="text-xs text-[#777184]">HSK 3.0 Standard</span>
            </div>

            {/* Lưới 3 card danh mục màu sắc tinh tế, có nút tròn arrow (Image 2 style) */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: Kho Từ vựng & Hán tự (Xanh Mint dịu) */}
              <div className="rounded-2xl border border-emerald-200 bg-[#EAF8F1] p-5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Từ điển Hán tự
                    </span>
                    <Link
                      href="/words"
                      aria-label="Vào kho từ vựng"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-700 shadow-2xs hover:scale-105 transition-transform"
                    >
                      ↗
                    </Link>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-emerald-950">
                    Kho 2.200+ Từ vựng
                  </h3>
                  <p className="mt-1 text-xs text-emerald-850/80 leading-relaxed">
                    Tra cứu chữ Hán, phát âm bản ngữ, xem mô phỏng bút thuận nét chữ và câu ví dụ song ngữ.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-emerald-200/60">
                  <Link href="/words" className="text-xs font-bold text-emerald-800 hover:underline">
                    Tra cứu từ điển →
                  </Link>
                </div>
              </div>

              {/* Card 2: Phòng 5 Mini-games (Cam đào / Peach dịu) */}
              <div className="rounded-2xl border border-orange-200 bg-[#FDF1EC] p-5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                      5 Mini-Games
                    </span>
                    <Link
                      href="/exercises"
                      aria-label="Vào phòng luyện tập"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-orange-700 shadow-2xs hover:scale-105 transition-transform"
                    >
                      ↗
                    </Link>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-orange-950">
                    Phòng Luyện Phản xạ
                  </h3>
                  <p className="mt-1 text-xs text-orange-850/80 leading-relaxed">
                    Ghép từ, sắp xếp câu cú pháp, điền khuyết, luyện nghe và tình huống giao tiếp thực tế.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-orange-200/60">
                  <Link href="/exercises" className="text-xs font-bold text-orange-850 hover:underline">
                    Vào chơi ngay →
                  </Link>
                </div>
              </div>

              {/* Card 3: Cẩm nang 39 Điểm Ngữ pháp (Tím Lavender dịu) */}
              <div className="rounded-2xl border border-[#DED7F0] bg-[#EEE9FC] p-5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-[#4D3996]">
                      Cấu trúc câu
                    </span>
                    <Link
                      href="/grammar"
                      aria-label="Vào cẩm nang ngữ pháp"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#55449E] shadow-2xs hover:scale-105 transition-transform"
                    >
                      ↗
                    </Link>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#2A1D54]">
                    39 Điểm Ngữ Pháp
                  </h3>
                  <p className="mt-1 text-xs text-[#55449E]/80 leading-relaxed">
                    Giải thích rõ ràng bằng tiếng Việt, công thức mẫu câu và phân tích ví dụ kèm âm thanh.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#DED7F0]/60">
                  <Link href="/grammar" className="text-xs font-bold text-[#4D3996] hover:underline">
                    Khám phá ngữ pháp →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ============================================================
            CỘT PHẢI / SIDEBAR (4 COLS): ACTIVITY STREAK & DAILY TASKS
            ============================================================ */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card A: Activity & Chuỗi ngày học (Streak - Inspired by Image 1) */}
          <section
            aria-labelledby="activity-heading"
            className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777184]">Chuỗi hoạt động</span>
              <span className="text-xs text-[#777184]">7 ngày gần nhất</span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums text-[#302B3D]">
                {stats?.streak ?? 0}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#777184]">
                ngày liên tiếp
              </span>
              <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEE9FC]">
                <Flame size={28} state={stats?.studiedToday ? 'lit' : 'off'} />
              </span>
            </div>

            {/* Dãy 7 ngày trong tuần dạng pills (T2 - CN) */}
            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => {
                const dayData = activity?.days[idx];
                const active = dayData && dayData.reviews > 0;
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-[#55449E] text-white shadow-xs'
                          : 'border border-[#E7E2F0] bg-[#FAF9FD] text-[#9892A6]'
                      }`}
                    >
                      {active ? '⚡' : day[1]}
                    </span>
                    <span className="text-[10px] font-medium text-[#777184]">{day}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-[#D8D1EE] bg-[#FAF9FD] p-3 text-xs">
              <div className="flex items-center justify-between text-[#302B3D] font-semibold">
                <span>Hôm nay: {dailyDone}/{dailyGoal} từ</span>
                <span className="text-[#55449E]">{dailyDone >= dailyGoal ? 'Đạt chỉ tiêu 🎉' : 'Chưa hoàn thành'}</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E7E2F0]">
                <div
                  className="h-full rounded-full bg-[#A99AE8]"
                  style={{ width: `${Math.min(100, Math.round((dailyDone / dailyGoal) * 100))}%` }}
                />
              </div>
            </div>
          </section>

          {/* Card B: Nhiệm vụ hằng ngày (Daily tasks - Inspired by Image 1) */}
          <section
            aria-labelledby="daily-tasks-heading"
            className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-3">
              <h2 id="daily-tasks-heading" className="text-sm font-bold text-[#302B3D]">
                Mục tiêu hôm nay
              </h2>
              <span className="editorial-badge !text-[10px]">SM-2 Active</span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Task 1 */}
              <div className="flex items-center justify-between rounded-xl border border-[#E7E2F0] bg-white p-3 hover:border-[#A99AE8] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEE9FC] text-xs font-bold text-[#55449E]">
                    🔄
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#302B3D]">Ôn tập từ đến hạn</p>
                    <p className="text-[11px] text-[#777184]">{dueCount} từ cần ôn tập</p>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#777184]">2–3 phút</span>
              </div>

              {/* Task 2 */}
              <div className="flex items-center justify-between rounded-xl border border-[#E7E2F0] bg-white p-3 hover:border-[#A99AE8] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF8F1] text-xs font-bold text-emerald-700">
                    💡
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#302B3D]">Học từ vựng mới</p>
                    <p className="text-[11px] text-[#777184]">10 từ / phiên học</p>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#777184]">5 phút</span>
              </div>

              {/* Task 3 */}
              <div className="flex items-center justify-between rounded-xl border border-[#E7E2F0] bg-white p-3 hover:border-[#A99AE8] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FDF1EC] text-xs font-bold text-orange-700">
                    🧩
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#302B3D]">1 Ván mini-game</p>
                    <p className="text-[11px] text-[#777184]">Rèn luyện phản xạ</p>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#777184]">3 phút</span>
              </div>
            </div>

            {/* Prominent Solid CTA (Go to tasks) */}
            <div className="mt-5">
              <Link
                href="/study"
                className="btn-editorial-primary w-full text-center text-xs font-bold !min-h-[46px] shadow-sm"
              >
                Bắt đầu học ngay hôm nay →
              </Link>
            </div>
          </section>

          {/* Card C: Sổ tay cá nhân (Favorites Quick Access) */}
          <section className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="editorial-badge">SỔ TAY</span>
                <h3 className="text-xs font-bold text-[#302B3D]">Từ vựng đã lưu</h3>
              </div>
              <span className="text-xs font-bold text-[#55449E]">
                {favCount !== null ? `${favCount} từ` : 'Đang tải…'}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-[#777184] leading-relaxed">
              Lưu giữ những chữ Hán khó nhớ hoặc mẫu câu cần củng cố riêng biệt.
            </p>
            <div className="mt-4 pt-2 border-t border-[#F0ECF6]">
              <Link href="/favorites" className="text-xs font-semibold text-[#55449E] hover:underline">
                Mở sổ tay từ vựng riêng →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Giao diện khách chưa đăng nhập */
function GuestHome() {
  const [counts, setCounts] = useState<Record<number, number>>({});
  useEffect(() => {
    api<Record<number, number>>('/words/levels').then(setCounts).catch(() => {});
  }, []);

  return (
    <div className="space-y-10">
      <section className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white p-6 sm:p-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="seal h-7 w-7 text-sm font-bold">汉</span>
          <span className="text-xs font-bold tracking-wider uppercase text-[#777184]">Không gian học tiếng Trung hiện đại</span>
        </div>
        <h1 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-[#302B3D] sm:text-4xl">
          Chào mừng bạn đến với <span lang="zh-Hans" className="hanzi font-bold text-[#55449E]">学汉语</span>
        </h1>
        <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-[#777184] sm:text-sm">
          Nền tảng kết hợp phong cách thiết kế biên tập Trung Hoa và EdTech hiện đại. Học từ vựng theo thuật toán SM-2, lộ trình 9 giai đoạn từ con số 0, phòng luyện tập 5 mini-games và cẩm nang ngữ pháp HSK hoàn toàn bằng tiếng Việt.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login?mode=up" className="btn-editorial-primary text-xs sm:text-sm font-bold !min-h-[44px] !px-6 shadow-sm">
            Tạo tài khoản miễn phí
          </Link>
          <Link href="/login" className="btn-editorial-ghost text-xs sm:text-sm font-semibold !min-h-[44px] !px-5">
            Đăng nhập
          </Link>
        </div>
      </section>

      {/* 3 Trục danh mục chính cho khách */}
      <section aria-labelledby="guest-categories" className="space-y-4">
        <div className="border-b border-[#E7E2F0] pb-2.5">
          <h2 id="guest-categories" className="text-sm font-bold uppercase tracking-wider text-[#9892A6]">
            Hệ sinh thái học tập toàn diện
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-[#EAF8F1] p-5 flex flex-col justify-between">
            <div>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                01 Lộ trình
              </span>
              <h3 className="mt-3 text-sm font-bold text-emerald-950">Lộ trình học từ số 0</h3>
              <p className="mt-1 text-xs text-emerald-850/80 leading-relaxed">
                9 giai đoạn tuần tự từ phiên âm Pinyin, nét chữ, chào hỏi đến giao tiếp phản xạ.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-emerald-200/60">
              <Link href="/path" className="text-xs font-semibold text-emerald-800 hover:underline">
                Xem lộ trình →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-[#FDF1EC] p-5 flex flex-col justify-between">
            <div>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                02 Thực hành
              </span>
              <h3 className="mt-3 text-sm font-bold text-orange-950">Phòng 5 Mini-games</h3>
              <p className="mt-1 text-xs text-orange-850/80 leading-relaxed">
                Ghép từ, sắp xếp câu cú pháp, điền từ khuyết, luyện nghe và tình huống giao tiếp đời sống.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-orange-200/60">
              <Link href="/exercises" className="text-xs font-semibold text-orange-850 hover:underline">
                Thử bài tập ngay →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DED7F0] bg-[#EEE9FC] p-5 flex flex-col justify-between">
            <div>
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-[#4D3996]">
                03 Học thuật
              </span>
              <h3 className="mt-3 text-sm font-bold text-[#2A1D54]">39 Điểm ngữ pháp</h3>
              <p className="mt-1 text-xs text-[#55449E]/80 leading-relaxed">
                Cẩm nang cấu trúc câu chuẩn HSK 1–3, giải thích cặn kẽ và ví dụ có pinyin, âm thanh.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#DED7F0]/60">
              <Link href="/grammar" className="text-xs font-semibold text-[#4D3996] hover:underline">
                Khám phá ngữ pháp →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Phân cấp HSK */}
      <section aria-labelledby="chon-cap-do">
        <div className="mb-4 flex items-center justify-between border-b border-[#E7E2F0] pb-3">
          <h2 id="chon-cap-do" className="text-base font-bold text-[#302B3D]">Kho từ vựng theo cấp độ HSK 3.0</h2>
          <span className="text-xs text-[#777184]">2.200+ từ vựng chuẩn</span>
        </div>
        <ol className="divide-y divide-[#E7E2F0] overflow-hidden rounded-2xl border-2 border-[#D8D1EE] bg-white shadow-sm">
          {[1, 2, 3].map((lv) => (
            <li
              key={lv}
              className="grid gap-4 p-5 transition-colors hover:bg-[#FAF9FD] md:grid-cols-[8.5rem_1fr_auto] md:items-center md:gap-6"
            >
              <div className="flex items-center gap-3 md:block">
                <span lang="zh-Hans" aria-hidden className="hanzi text-3xl font-bold leading-none text-[#302B3D]">
                  {HAN[lv]}
                </span>
                <div className="md:mt-1">
                  <span className="editorial-badge">HSK {lv}</span>
                </div>
              </div>
              <div>
                <p className="text-xs leading-relaxed text-[#777184]">{DESC[lv]}</p>
                <p className="mt-1 text-xs font-semibold text-[#302B3D]">
                  {counts[lv] ? `${counts[lv]} từ vựng chuẩn` : 'Hơn 500 từ vựng'}
                </p>
              </div>
              <div className="flex items-center gap-2 md:w-52">
                <Link className="btn-editorial-primary flex-1 text-center text-xs font-bold !min-h-[40px] shadow-sm" href={`/words?level=${lv}`}>
                  Kho từ vựng
                </Link>
                <Link className="btn-editorial-ghost flex-1 text-center text-xs font-semibold !min-h-[40px]" href="/exercises">
                  Luyện tập
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
