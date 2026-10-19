'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import type { Word } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import FavoriteButton from '@/components/FavoriteButton';

export default function FavoritesPage() {
  const { user, loading } = useUser();
  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api<{ items: Word[] }>('/favorites').then((r) => setWords(r.items)).catch((e) => setError(e.message));
  }, [user]);

  if (loading) return <p>Đang tải…</p>;
  if (!user) {
    return (
      <div className="card mx-auto max-w-md space-y-3 text-center">
        <div className="text-4xl">⭐</div>
        <p>Đăng nhập để lưu các từ khó nhớ vào sổ tay của bạn.</p>
        <Link href="/login" className="btn-primary">Đăng nhập</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sổ tay từ vựng</h1>
        <p className="text-sm text-stone-500">{words ? `${words.length} từ đã lưu` : 'Đang tải…'}</p>
      </div>
      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
      {words && words.length === 0 && (
        <div className="card space-y-3 py-10 text-center">
          <div className="text-4xl">☆</div>
          <p className="text-stone-600">Chưa có từ nào. Bấm ☆ ở danh sách từ để lưu.</p>
          <Link href="/words" className="btn-primary">Xem từ vựng</Link>
        </div>
      )}
      <ul className="space-y-2.5">
        {words?.map((w) => (
          <li key={w.id} className="card flex items-center gap-3 !p-3 sm:gap-4">
            <Link href={`/word/${w.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <span className="hanzi flex h-16 min-w-[4rem] shrink-0 items-center justify-center rounded-xl bg-stone-50 px-2 text-3xl">{w.hanzi}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-brand">{w.pinyin}</span>
                <span className="line-clamp-2 break-words text-sm text-stone-600">{w.meaningVi || w.meaningEn}</span>
              </span>
            </Link>
            <FavoriteButton wordId={w.id} />
            <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
          </li>
        ))}
      </ul>
    </div>
  );
}
