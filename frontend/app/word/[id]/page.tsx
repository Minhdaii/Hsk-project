'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { WordDetail } from '@/lib/types';
import { posLabels, splitMeaning } from '@/lib/pos';
import SpeakButton from '@/components/SpeakButton';
import FavoriteButton from '@/components/FavoriteButton';
import Skeleton from '@/components/Skeleton';
import HanziWriterBox from '@/components/HanziWriterBox';

export default function WordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [word, setWord] = useState<WordDetail | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api<WordDetail>(`/words/${id}`).then(setWord).catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <div className="editorial-card mx-auto max-w-lg p-8 text-center">
        <p className="text-xs text-[#777184]">Không tìm thấy thông tin từ vựng này.</p>
        <div className="mt-4">
          <Link href="/words" className="btn-editorial-ghost text-xs">
            ← Quay lại kho từ vựng
          </Link>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const chars = Array.from(word.hanzi).filter((c) => /[\u3400-\u9fff]/.test(c));
  const vi = splitMeaning(word.meaningVi);
  const en = splitMeaning(word.meaningEn);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/words"
          className="inline-flex min-h-[36px] items-center text-xs font-semibold text-[#777184] transition-colors hover:text-[#302B3D]"
        >
          ← Quay lại kho từ vựng
        </Link>
      </div>

      {/* Thẻ đại tự phong cách Lavender White */}
      <div className="editorial-card relative overflow-hidden p-8 text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {word.hskLevel && <span className="editorial-badge">HSK CẤP {word.hskLevel}</span>}
          {posLabels(word.pos).map((p) => (
            <span key={p} className="editorial-badge-stone">
              {p}
            </span>
          ))}
        </div>

        <div lang="zh-Hans" className="hanzi mt-5 break-words text-7xl font-bold leading-none text-[#302B3D] sm:text-8xl">
          {word.hanzi}
        </div>

        {word.traditional && word.traditional !== word.hanzi && (
          <div className="hanzi mt-2 text-sm text-[#777184]">
            Phồn thể: <span className="font-semibold text-[#302B3D]">{word.traditional}</span>
          </div>
        )}

        <div className="pinyin mt-3 text-3xl font-bold text-[#55449E] sm:text-4xl">
          {word.pinyin}
        </div>

        {word.hanviet && (
          <div className="mt-1.5 text-xs font-medium text-[#777184]">
            Âm Hán Việt: <span className="font-semibold text-[#302B3D]">{word.hanviet}</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-[#E7E2F0] pt-5">
          <SpeakButton text={word.hanzi} audioUrl={word.audioUrl} label />
          <FavoriteButton wordId={word.id} label />
        </div>
      </div>

      {/* Giải nghĩa tiếng Việt */}
      <div className="editorial-card space-y-4 p-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#777184]">
            Nghĩa tiếng Việt
          </h2>
          {vi.length > 0 ? (
            <ul className="mt-2.5 space-y-2">
              {vi.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-[#302B3D]">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A99AE8]" />
                  <span className="font-medium">{m}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-[#777184]">Chưa có dữ liệu nghĩa tiếng Việt cho mục này.</p>
          )}
        </div>

        {en.length > 0 && (
          <div className="border-t border-[#E7E2F0] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9892A6]">
              Nghĩa bổ sung (Tiếng Anh)
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#777184]">{en.join('; ')}</p>
          </div>
        )}
      </div>

      {/* Thứ tự nét viết chữ Hán */}
      <div className="editorial-card p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#E7E2F0] pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#777184]">
            Thứ tự nét chữ Hán (Bút thuận)
          </h2>
          <span className="text-xs text-[#9892A6]">Chạm vào từng ô để xem mô phỏng nét viết</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 py-2">
          {chars.map((c, i) => (
            <HanziWriterBox key={c + i} char={c} />
          ))}
        </div>
      </div>

      {/* Câu ví dụ ngữ cảnh */}
      {word.examples.length > 0 && (
        <div className="editorial-card p-6">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#777184]">
            Câu ví dụ ngữ cảnh ({word.examples.length})
          </h2>
          <ul className="divide-y divide-[#E7E2F0]">
            {word.examples.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div lang="zh-Hans" className="hanzi break-words text-lg font-bold leading-snug text-[#302B3D]">
                    {e.hanzi}
                  </div>
                  {e.pinyin && (
                    <div className="pinyin mt-0.5 break-words text-xs font-semibold text-[#55449E]">
                      {e.pinyin}
                    </div>
                  )}
                  {e.meaningVi && (
                    <div className="mt-1 break-words text-xs leading-relaxed text-[#777184]">
                      {e.meaningVi}
                    </div>
                  )}
                </div>
                <div className="shrink-0 pt-0.5">
                  <SpeakButton text={e.hanzi} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
