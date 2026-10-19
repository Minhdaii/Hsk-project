'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { WordDetail } from '@/lib/types';
import { posLabels, splitMeaning } from '@/lib/pos';
import SpeakButton from '@/components/SpeakButton';
import FavoriteButton from '@/components/FavoriteButton';
import { LEVEL_STYLE, levelPill } from '@/lib/levels';
import Skeleton from '@/components/Skeleton';
import HanziWriterBox from '@/components/HanziWriterBox';

export default function WordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [word, setWord] = useState<WordDetail | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api<WordDetail>(`/words/${id}`).then(setWord).catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p>Không tìm thấy từ này. <Link href="/words" className="underline">Quay lại danh sách</Link></p>;
  if (!word) return <div className="mx-auto max-w-2xl space-y-5"><Skeleton className="h-64 !rounded-2xl" /><Skeleton className="h-40 !rounded-2xl" /></div>;

  const chars = Array.from(word.hanzi).filter((c) => /[\u3400-\u9fff]/.test(c));
  const vi = splitMeaning(word.meaningVi);
  const en = splitMeaning(word.meaningEn);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/words" className="text-sm text-stone-500 hover:text-brand">← Danh sách từ</Link>

      <div className="card overflow-hidden text-center">
        <div className={`-mx-5 -mt-5 mb-4 h-2 bg-gradient-to-r ${word.hskLevel && LEVEL_STYLE[word.hskLevel] ? LEVEL_STYLE[word.hskLevel].grad : 'from-stone-300 to-stone-400'}`} />
        <div className="flex flex-wrap justify-center gap-2">
          {word.hskLevel && <span className={`pill ${levelPill(word.hskLevel)}`}>HSK {word.hskLevel}</span>}
          {posLabels(word.pos).map((p) => <span key={p} className="pill">{p}</span>)}
        </div>
        <div className="hanzi mt-4 break-words text-6xl sm:text-7xl">{word.hanzi}</div>
        {word.traditional && word.traditional !== word.hanzi && <div className="hanzi mt-1 text-xl text-stone-400">{word.traditional}</div>}
        <div className="mt-3 text-2xl font-medium text-brand">{word.pinyin}</div>
        {word.hanviet && <div className="mt-1 text-sm uppercase tracking-wide text-stone-500">Hán Việt: {word.hanviet}</div>}
        <div className="mt-4 flex flex-wrap justify-center gap-2"><SpeakButton text={word.hanzi} audioUrl={word.audioUrl} label /><FavoriteButton wordId={word.id} label /></div>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">Nghĩa tiếng Việt</h2>
          {vi.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">{vi.map((m, i) => <li key={i} className="break-words">{m}</li>)}</ul>
          ) : <p className="text-sm text-stone-500">Chưa có nghĩa tiếng Việt cho từ này.</p>}
        </div>
        {en.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">English</h2>
            <p className="break-words text-sm text-stone-600">{en.join('; ')}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Thứ tự nét</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {chars.map((c, i) => <HanziWriterBox key={c + i} char={c} />)}
        </div>
      </div>

      {word.examples.length > 0 && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Ví dụ</h2>
          <ul className="space-y-4">
            {word.examples.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="hanzi break-words text-lg">{e.hanzi}</div>
                  {e.pinyin && <div className="text-sm text-brand">{e.pinyin}</div>}
                  {e.meaningVi && <div className="text-sm text-stone-600">{e.meaningVi}</div>}
                </div>
                <SpeakButton text={e.hanzi} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
