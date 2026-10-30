'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { CategoryDetail, WordPage } from '@/lib/types';
import FavoriteButton from '@/components/FavoriteButton';
import SpeakButton from '@/components/SpeakButton';
import Skeleton from '@/components/Skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [detail, setDetail] = useState<CategoryDetail | null>(null);
  const [words, setWords] = useState<WordPage | null>(null);
  const [level, setLevel] = useState(0);
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setLevel(0); setQ(''); setDq(''); setPage(1); }, [slug]);

  useEffect(() => {
    setError('');
    api<CategoryDetail>(`/categories/${encodeURIComponent(slug)}`).then(setDetail).catch((e) => setError(e instanceof Error ? e.message : 'Không tải được danh mục'));
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: '30' });
    if (level) qs.set('level', String(level));
    if (dq.trim()) qs.set('q', dq.trim());
    api<WordPage>(`/categories/${encodeURIComponent(slug)}/words?${qs}`).then(setWords).catch(() => setWords(null)).finally(() => setLoading(false));
  }, [slug, level, dq, page]);

  if (error) return <div className="space-y-4"><p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p><Link href="/categories" className="btn-ghost">← Tất cả chủ đề</Link></div>;
  const cat = detail?.category;

  return (
    <div className="space-y-6">
      <nav aria-label="Vị trí" className="flex flex-wrap items-center gap-1.5 text-sm text-stone-600">
        <Link href="/categories" className="inline-flex min-h-[44px] items-center hover:text-ink hover:underline">Chủ đề</Link>
        {detail?.breadcrumb.map((b) => <span key={b.id} className="flex items-center gap-1.5"><span aria-hidden>/</span><span>{b.name}</span></span>)}
      </nav>

      <header>
        {cat ? (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{cat.name}</h1>
            <p className="mt-1 text-stone-600">{cat.wordCount} từ vựng{cat.description ? ` · ${cat.description}` : ''}</p>
          </>
        ) : <Skeleton className="h-14 w-1/2" />}
      </header>

      {cat && cat.children.length > 0 && (
        <ul aria-label="Chủ đề con" className="flex flex-wrap gap-2">
          {cat.children.map((k) => (
            <li key={k.id}>
              <Link href={`/categories/${k.slug}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium hover:border-stone-400">
                {k.name}<span className="pill">{k.wordCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="group" aria-label="Lọc theo cấp HSK" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((l) => (
              <button key={l} onClick={() => { setLevel(l); setPage(1); }} aria-pressed={l === level}
                className={`min-h-[44px] whitespace-nowrap rounded-lg border px-3.5 text-sm font-bold transition-colors ${l === level ? 'border-brand-ink/50 bg-brand text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400 hover:text-ink'}`}>
                {l === 0 ? 'Tất cả' : `HSK ${l}`}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:ml-auto sm:w-64">
          <label htmlFor="tim-trong-chu-de" className="sr-only">Tìm trong chủ đề</label>
          <input id="tim-trong-chu-de" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm chữ Hán, pinyin, nghĩa…" className="input" />
        </div>
      </div>

      {loading && !words && <Skeleton className="h-64" />}
      {words && (
        <>
          <ul className={`divide-y divide-line overflow-hidden rounded-xl border border-line bg-white transition-opacity ${loading ? 'opacity-60' : ''}`}>
            {words.items.map((w) => (
              <li key={w.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-stone-50 sm:gap-3 sm:px-4">
                <Link href={`/word/${w.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <span lang="zh-Hans" className="hanzi min-w-[3.25rem] max-w-[45%] shrink-0 break-all text-3xl leading-tight sm:min-w-[4.5rem] sm:text-4xl">{w.hanzi}</span>
                  <span className="min-w-0 flex-1">
                    <span className="pinyin block break-words text-lg font-medium text-brand-ink">{w.pinyin}</span>
                    <span className="line-clamp-2 break-words text-base text-stone-700">{w.meaningVi || w.meaningEn}</span>
                  </span>
                </Link>
                {w.hskLevel && <span className="pill hidden shrink-0 sm:inline-flex">HSK {w.hskLevel}</span>}
                <FavoriteButton wordId={w.id} className="hidden min-[400px]:inline-flex" />
                <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} />
              </li>
            ))}
            {words.items.length === 0 && <li className="p-6 text-center text-stone-600">{words.total === 0 && !dq && !level ? 'Chủ đề này chưa có từ nào trong kho từ vựng.' : 'Không tìm thấy từ phù hợp.'}</li>}
          </ul>
          {words.pages > 1 && (
            <nav aria-label="Phân trang" className="flex items-center justify-center gap-3">
              <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button>
              <span className="text-sm tabular-nums text-stone-600">{page} / {words.pages}</span>
              <button className="btn-ghost" disabled={page >= words.pages} onClick={() => setPage(page + 1)}>Sau →</button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
