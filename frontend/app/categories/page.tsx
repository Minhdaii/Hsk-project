'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { CategoryNode } from '@/lib/types';
import Skeleton from '@/components/Skeleton';

/** Danh mục từ vựng theo chủ đề: nhóm > chủ đề > chủ đề con. Số từ lấy từ database, một từ có thể thuộc nhiều danh mục. */
export default function CategoriesPage() {
  const [groups, setGroups] = useState<CategoryNode[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    api<{ items: CategoryNode[] }>('/categories').then((r) => setGroups(r.items)).catch((e) => setError(e instanceof Error ? e.message : 'Không tải được danh mục'));
  }, []);

  const text = q.trim().toLowerCase();
  const match = (c: CategoryNode) => !text || c.name.toLowerCase().includes(text) || c.children.some((k) => k.name.toLowerCase().includes(text));
  const total = groups?.reduce((s, g) => s + g.wordCount, 0) ?? 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Từ vựng theo chủ đề</h1>
          <p className="mt-1 max-w-xl text-stone-600">Học theo tình huống đời sống, tách biệt với cấp độ HSK. Một từ HSK 3 vẫn có thể nằm trong chủ đề Gia đình hoặc Công việc.</p>
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="loc-chu-de" className="sr-only">Lọc chủ đề</label>
          <input id="loc-chu-de" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm chủ đề…" className="input" />
        </div>
      </header>

      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {!groups && !error && <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>}
      {groups && total === 0 && (
        <p className="lab-surface p-5 text-stone-600">Chưa có từ nào được gán vào danh mục. Quản trị viên cần chạy <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm">npm run import:categories</code> để nhập dữ liệu.</p>
      )}

      {groups?.map((g) => {
        const topics = g.children.filter(match);
        if (!topics.length) return null;
        return (
          <section key={g.id} aria-labelledby={`g-${g.id}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h2 id={`g-${g.id}`} className="text-lg font-bold">{g.name}</h2>
              <span className="text-sm tabular-nums text-stone-600">{g.wordCount} từ</span>
            </div>
            <ul className="grid gap-4 lg:grid-cols-2">
              {topics.map((t) => (
                <li key={t.id} className="lab-surface p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/categories/${t.slug}`} className="inline-flex min-h-[44px] min-w-0 items-center font-bold hover:text-brand-ink hover:underline">{t.name}</Link>
                    <span className={`pill shrink-0 ${t.wordCount ? 'bg-brand-soft text-brand-ink' : ''}`}>{t.wordCount ? `${t.wordCount} từ` : 'Chưa có từ'}</span>
                  </div>
                  {t.children.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {t.children.filter((k) => k.wordCount > 0).slice(0, 8).map((k) => (
                        <li key={k.id}>
                          <Link href={`/categories/${k.slug}`} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line bg-stone-50 px-2.5 text-sm text-stone-700 hover:border-stone-400 hover:text-ink">
                            {k.name}<span className="tabular-nums text-stone-500">{k.wordCount}</span>
                          </Link>
                        </li>
                      ))}
                      {t.children.filter((k) => k.wordCount > 0).length > 8 && (
                        <li><Link href={`/categories/${t.slug}`} className="inline-flex min-h-[44px] items-center px-1 text-sm font-semibold text-brand-ink hover:underline">+{t.children.filter((k) => k.wordCount > 0).length - 8} chủ đề con</Link></li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
