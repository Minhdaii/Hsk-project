'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { GrammarPoint } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import Skeleton from '@/components/Skeleton';
import PageHeader from '@/components/PageHeader';

const LEVEL_HAN: Record<number, string> = { 1: '一级', 2: '二级', 3: '三级' };

export default function GrammarPage() {
  const [level, setLevel] = useState(0);
  const [items, setItems] = useState<GrammarPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api<{ items: GrammarPoint[] }>(`/grammar${level ? `?level=${level}` : ''}`)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải dữ liệu ngữ pháp'))
      .finally(() => setLoading(false));
  }, [level]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        glyph="法"
        title="Cẩm nang ngữ pháp HSK 1–3"
        subtitle={loading ? 'Đang tải dữ liệu điểm ngữ pháp…' : `${items.length} cấu trúc ngữ pháp có giải thích chi tiết`}
        actions={
          <Link href="/exercises" className="btn-editorial-primary text-xs">
            Luyện tập bài tập →
          </Link>
        }
      />

      {/* Bộ lọc cấp độ */}
      <div role="group" aria-label="Lọc theo cấp độ" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <div className="inline-flex rounded-xl border border-line bg-brand-soft/40 p-1">
          {[0, 1, 2, 3].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              aria-pressed={l === level}
              className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 text-xs font-bold transition-all ${
                l === level
                  ? 'border border-brand/40 bg-white text-brand-ink shadow-sm'
                  : 'text-stone-600 hover:text-ink'
              }`}
            >
              {l === 0 ? 'Tất cả các cấp' : `HSK ${l}`}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-xs text-red-800">
          {error}
        </p>
      )}

      {loading && items.length === 0 && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      <div className="space-y-10">
        {[1, 2, 3].map((lv) => {
          const group = items.filter((g) => g.level === lv);
          if (group.length === 0) return null;
          return (
            <section key={lv} className="space-y-4">
              <div className="flex items-baseline gap-3 border-b border-line pb-2.5">
                <span lang="zh-Hans" className="hanzi text-2xl font-bold text-ink">
                  {LEVEL_HAN[lv]}
                </span>
                <h2 className="text-base font-bold text-ink">
                  HSK Cấp {lv} <span className="font-normal text-stone-600">({group.length} điểm ngữ pháp)</span>
                </h2>
              </div>

              <div className="space-y-3">
                {group.map((g, idx) => (
                  <details
                    key={g.id}
                    className="editorial-card group overflow-hidden transition-all duration-200 open:border-brand/60"
                  >
                    <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 p-4 select-none hover:bg-brand-soft/30">
                      <span className="editorial-badge">#{idx + 1}</span>
                      <span className="min-w-0 flex-1 font-bold text-ink sm:text-base">
                        {g.title}
                      </span>
                      <span
                        aria-hidden
                        className="text-stone-600 transition-transform duration-200 group-open:rotate-180"
                      >
                        ▾
                      </span>
                    </summary>

                    <div className="animate-fade-in space-y-4 border-t border-line bg-stone-50 p-5">
                      {/* Khung công thức câu */}
                      <div className="rounded-xl border-l-4 border-brand bg-brand-soft/60 p-3.5">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-brand-ink">
                          Cấu trúc / Mẫu câu:
                        </span>
                        <div className="mt-1 break-words font-medium text-ink sm:text-base">
                          {g.pattern}
                        </div>
                      </div>

                      {/* Lời giải thích biên tập */}
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          Giải thích chi tiết:
                        </span>
                        <p className="mt-1 break-words text-xs leading-relaxed text-ink sm:text-sm">
                          {g.explanation}
                        </p>
                      </div>

                      {/* Lưu ý quan trọng */}
                      {g.notes && (
                        <div className="rounded-xl border border-line bg-white p-3 text-xs leading-relaxed text-stone-700">
                          <strong className="font-bold text-ink">Lưu ý ngữ pháp: </strong>
                          {g.notes}
                        </div>
                      )}

                      {/* Ví dụ minh họa */}
                      {g.examples && g.examples.length > 0 && (
                        <div className="space-y-2 border-t border-line pt-3">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                            Ví dụ thực tế:
                          </span>
                          <ul className="space-y-2.5">
                            {g.examples.map((e) => (
                              <li
                                key={e.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3.5 shadow-sm"
                              >
                                <div className="min-w-0 flex-1">
                                  <div lang="zh-Hans" className="hanzi break-words text-base font-bold text-ink sm:text-lg">
                                    {e.hanzi}
                                  </div>
                                  {e.pinyin && (
                                    <div className="pinyin mt-0.5 break-words text-xs font-semibold text-brand-ink">
                                      {e.pinyin}
                                    </div>
                                  )}
                                  {e.meaningVi && (
                                    <div className="mt-1 break-words text-xs text-stone-700">
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
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
