'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { enter } from '@/lib/motion';
import { api } from '@/lib/api';
import { posLabels, splitMeaning } from '@/lib/pos';
import type { DailyWord } from '@/lib/types';
import SpeakButton from '../SpeakButton';
import HeroGlyph from './HeroGlyph';

const CACHE_KEY = 'hsk_daily_word';
const TZ = 'Asia/Ho_Chi_Minh';
const todayVN = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const validAudio = (u: string | null | undefined): u is string => !!u && /^(https?:\/\/|\/)/.test(u);
const dateLabel = (d: string) => {
  const t = new Date(d + 'T00:00:00Z').toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const INK_GRID =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M50 0V100M0 50H100M0 0L100 100M100 0L0 100' fill='none' stroke='%23111111' stroke-opacity='.18' stroke-width='1' stroke-dasharray='5 5' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E";

type State = { kind: 'loading' } | { kind: 'ready'; data: DailyWord } | { kind: 'fallback' };

/**
 * Chữ Hán của ngày — Modern Ink Editorial.
 * Màu sắc: Black (#111111) / White (#FFFFFF) / Vermilion (#C62828).
 */
export default function WordOfDay() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const safety = setTimeout(() => {
      el.style.opacity = '1';
    }, 5000);
    const anim = enter(el, { delay: 450, y: 22, duration: 700 });
    return () => {
      clearTimeout(safety);
      anim.revert();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null') as DailyWord | null;
      if (c && c.date === todayVN() && c.word?.hanzi) {
        setState({ kind: 'ready', data: c });
        return;
      }
    } catch {
      /* bỏ qua cache hỏng */
    }
    api<DailyWord>('/words/daily')
      .then((d) => {
        if (!alive) return;
        if (!d?.word?.hanzi) {
          setState({ kind: 'fallback' });
          return;
        }
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(d));
        } catch {
          /* bỏ qua */
        }
        setState({ kind: 'ready', data: d });
      })
      .catch(() => {
        if (alive) setState({ kind: 'fallback' });
      });
    return () => {
      alive = false;
    };
  }, []);

  const w = state.kind === 'ready' ? state.data.word : null;
  const char = w?.hanzi ?? '字';
  const meanings = w ? splitMeaning(w.meaningVi || w.meaningEn).slice(0, 3) : [];
  const pos = w ? posLabels(w.pos) : [];

  return (
    <section
      ref={root}
      data-anim="self"
      aria-label="Chữ Hán hôm nay"
      className="relative mx-auto w-full max-w-[24rem] sm:max-w-md lg:col-span-5 lg:max-w-none border-2 border-[#111] bg-white p-6 shadow-[8px_8px_0px_#111]"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#111]/15 pb-3">
        <div className="flex items-center gap-2">
          <span
            lang="zh-Hans"
            className="inline-flex h-5 w-5 items-center justify-center bg-[#C62828] font-hanzi text-[10px] font-bold text-white"
            style={{ borderRadius: '2px' }}
          >
            日
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#111]">
            Chữ Hán hôm nay
          </span>
        </div>
        {state.kind === 'ready' && (
          <span className="text-[11px] font-semibold text-[#777]">
            {dateLabel(state.data.date)}
          </span>
        )}
      </div>

      <div className="flex items-start gap-5 sm:block">
        {/* Khung vẽ chữ Hán 米字格 */}
        <div className="relative w-[10.5rem] shrink-0 sm:w-full">
          <div
            className="relative border-2 border-[#111] bg-white p-2"
            style={{ backgroundImage: `url("${INK_GRID}")`, backgroundSize: '100% 100%' }}
          >
            {state.kind === 'loading' ? (
              <div aria-hidden className="aspect-square w-full" />
            ) : (
              <HeroGlyph key={char} char={char} />
            )}
          </div>
          <span
            lang="zh-Hans"
            aria-hidden
            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center bg-[#C62828] font-hanzi text-sm font-black text-white shadow-xs sm:-right-3 sm:-top-3 sm:h-10 sm:w-10 sm:text-lg"
            style={{ borderRadius: '2px' }}
          >
            字
          </span>
        </div>

        <div className="min-w-0 flex-1 sm:mt-5">
          {state.kind === 'ready' && w ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="pinyin break-words text-2xl font-bold text-[#C62828] sm:text-3xl">
                  {w.pinyin}
                </span>
                {w.hanviet && (
                  <span className="text-xs font-semibold text-[#555]">
                    Hán Việt: <b className="text-[#111]">{w.hanviet}</b>
                  </span>
                )}
              </div>

              {w.traditional && w.traditional !== w.hanzi && (
                <p className="mt-1 text-xs text-[#777]">
                  Phồn thể:{' '}
                  <span lang="zh-Hant" className="hanzi text-sm font-bold text-[#111]">
                    {w.traditional}
                  </span>
                </p>
              )}

              <ul className="mt-3 space-y-1">
                {meanings.map((m, i) => (
                  <li
                    key={i}
                    className={`break-words ${
                      i === 0 ? 'text-base font-bold text-[#111]' : 'text-sm text-[#555]'
                    }`}
                  >
                    {m}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {w.hskLevel && (
                  <span className="bg-[#C62828] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    HSK {w.hskLevel}
                  </span>
                )}
                {pos.map((p) => (
                  <span
                    key={p}
                    className="border border-[#111] bg-white px-2 py-0.5 text-[11px] font-bold text-[#111]"
                  >
                    {p}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {validAudio(w.audioUrl) && (
                  <SpeakButton text={w.hanzi} audioUrl={w.audioUrl} label />
                )}
                <Link
                  href={`/word/${w.id}`}
                  className="inline-flex min-h-[38px] items-center justify-center border-2 border-[#111] bg-transparent px-4 py-1.5 text-xs font-bold text-[#111] transition-all hover:bg-[#111] hover:text-white active:translate-y-px"
                >
                  Học từ này →
                </Link>
              </div>
            </>
          ) : state.kind === 'fallback' ? (
            <div className="space-y-2">
              <span className="pinyin text-2xl font-bold text-[#C62828]">zì</span>
              <p className="text-xs text-[#555]">Hán Việt: tự · chữ, ký tự</p>
            </div>
          ) : (
            <div aria-hidden className="space-y-2 pt-2">
              <div className="h-6 w-2/3 bg-stone-200" />
              <div className="h-4 w-1/2 bg-stone-100" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
