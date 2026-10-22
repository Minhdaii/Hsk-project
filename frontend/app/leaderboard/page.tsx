'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { LeaderRow } from '@/lib/types';
import PageHeader from '@/components/PageHeader';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ items: LeaderRow[] }>('/leaderboard').then((r) => setRows(r.items)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Bảng xếp hạng" subtitle="Top 10 theo điểm XP (mỗi lượt ôn được 10 XP). Tên được rút gọn để bảo mật." />
      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
      {rows && rows.length === 0 && <p className="card text-center text-stone-500">Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên!</p>}
      <ol className="space-y-2.5">
        {rows?.map((r) => (
          <li key={r.rank} className={`card flex items-center gap-4 !p-4 ${r.rank === 1 ? 'border-amber-300 shadow-soft' : ''}`}>
            <span className="w-8 text-center text-2xl font-bold text-stone-500">{MEDAL[r.rank - 1] ?? r.rank}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
            <span className="pill">🔥 {r.streak}</span>
            <span className="w-20 text-right font-bold text-brand">{r.xp} XP</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
