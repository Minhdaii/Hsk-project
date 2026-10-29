'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { LeaderRow } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import Skeleton from '@/components/Skeleton';

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ items: LeaderRow[] }>('/leaderboard')
      .then((r) => setRows(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải bảng xếp hạng'));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        glyph="榜"
        title="Bảng xếp hạng học tập"
        subtitle="Vinh danh 10 học viên tích cực nhất theo điểm kinh nghiệm XP (mỗi lượt ôn hoàn thành đạt +10 XP). Tên hiển thị ẩn danh để bảo mật."
      />

      {error && (
        <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-xs text-red-800">
          {error}
        </p>
      )}

      {!rows && !error && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      )}

      {rows && rows.length === 0 && (
        <div className="editorial-card p-10 text-center">
          <p className="text-xs text-stone-700">
            Chưa có dữ liệu học viên trên bảng xếp hạng. Hãy là người đầu tiên hoàn thành lượt ôn hôm nay!
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="editorial-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-brand-soft/30 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-stone-600">
            <span>Học viên</span>
            <div className="flex items-center gap-8">
              <span>Chuỗi ngày</span>
              <span>Điểm XP</span>
            </div>
          </div>
          <ol className="divide-y divide-line">
            {rows.map((r) => (
              <li
                key={r.rank}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-soft/20 ${
                  r.rank === 1 ? 'bg-brand-soft/30' : ''
                }`}
              >
                <div className="flex w-7 shrink-0 items-center justify-center">
                  {r.rank === 1 ? (
                    <span className="seal h-7 w-7 text-xs font-bold shadow-sm">一</span>
                  ) : r.rank === 2 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-ink text-xs font-bold text-white">
                      二
                    </span>
                  ) : r.rank === 3 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-500 text-xs font-bold text-white">
                      三
                    </span>
                  ) : (
                    <span className="text-xs font-bold tabular-nums text-stone-600">
                      {r.rank}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">
                    {r.name}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="editorial-badge-stone text-xs">
                    {r.streak} ngày
                  </span>
                  <span className="w-20 text-right text-xs font-bold tabular-nums text-brand-ink">
                    {r.xp.toLocaleString('vi-VN')} XP
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
