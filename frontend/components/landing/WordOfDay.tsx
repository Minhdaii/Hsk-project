'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { posLabels, splitMeaning } from '@/lib/pos';
import type { DailyWord } from '@/lib/types';
import SpeakButton from '../SpeakButton';
import HeroGlyph from './HeroGlyph';

const CACHE_KEY = 'hsk_daily_word';
const TZ = 'Asia/Ho_Chi_Minh';
// Ngày hiện tại theo giờ Việt Nam, cùng quy ước với backend (TZ_NAME mặc định Asia/Ho_Chi_Minh)
const todayVN = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const validAudio = (u: string | null | undefined): u is string => !!u && /^(https?:\/\/|\/)/.test(u);
const dateLabel = (d: string) => {
  const t = new Date(d + 'T00:00:00Z').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  return t.charAt(0).toUpperCase() + t.slice(1); // Thứ Sáu, 23 tháng 10
};

type State = { kind: 'loading' } | { kind: 'ready'; data: DailyWord } | { kind: 'fallback' };

/**
 * Chữ Hán của ngày: backend chọn xác định theo ngày (GET /words/daily), mọi người dùng thấy cùng một từ.
 * Lỗi mạng hoặc chưa có dữ liệu thì hiện chữ 字 mặc định, trang giới thiệu vẫn hoạt động bình thường.
 */
export default function WordOfDay() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null') as DailyWord | null;
      if (c && c.date === todayVN() && c.word?.hanzi) { setState({ kind: 'ready', data: c }); return; }
    } catch { /* bỏ qua cache hỏng */ }
    api<DailyWord>('/words/daily')
      .then((d) => {
        if (!alive) return;
        if (!d?.word?.hanzi) { setState({ kind: 'fallback' }); return; }
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch { /* bỏ qua */ }
        setState({ kind: 'ready', data: d });
      })
      .catch(() => { if (alive) setState({ kind: 'fallback' }); });
    return () => { alive = false; };
  }, []);

  const w = state.kind === 'ready' ? state.data.word : null;
  const char = w?.hanzi ?? '字';
  const meanings = w ? splitMeaning(w.meaningVi || w.meaningEn).slice(0, 3) : [];
  const pos = w ? posLabels(w.pos) : [];

  return (
    <section aria-label="Chữ Hán hôm nay" className="relative mx-auto w-full max-w-[22rem] sm:max-w-sm lg:col-span-5 lg:max-w-none">
      <p className="mb-3 flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-stone-600">
        <span className="font-bold text-ink">Chữ Hán hôm nay</span>
        {state.kind === 'ready' && <span>{dateLabel(state.data.date)}</span>}
      </p>

      <div className="flex items-start gap-4 sm:block">
        <div className="relative w-[9.5rem] shrink-0 sm:w-full">
          <div className="mi-grid relative border border-ink/30 bg-white/60">
            {state.kind === 'loading' ? <div aria-hidden className="aspect-square w-full" /> : <HeroGlyph key={char} char={char} />}
          </div>
          <span aria-hidden className="seal absolute -right-2 -top-2 h-9 w-9 text-lg sm:-right-3 sm:-top-3 sm:h-11 sm:w-11 sm:text-xl">学</span>
        </div>

        <div className="min-w-0 flex-1 sm:mt-4">
          {state.kind === 'ready' && w ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="pinyin break-words text-2xl font-semibold text-brand-ink sm:text-3xl">{w.pinyin}</span>
                {w.hanviet && <span className="text-sm text-stone-600">Hán Việt: {w.hanviet}</span>}
              </div>
              {w.traditional && w.traditional !== w.hanzi && (
                <p className="mt-0.5 text-sm text-stone-600">Phồn thể: <span lang="zh-Hant" className="hanzi text-base text-ink">{w.traditional}</span></p>
              )}
              <ul className="mt-2 space-y-0.5">
                {meanings.map((m, i) => (
                  <li key={i} className={`break-words ${i === 0 ? 'text-lg font-semibold' : 'text-base text-stone-700'}`}>{m}</li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {w.hskLevel && <span className="pill border border-brand/40 bg-brand-soft text-brand-ink">HSK {w.hskLevel}</span>}
                {pos.map((p) => <span key={p} className="pill border border-line bg-white">{p}</span>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {validAudio(w.audioUrl) && <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} label />}
                <Link href={`/word/${w.id}`} className="btn-ghost">Học từ này</Link>
              </div>
            </>
          ) : state.kind === 'fallback' ? (
            <div className="flex flex-wrap items-baseline gap-x-3 text-sm text-stone-600">
              <span className="pinyin text-2xl font-semibold text-ink">zì</span>
              <span>Hán Việt: tự · chữ, ký tự</span>
            </div>
          ) : (
            <div aria-hidden className="space-y-2 pt-1">
              <div className="h-7 w-2/3 rounded bg-stone-200" /><div className="h-5 w-1/2 rounded bg-stone-100" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
