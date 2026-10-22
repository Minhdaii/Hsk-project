'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { GrammarPoint } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import { LEVEL_STYLE, levelPill } from '@/lib/levels';
import Skeleton from '@/components/Skeleton';
import PageHeader from '@/components/PageHeader';

export default function GrammarPage() {
  const [level, setLevel] = useState(0);
  const [items, setItems] = useState<GrammarPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    api<{ items: GrammarPoint[] }>(`/grammar${level ? `?level=${level}` : ''}`)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'))
      .finally(() => setLoading(false));
  }, [level]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Ngữ pháp HSK 1-3" subtitle={loading ? 'Đang tải…' : `${items.length} điểm ngữ pháp`} actions={<Link href="/exercises" className="btn-primary">Luyện điền từ</Link>} />

      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={l === level ? 'btn-primary' : 'btn-ghost'}>
            {l === 0 ? 'Tất cả' : `HSK ${l}`}
          </button>
        ))}
      </div>

      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
      {loading && items.length === 0 && <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>}

      <div className="space-y-8">
        {[1, 2, 3].map((lv) => {
          const group = items.filter((g) => g.level === lv);
          if (group.length === 0) return null;
          return (
            <section key={lv} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm ${LEVEL_STYLE[lv].grad}`}>{lv}</span>
                <div>
                  <h2 className="font-bold leading-tight">HSK {lv}</h2>
                  <p className="text-xs text-stone-500">{group.length} điểm ngữ pháp</p>
                </div>
              </div>
              {group.map((g, idx) => (
                <details key={g.id} className="card group !p-0 transition open:shadow-soft">
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                    <span className={`pill shrink-0 ${levelPill(g.level)}`}>#{idx + 1}</span>
                    <span className="min-w-0 flex-1 font-semibold">{g.title}</span>
                    <span aria-hidden className="text-stone-400 transition group-open:rotate-180">▾</span>
                  </summary>
                  <div className="animate-fade-up space-y-4 border-t border-stone-100 p-4">
                    <div className="rounded-xl border border-brand/15 bg-brand-soft px-4 py-3 text-sm font-medium text-brand">
                      <span className="break-words">{g.pattern}</span>
                    </div>
                    <p className="break-words text-stone-700">{g.explanation}</p>
                    {g.notes && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">💡 {g.notes}</p>}
                    <ul className="space-y-3">
                      {g.examples.map((e) => (
                        <li key={e.id} className="flex items-start gap-3 rounded-xl bg-stone-50 p-3">
                          <div className="min-w-0 flex-1">
                            <div className="hanzi break-words text-lg">{e.hanzi}</div>
                            {e.pinyin && <div className="break-words text-sm text-brand">{e.pinyin}</div>}
                            {e.meaningVi && <div className="break-words text-sm text-stone-600">{e.meaningVi}</div>}
                          </div>
                          <SpeakButton text={e.hanzi} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
