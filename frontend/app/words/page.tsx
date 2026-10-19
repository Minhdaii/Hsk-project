'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import FavoriteButton from '@/components/FavoriteButton';
import { levelAccent, levelPill } from '@/lib/levels';
import { RowSkeleton } from '@/components/Skeleton';

const PAGE = 30;

function WordsInner() {
  const sp = useSearchParams();
  const [level, setLevel] = useState<number>(Number(sp.get('level') || '0'));
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setPage(0); }, [level, q]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page: String(page + 1), limit: String(PAGE) });
        if (level) params.set('level', String(level));
        if (q.trim()) params.set('q', q.trim());
        const res = await api<{ items: Word[]; total: number }>(`/words?${params}`);
        setWords(res.items);
        setTotal(res.total);
      } catch (e) { setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'); }
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [level, q, page]);

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Từ vựng HSK</h1>
        <p className="text-sm text-stone-500">{loading ? 'Đang tải…' : `${total} từ`}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={l === level ? 'btn-primary' : 'btn-ghost'}>
            {l === 0 ? 'Tất cả' : `HSK ${l}`}
          </button>
        ))}
      </div>

      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo chữ Hán, pinyin hoặc nghĩa tiếng Việt…"
        className="input"
      />

      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}

      {loading && words.length === 0 && <RowSkeleton />}
      <ul className={`space-y-2.5 transition-opacity duration-200 ${loading && words.length > 0 ? 'opacity-60' : ''}`}>
        {words.map((w, i) => (
          <li key={w.id} style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }} className={`card flex animate-fade-up items-center gap-3 border-l-4 !p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft sm:gap-4 ${levelAccent(w.hskLevel)}`}>
            <Link href={`/word/${w.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <span className="hanzi flex h-16 min-w-[4rem] shrink-0 items-center justify-center rounded-xl bg-stone-50 px-2 text-3xl">{w.hanzi}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-brand">{w.pinyin}</span>
                <span className="line-clamp-2 break-words text-sm text-stone-600">{w.meaningVi || w.meaningEn}</span>
              </span>
            </Link>
            <span className={`pill hidden shrink-0 sm:inline-flex ${levelPill(w.hskLevel)}`}>HSK {w.hskLevel}</span>
            <FavoriteButton wordId={w.id} className="hidden sm:inline-flex" />
            <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
          </li>
        ))}
        {!loading && words.length === 0 && !error && <li className="card text-center text-stone-500">Không tìm thấy từ nào.</li>}
      </ul>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button className="btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>← Trước</button>
        <span className="text-sm text-stone-600">{page + 1} / {pages}</span>
        <button className="btn-ghost" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau →</button>
      </div>
    </div>
  );
}

export default function WordsPage() {
  return <Suspense fallback={<p>Đang tải…</p>}><WordsInner /></Suspense>;
}
