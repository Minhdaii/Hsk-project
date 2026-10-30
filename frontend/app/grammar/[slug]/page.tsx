'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import type { GrammarDetail } from '@/lib/types';
import SpeakButton from '@/components/SpeakButton';
import Skeleton from '@/components/Skeleton';
import ZhMix from '@/components/ZhMix';

const levelLabel = (l: number) => (l === 0 ? 'Ngữ pháp mở rộng' : `HSK ${l}`);

export default function GrammarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();
  const [g, setG] = useState<GrammarDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    setG(null); setError('');
    api<GrammarDetail>(`/grammar/${encodeURIComponent(slug)}`).then(setG).catch((e) => setError(e instanceof Error ? e.message : 'Không tải được cấu trúc'));
  }, [slug, user?.id]);

  const toggle = async (key: 'learned' | 'favorite') => {
    if (!g) return;
    if (!user) { setNote('Đăng nhập để lưu tiến độ học ngữ pháp.'); return; }
    setBusy(true); setNote('');
    try {
      const next = !g.progress[key];
      await api(`/grammar/${g.id}/progress`, { method: 'PUT', body: { [key]: next } });
      setG({ ...g, progress: { ...g.progress, [key]: next } });
    } catch (e) { setNote(e instanceof ApiError ? e.message : 'Không lưu được'); } finally { setBusy(false); }
  };

  if (error) return <div className="space-y-4"><p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p><Link href="/grammar" className="btn-ghost">← Danh sách ngữ pháp</Link></div>;
  if (!g) return <div className="space-y-4"><Skeleton className="h-16 w-2/3" /><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <nav aria-label="Vị trí" className="text-sm text-stone-600"><Link href="/grammar" className="inline-flex min-h-[44px] items-center hover:text-ink hover:underline">← Ngữ pháp</Link></nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill border border-brand/40 bg-brand-soft text-brand-ink">{levelLabel(g.level)}</span>
          {g.category && <span className="pill border border-line bg-white">{g.category}</span>}
        </div>
        <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{g.title}</h1>
        {g.titleZh && <p lang="zh-Hans" className="hanzi text-2xl text-stone-700">{g.titleZh}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={() => toggle('learned')} disabled={busy} aria-pressed={g.progress.learned}
            className={`btn !min-h-[44px] border ${g.progress.learned ? 'border-brand-ink/50 bg-brand text-ink' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}>{g.progress.learned ? '✓ Đã học' : 'Đánh dấu đã học'}</button>
          <button onClick={() => toggle('favorite')} disabled={busy} aria-pressed={g.progress.favorite}
            className={`btn !min-h-[44px] border ${g.progress.favorite ? 'border-brand-ink/50 bg-brand-soft text-brand-ink' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}>{g.progress.favorite ? '★ Đã lưu' : '☆ Lưu yêu thích'}</button>
          <Link href={`/grammar/practice?grammarId=${g.id}`} className="btn-primary">Luyện tập cấu trúc này</Link>
        </div>
        {note && <p role="status" className="text-sm text-stone-600">{note} {!user && <Link href="/login" className="font-semibold text-brand-ink underline">Đăng nhập</Link>}</p>}
        {g.progress.attempts > 0 && <p className="text-sm text-stone-600">Bạn đã làm {g.progress.attempts} câu luyện tập về cấu trúc này, đúng {g.progress.correct}.</p>}
      </header>

      <section aria-labelledby="cong-thuc" className="lab-surface g-rule p-5 sm:p-6" style={{ ['--g' as string]: '111 85 204' }}>
        <h2 id="cong-thuc" className="text-sm font-semibold text-stone-600">Công thức</h2>
        <p className="mt-1 break-words text-2xl leading-relaxed sm:text-3xl"><ZhMix text={g.pattern} /></p>
      </section>

      <section aria-labelledby="giai-thich" className="space-y-3">
        <h2 id="giai-thich" className="text-xl font-bold">Cách dùng</h2>
        <p className="text-lg leading-relaxed text-stone-800">{g.explanation}</p>
        {g.usageNotes && <p className="text-stone-700">{g.usageNotes}</p>}
        {g.notes && <p className="border-l-[3px] border-brand-ink bg-brand-soft px-4 py-3 text-ink"><b>Ghi chú: </b>{g.notes}</p>}
      </section>

      <section aria-labelledby="vi-du" className="space-y-3">
        <h2 id="vi-du" className="text-xl font-bold">Ví dụ</h2>
        <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {g.examples.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p lang="zh-Hans" className="hanzi break-words text-2xl leading-snug">{e.hanzi}</p>
                {e.pinyin && <p className="pinyin mt-0.5 break-words text-base font-medium text-brand-ink">{e.pinyin}</p>}
                {e.meaningVi && <p className="mt-0.5 text-stone-700">{e.meaningVi}</p>}
                {e.explanationVi && <p className="mt-1 text-sm text-stone-600">{e.explanationVi}</p>}
              </div>
              <SpeakButton text={e.hanzi} />
            </li>
          ))}
          {g.examples.length === 0 && <li className="p-5 text-stone-600">Chưa có ví dụ.</li>}
        </ol>
      </section>

      {g.mistakes.length > 0 && (
        <section aria-labelledby="loi-sai" className="space-y-3">
          <h2 id="loi-sai" className="text-xl font-bold">Lỗi sai thường gặp</h2>
          <ul className="space-y-3">
            {g.mistakes.map((m) => (
              <li key={m.id} className="lab-surface overflow-hidden">
                <div className="grid sm:grid-cols-2">
                  <div className="border-b border-line bg-red-50 p-4 sm:border-b-0 sm:border-r">
                    <p className="text-xs font-bold text-red-800">✕ Sai</p>
                    <p lang="zh-Hans" className="hanzi mt-1 break-words text-xl text-red-950 line-through decoration-red-400/70">{m.hanzi}</p>
                  </div>
                  <div className="bg-emerald-50 p-4">
                    <p className="text-xs font-bold text-emerald-800">✓ Đúng</p>
                    <p lang="zh-Hans" className="hanzi mt-1 break-words text-xl text-emerald-950">{m.correctedHanzi}</p>
                    {m.meaningVi && <p className="mt-0.5 text-sm text-emerald-900">{m.meaningVi}</p>}
                  </div>
                </div>
                {m.errorExplanation && <p className="border-t border-line px-4 py-3 text-stone-700">{m.errorExplanation}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {g.words.length > 0 && (
        <section aria-labelledby="tu-quan-trong" className="space-y-3">
          <h2 id="tu-quan-trong" className="text-xl font-bold">Từ vựng quan trọng</h2>
          <ul className="flex flex-wrap gap-2">
            {g.words.map((w) => (
              <li key={w.id}>
                <Link href={`/word/${w.id}`} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-white px-3 hover:border-stone-400">
                  <span lang="zh-Hans" className="hanzi text-xl">{w.hanzi}</span>
                  <span className="text-sm text-stone-600"><span className="pinyin text-brand-ink">{w.pinyin}</span>{w.meaningVi ? ` · ${w.meaningVi.split(/[;,]/)[0]}` : ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {g.related.length > 0 && (
        <section aria-labelledby="lien-quan" className="space-y-3">
          <h2 id="lien-quan" className="text-xl font-bold">Cấu trúc liên quan</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
            {g.related.map((r) => (
              <li key={r.id}><Link href={`/grammar/${r.slug}`} className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2 hover:bg-stone-50"><span><span className="font-semibold">{r.title}</span> <span className="text-sm text-stone-600">· {levelLabel(r.level)}</span></span><span aria-hidden>→</span></Link></li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-stone-500">{g.source === 'authored' ? 'Nội dung do hệ thống soạn' : 'Nội dung nhập từ dữ liệu của dự án'}, {g.verified ? 'đã được xác minh.' : 'chưa được giáo viên hoặc người bản ngữ xác minh.'}</p>

      <nav aria-label="Bài trước và sau" className="grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
        {g.prev ? <Link href={`/grammar/${g.prev.slug ?? g.prev.id}`} className="lab-surface block p-4 hover:border-stone-400"><span className="text-sm text-stone-600">← Trước</span><span className="mt-0.5 block font-semibold">{g.prev.title}</span></Link> : <span />}
        {g.next && <Link href={`/grammar/${g.next.slug ?? g.next.id}`} className="lab-surface block p-4 text-right hover:border-stone-400"><span className="text-sm text-stone-600">Sau →</span><span className="mt-0.5 block font-semibold">{g.next.title}</span></Link>}
      </nav>
    </article>
  );
}
