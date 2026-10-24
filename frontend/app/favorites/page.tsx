'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import type { Word } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import FavoriteButton from '@/components/FavoriteButton';
import PageHeader from '@/components/PageHeader';
import Skeleton from '@/components/Skeleton';

export default function FavoritesPage() {
  const { user, loading } = useUser();
  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api<{ items: Word[] }>('/favorites')
      .then((r) => setWords(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải sổ tay'));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-1/3" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="editorial-card mx-auto max-w-md p-8 text-center">
        <p lang="zh-Hans" aria-hidden className="hanzi text-5xl font-bold text-[#A99AE8]">
          收藏
        </p>
        <h2 className="mt-4 text-base font-bold text-[#302B3D]">Sổ tay từ vựng cá nhân</h2>
        <p className="mt-1.5 text-xs text-[#777184]">
          Vui lòng đăng nhập để lưu giữ những từ vựng khó nhớ hoặc cần ôn luyện trọng điểm vào sổ tay riêng.
        </p>
        <div className="mt-5">
          <Link href="/login" className="btn-editorial-primary w-full text-center text-xs">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        glyph="藏"
        title="Sổ tay từ vựng riêng"
        subtitle={
          words
            ? `${words.length} mục từ đã được lưu giữ để ôn tập trọng điểm`
            : 'Đang tải danh sách từ đã lưu…'
        }
      />

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          {error}
        </p>
      )}

      {words && words.length === 0 && (
        <div className="editorial-card space-y-4 p-10 text-center">
          <p lang="zh-Hans" aria-hidden className="hanzi text-5xl font-bold text-[#A99AE8]/40">
            收藏
          </p>
          <div>
            <h3 className="text-base font-bold text-[#302B3D]">Chưa có từ vựng nào trong sổ tay</h3>
            <p className="mt-1 text-xs text-[#777184]">
              Trong khi học hoặc tra cứu từ điển, hãy bấm vào biểu tượng ngôi sao ☆ để lưu lại những từ bạn muốn ôn tập riêng.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/words" className="btn-editorial-primary text-xs">
              Khám phá kho từ vựng HSK
            </Link>
          </div>
        </div>
      )}

      {words && words.length > 0 && (
        <div className="editorial-card overflow-hidden">
          <ul className="divide-y divide-[#E7E2F0]">
            {words.map((w) => (
              <li
                key={w.id}
                className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#EEE9FC]/30 sm:gap-4 sm:px-5"
              >
                <Link href={`/word/${w.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    lang="zh-Hans"
                    className="hanzi min-w-[3.5rem] max-w-[40%] shrink-0 break-all text-3xl font-bold leading-tight text-[#302B3D] sm:min-w-[4.75rem] sm:text-4xl"
                  >
                    {w.hanzi}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="pinyin block break-words text-sm font-semibold text-[#55449E]">
                      {w.pinyin}
                    </span>
                    <span className="line-clamp-2 break-words text-xs text-[#504A5D]">
                      {w.meaningVi || w.meaningEn}
                    </span>
                  </span>
                </Link>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="editorial-badge">HSK {w.hskLevel}</span>
                  <FavoriteButton wordId={w.id} className="!h-9 !w-9 !text-sm" />
                  <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
