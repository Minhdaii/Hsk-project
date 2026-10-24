'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import type { Activity, LevelProgress } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import Skeleton from '@/components/Skeleton';

export default function LearningStatsPage() {
  const { user, loading } = useUser();
  const { stats } = useStats(!!user);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [levels, setLevels] = useState<LevelProgress[] | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    Promise.all([
      api<Activity>('/study/activity').catch(() => null),
      api<{ levels: LevelProgress[] }>('/study/levels').catch(() => null),
    ]).then(([act, lvs]) => {
      if (act) setActivity(act);
      if (lvs) setLevels(lvs.levels);
      setFetching(false);
    });
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-1/3" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="editorial-card mx-auto max-w-md p-8 text-center">
        <p lang="zh-Hans" aria-hidden className="hanzi text-5xl font-bold text-[#55449E]">
          数据
        </p>
        <h2 className="mt-4 text-base font-bold text-[#302B3D]">Yêu cầu đăng nhập</h2>
        <p className="mt-1.5 text-xs text-[#777184]">
          Đăng nhập để theo dõi bức tranh toàn cảnh về tiến độ học tập và biểu đồ hoạt động của bạn.
        </p>
        <div className="mt-5">
          <Link href="/login" className="btn-editorial-primary w-full text-center text-xs">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const totalWords = levels?.reduce((sum, l) => sum + l.total, 0) ?? 2209;
  const startedWords = levels?.reduce((sum, l) => sum + l.started, 0) ?? 0;
  const masteredWords = levels?.reduce((sum, l) => sum + l.mastered, 0) ?? 0;
  const totalReviews = activity?.days.reduce((sum, d) => sum + d.reviews, 0) ?? 0;
  const streak = stats?.streak ?? 0;
  const xp = stats?.xp ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        glyph="数"
        title="Thống kê học tập"
        subtitle="Dữ liệu tiến độ thực tế, độ liên tục và biểu đồ hoạt động học tập của bạn"
        actions={
          <Link href="/study" className="btn-editorial-primary text-xs">
            Tiếp tục học ngay →
          </Link>
        }
      />

      {/* 4 Thống kê chính */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="editorial-card p-5">
          <span className="editorial-badge">TỪ ĐÃ HỌC</span>
          <div className="mt-2 text-3xl font-extrabold text-[#302B3D] tabular-nums">
            {startedWords} <span className="text-xs font-normal text-[#777184]">/ {totalWords}</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">{Math.round((startedWords / totalWords) * 100)}% tổng số từ vựng</p>
        </div>

        <div className="editorial-card p-5">
          <span className="editorial-badge">ĐÃ THUỘC VỮNG</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-700 tabular-nums">
            {masteredWords} <span className="text-xs font-normal text-[#777184]">từ</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">Nhớ sâu theo chuẩn SM-2</p>
        </div>

        <div className="editorial-card p-5">
          <span className="editorial-badge">CHUỖI NGÀY HỌC</span>
          <div className="mt-2 text-3xl font-extrabold text-[#55449E] tabular-nums">
            {streak} <span className="text-xs font-normal text-[#777184]">ngày</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">Độ liên tục học tập</p>
        </div>

        <div className="editorial-card p-5">
          <span className="editorial-badge">ĐIỂM KINH NGHIỆM</span>
          <div className="mt-2 text-3xl font-extrabold text-[#A99AE8] tabular-nums">
            {xp} <span className="text-xs font-normal text-[#777184]">XP</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">{totalReviews} lượt ôn tập hoàn thành</p>
        </div>
      </div>

      {/* Chi tiết phân bổ theo cấp độ HSK 1, 2, 3 */}
      <section className="editorial-card p-6" aria-labelledby="chi-tiet-cap-do">
        <h2 id="chi-tiet-cap-do" className="text-sm font-bold text-[#302B3D]">
          Phân bổ từ vựng theo cấp độ
        </h2>
        <div className="mt-4 space-y-4">
          {levels?.map((l) => {
            const pctStarted = Math.round((l.started / l.total) * 100);
            const pctMastered = Math.round((l.mastered / l.total) * 100);
            return (
              <div key={l.level} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#302B3D]">HSK Cấp {l.level}</span>
                  <span className="text-[#777184]">
                    {l.started}/{l.total} từ ({pctStarted}%) · Đã thuộc: {l.mastered} ({pctMastered}%)
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-[#EEE9FC]">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#C8BEF2] transition-all duration-500"
                    style={{ width: `${pctStarted}%` }}
                  />
                  <div
                    className="bar-fill absolute inset-y-0 left-0 bg-[#A99AE8] transition-all duration-500"
                    style={{ width: `${pctMastered}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Biểu đồ 7 ngày gần đây */}
      {activity && (
        <section className="editorial-card p-6" aria-labelledby="hoat-dong-tuan">
          <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-3">
            <div>
              <h2 id="hoat-dong-tuan" className="text-sm font-bold text-[#302B3D]">
                Hoạt động ôn tập 7 ngày
              </h2>
              <p className="mt-0.5 text-xs text-[#777184]">Tổng số câu và thẻ từ đã học mỗi ngày</p>
            </div>
            <span className="text-xs font-semibold text-[#55449E]">
              {totalReviews} lượt ôn tập trong tuần
            </span>
          </div>

          <div className="mt-6 flex h-36 items-end gap-3 sm:gap-6">
            {activity.days.map((d, i) => {
              const max = Math.max(activity.goal, ...activity.days.map((x) => x.reviews), 1);
              const isToday = i === activity.days.length - 1;
              const heightPx = Math.max(6, (d.reviews / max) * 96);
              const label = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(d.date + 'T00:00:00').getDay()];

              return (
                <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[11px] font-semibold tabular-nums text-[#777184]">
                    {d.reviews || 0}
                  </span>
                  <div
                    className={`w-full max-w-[2.5rem] rounded-t transition-all duration-500 ${
                      isToday ? 'bg-[#A99AE8]' : 'bg-[#DDD6F0] hover:bg-[#C8BEF2]'
                    }`}
                    style={{ height: `${heightPx}px` }}
                  />
                  <span
                    className={`text-[11px] truncate ${
                      isToday ? 'font-bold text-[#55449E]' : 'font-medium text-[#777184]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
