'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import type { Card, LevelProgress, Word } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import PageHeader from '@/components/PageHeader';
import Skeleton from '@/components/Skeleton';

export default function ReviewCenterPage() {
  const { user, loading } = useUser();
  const { stats } = useStats(!!user);
  const [level, setLevel] = useState(1);
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [favorites, setFavorites] = useState<Word[]>([]);
  const [levels, setLevels] = useState<LevelProgress[] | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    Promise.all([
      api<{ cards: Card[] }>(`/study/session?level=${level}`).catch(() => ({ cards: [] })),
      api<{ items: Word[] }>('/favorites').catch(() => ({ items: [] })),
      api<{ levels: LevelProgress[] }>('/study/levels').catch(() => ({ levels: [] })),
    ]).then(([sessRes, favRes, lvRes]) => {
      setDueCards(sessRes.cards.filter((c) => !!c.progress));
      setFavorites(favRes.items);
      setLevels(lvRes.levels);
      setFetching(false);
    });
  }, [user, level]);

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
        <p lang="zh-Hans" aria-hidden className="hanzi text-5xl font-bold text-[#55449E]">
          复习
        </p>
        <h2 className="mt-4 text-base font-bold text-[#302B3D]">Yêu cầu đăng nhập</h2>
        <p className="mt-1.5 text-xs text-[#777184]">
          Đăng nhập để xem danh sách từ vựng đến hạn ôn tập được tính toán riêng theo tiến độ của bạn.
        </p>
        <div className="mt-5">
          <Link href="/login" className="btn-editorial-primary w-full text-center text-xs">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const dueCount = stats?.due ?? dueCards.length;
  const currentLevelProgress = levels?.find((x) => x.level === level);
  const mastered = currentLevelProgress?.mastered ?? 0;
  const started = currentLevelProgress?.started ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        glyph="复"
        title="Trung tâm ôn tập ngắt quãng"
        subtitle="Quản lý và ôn lại các từ vựng đến hạn, từ khó ghi nhớ theo thuật toán SM-2"
        actions={
          <Link href="/study" className="btn-editorial-primary text-xs">
            Bắt đầu ôn tập ngay ({dueCount} thẻ) →
          </Link>
        }
      />

      {/* 3 Thẻ chỉ số bộ nhớ */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="editorial-card p-5">
          <span className="editorial-badge">ĐẾN HẠN HÔM NAY</span>
          <div className="mt-2 text-3xl font-extrabold text-[#55449E] tabular-nums">
            {dueCount} <span className="text-sm font-normal text-[#777184]">từ</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">Đã đến chu kỳ lặp lại cần ôn ngay</p>
        </div>

        <div className="editorial-card p-5">
          <span className="editorial-badge-stone">ĐANG CỦNG CỐ</span>
          <div className="mt-2 text-3xl font-extrabold text-[#302B3D] tabular-nums">
            {started - mastered} <span className="text-sm font-normal text-[#777184]">từ</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">Đang trong chu kỳ lặp lại SM-2</p>
        </div>

        <div className="editorial-card p-5">
          <span className="editorial-badge-stone">ĐÃ THUỘC VỮNG</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-700 tabular-nums">
            {mastered} <span className="text-sm font-normal text-[#777184]">từ</span>
          </div>
          <p className="mt-1 text-xs text-[#777184]">Đạt khoảng cách lặp lại xa</p>
        </div>
      </div>

      {/* Bộ lọc cấp độ */}
      <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#777184]">Cấp độ:</span>
          <div role="group" aria-label="Chọn cấp độ ôn tập" className="inline-flex rounded-lg border border-[#E7E2F0] bg-[#FAF9FD] p-0.5">
            {[1, 2, 3].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                aria-pressed={l === level}
                className={`min-h-[34px] rounded-md px-3.5 text-xs font-bold transition-all ${
                  l === level
                    ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                    : 'text-[#777184] hover:text-[#302B3D]'
                }`}
              >
                HSK {l}
              </button>
            ))}
          </div>
        </div>

        <Link href={`/study?level=${level}`} className="btn-editorial-soft !min-h-[36px] text-xs">
          Ôn tập HSK {level} →
        </Link>
      </div>

      {/* Danh sách từ đến hạn hôm nay */}
      <section className="editorial-card overflow-hidden" aria-labelledby="danh-sach-den-han">
        <div className="flex items-center justify-between border-b border-[#E7E2F0] bg-[#FAF9FD] px-5 py-3">
          <h2 id="danh-sach-den-han" className="text-xs font-bold uppercase tracking-wider text-[#302B3D]">
            Hàng đợi ôn tập HSK {level} ({dueCards.length} từ)
          </h2>
          <span className="text-[11px] text-[#777184]">Sắp xếp theo ngày đến hạn</span>
        </div>

        {fetching ? (
          <div className="p-6 text-center text-xs text-[#777184]">Đang kiểm tra dữ liệu lịch ôn…</div>
        ) : dueCards.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#777184]">
            Hiện tại không có từ nào ở HSK {level} bị quá hạn ôn tập. Tuyệt vời!
          </div>
        ) : (
          <ul className="divide-y divide-[#E7E2F0]">
            {dueCards.slice(0, 8).map((c) => (
              <li key={c.word.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#FAF9FD]">
                <div className="flex items-center gap-4 min-w-0">
                  <span lang="zh-Hans" className="hanzi text-3xl font-bold text-[#302B3D] min-w-[3.5rem]">
                    {c.word.hanzi}
                  </span>
                  <div className="min-w-0">
                    <span className="pinyin block text-xs font-semibold text-[#55449E]">
                      {c.word.pinyin}
                    </span>
                    <span className="line-clamp-1 text-xs text-[#777184]">
                      {c.word.meaningVi || c.word.meaningEn}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="editorial-badge !text-[11px]">Cần ôn</span>
                  <SpeakButton text={c.word.hanzi} audioUrl={c.word.audioUrl} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Từ khó ghi nhớ từ Sổ tay (Favorites) */}
      <section className="editorial-card overflow-hidden" aria-labelledby="tu-kho-so-tay">
        <div className="flex items-center justify-between border-b border-[#E7E2F0] bg-[#FAF9FD] px-5 py-3">
          <h2 id="tu-kho-so-tay" className="text-xs font-bold uppercase tracking-wider text-[#302B3D]">
            Từ khó được lưu riêng trong sổ tay ({favorites.length} từ)
          </h2>
          <Link href="/favorites" className="text-xs font-semibold text-[#55449E] hover:underline">
            Xem toàn bộ sổ tay →
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#777184]">
            Chưa có từ nào trong sổ tay. Khi học flashcard hoặc tra từ điển, bạn có thể bấm ☆ để lưu từ khó vào đây.
          </div>
        ) : (
          <ul className="divide-y divide-[#E7E2F0]">
            {favorites.slice(0, 6).map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#FAF9FD]">
                <div className="flex items-center gap-4 min-w-0">
                  <span lang="zh-Hans" className="hanzi text-2xl font-bold text-[#302B3D] min-w-[3rem]">
                    {w.hanzi}
                  </span>
                  <div className="min-w-0">
                    <span className="pinyin text-xs font-semibold text-[#55449E]">{w.pinyin}</span>
                    <span className="ml-2 text-xs text-[#777184]">{w.meaningVi}</span>
                  </div>
                </div>
                <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
