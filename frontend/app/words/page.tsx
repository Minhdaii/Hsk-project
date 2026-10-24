'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import FavoriteButton from '@/components/FavoriteButton';
import { RowSkeleton } from '@/components/Skeleton';
import PageHeader from '@/components/PageHeader';

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
      } catch (e) { setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải dữ liệu từ vựng'); }
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [level, q, page]);

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="space-y-6">
      <PageHeader
        glyph="库"
        title="Kho từ vựng HSK 1–3"
        subtitle={loading ? 'Đang tra cứu từ điển…' : `Tổng cộng ${total.toLocaleString('vi-VN')} từ vựng chuẩn`}
      />

      {/* Bộ lọc cấp độ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Lọc theo cấp độ" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <div className="inline-flex rounded-lg border border-[#E7E2F0] bg-white p-0.5">
            {[0, 1, 2, 3].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                aria-pressed={l === level}
                className={`min-h-[36px] whitespace-nowrap rounded-md px-4 text-xs font-bold transition-all ${
                  l === level
                    ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                    : 'text-[#777184] hover:text-[#302B3D]'
                }`}
              >
                {l === 0 ? 'Tất cả cấp độ' : `HSK ${l}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 sm:max-w-md">
          <label htmlFor="tim-tu-vung" className="sr-only">Tìm kiếm từ vựng</label>
          <input
            id="tim-tu-vung"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tra chữ Hán, phiên âm pinyin hoặc nghĩa tiếng Việt…"
            className="w-full rounded-lg border border-[#E7E2F0] bg-white px-4 py-2.5 text-xs text-[#302B3D] outline-none transition-colors placeholder:text-[#9892A6] focus:border-[#A99AE8] focus:ring-1 focus:ring-[#A99AE8]"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-xs text-red-800">
          {error}
        </p>
      )}

      {loading && words.length === 0 && <RowSkeleton />}

      {(words.length > 0 || (!loading && !error)) && (
        <div className="editorial-card overflow-hidden">
          <ul className={`divide-y divide-[#E7E2F0] transition-opacity duration-200 ${loading && words.length > 0 ? 'opacity-50' : ''}`}>
            {words.map((w) => (
              <li
                key={w.id}
                className="group flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-[#FAF9FD] sm:flex-row sm:items-center sm:gap-6 sm:px-5"
              >
                <Link href={`/word/${w.id}`} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                  {/* Cột trái: Chữ Hán & Phiên âm Pinyin */}
                  <div className="flex shrink-0 items-center gap-3 sm:w-44 sm:gap-3.5">
                    <span
                      lang="zh-Hans"
                      className="hanzi shrink-0 text-3xl font-bold leading-none text-[#302B3D] sm:text-4xl"
                    >
                      {w.hanzi}
                    </span>
                    <span className="pinyin break-words text-sm font-semibold text-[#55449E]">
                      {w.pinyin}
                    </span>
                  </div>

                  {/* Cột phải: Nghĩa tiếng Việt & Âm Hán Việt */}
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs sm:text-sm font-medium leading-relaxed text-[#302B3D]">
                      {w.meaningVi || w.meaningEn}
                    </p>
                    {w.hanviet && (
                      <span className="mt-0.5 inline-block text-[11px] text-[#777184]">
                        Âm Hán Việt: {w.hanviet}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Tiện ích thao tác */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#E7E2F0]/60 pt-2 sm:border-0 sm:pt-0">
                  <span className="editorial-badge">HSK {w.hskLevel}</span>
                  <FavoriteButton wordId={w.id} className="!h-8 !w-8 !text-xs sm:!h-9 sm:!w-9 sm:!text-sm" />
                  <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
                </div>
              </li>
            ))}

            {!loading && words.length === 0 && !error && (
              <li className="p-10 text-center text-xs text-[#777184]">
                Không tìm thấy từ vựng phù hợp với từ khóa của bạn.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Điều hướng phân trang */}
      <nav aria-label="Phân trang" className="flex items-center justify-between border-t border-[#E7E2F0] pt-4">
        <button
          className="btn-editorial-ghost !min-h-[38px] !px-4 text-xs"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          ← Trang trước
        </button>
        <span className="text-xs font-semibold tabular-nums text-[#777184]">
          Trang {page + 1} / {pages}
        </span>
        <button
          className="btn-editorial-ghost !min-h-[38px] !px-4 text-xs"
          disabled={page + 1 >= pages}
          onClick={() => setPage(page + 1)}
        >
          Trang sau →
        </button>
      </nav>
    </div>
  );
}

export default function WordsPage() {
  return (
    <Suspense fallback={<p className="text-xs text-stone-500">Đang tải kho từ vựng…</p>}>
      <WordsInner />
    </Suspense>
  );
}
