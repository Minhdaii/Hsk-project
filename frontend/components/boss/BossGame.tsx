'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import { BOSS_HP, damageFor, isPinyinMatch, isPlayableWord } from '@/lib/boss/pinyin';
import { BOSSES, Mood } from './BossArt';
import styles from './Boss.module.css';

const POOL_SIZE = 40;
const MIN_POOL = 12;
const TIME_OPTIONS = [5, 7, 10];
const NEXT_DELAY_HIT = 750;
const NEXT_DELAY_MISS = 1400;

type Phase = 'setup' | 'loading' | 'playing' | 'paused' | 'won' | 'ended';
type Miss = { word: Word; reason: 'timeout' };

const shuffle = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/** Lấy từ HSK của cấp đã chọn từ API hiện có (/words), lọc từ dùng được và xáo trộn. Không tạo từ giả. */
async function loadPool(level: number): Promise<Word[]> {
  const first = await api<{ items: Word[]; total: number }>(`/words?level=${level}&limit=100&page=1`);
  const pages = Math.max(1, Math.ceil(first.total / 100));
  const picks = shuffle(Array.from({ length: pages }, (_, i) => i + 1)).slice(0, 2);
  const lists = await Promise.all(picks.map((p) => (p === 1 ? Promise.resolve(first.items) : api<{ items: Word[] }>(`/words?level=${level}&limit=100&page=${p}`).then((r) => r.items))));
  const seen = new Set<string>();
  const ok = lists.flat().filter((w) => isPlayableWord(w) && !seen.has(w.hanzi) && seen.add(w.hanzi));
  return shuffle(ok).slice(0, POOL_SIZE);
}

export default function BossGame() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState(1);
  const [secs, setSecs] = useState(7);
  const [strict, setStrict] = useState(false);
  const [error, setError] = useState('');
  const [pool, setPool] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [slips, setSlips] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [misses, setMisses] = useState<Miss[]>([]);
  const [value, setValue] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [reveal, setReveal] = useState<'ok' | 'miss' | null>(null);
  const [fx, setFx] = useState<'idle' | 'hit' | 'dead'>('idle');
  const [hitKey, setHitKey] = useState(0);
  const [dmg, setDmg] = useState<{ n: number; k: number } | null>(null);
  const [shake, setShake] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const deadline = useRef(0);
  const locked = useRef(true);      // đã chốt kết quả của từ hiện tại (đúng hoặc hết giờ): mọi đầu vào sau đó bị bỏ qua
  const token = useRef(0);          // mỗi từ một mã; sự kiện muộn của từ cũ không được tác động lên từ mới
  const startedAt = useRef(0);
  const pausedLeft = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const maxHp = BOSS_HP[level];
  const word = pool[idx];
  const limitMs = secs * 1000;

  const later = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); };
  const clearLater = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearLater(), []);

  const startQuestion = useCallback((i: number) => {
    token.current++;
    locked.current = false;
    setIdx(i); setValue(''); setReveal(null);
    deadline.current = performance.now() + limitMs;
    startedAt.current = performance.now();
    setRemaining(limitMs);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [limitMs]);

  const advance = useCallback((from: number, total: number) => {
    if (from + 1 >= total) { setPhase('ended'); return; }
    startQuestion(from + 1);
  }, [startQuestion]);

  /* ---------- bắt đầu ---------- */
  const start = async () => {
    setPhase('loading'); setError('');
    try {
      const words = await loadPool(level);
      if (words.length < MIN_POOL) { setError(`Chưa đủ từ HSK ${level} có pinyin để chơi (cần ít nhất ${MIN_POOL} từ, hiện có ${words.length}). Hãy kiểm tra dữ liệu từ vựng.`); setPhase('setup'); return; }
      clearLater();
      setPool(words); setHp(maxHp); setCombo(0); setMaxCombo(0); setScore(0); setCorrect(0); setSlips(0); setTimes([]); setMisses([]); setFx('idle'); setDmg(null);
      setPhase('playing');
      token.current++; locked.current = false; setIdx(0); setValue(''); setReveal(null);
      deadline.current = performance.now() + limitMs; startedAt.current = performance.now(); setRemaining(limitMs);
      setTimeout(() => inputRef.current?.focus(), 60);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được từ vựng'); setPhase('setup');
    }
  };

  /* ---------- đồng hồ ---------- */
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      if (locked.current) return;
      const left = deadline.current - performance.now();
      if (left > 0) { setRemaining(left); return; }
      // hết giờ: khoá từ hiện tại trước, rồi mới chuyển từ
      locked.current = true; setRemaining(0);
      const t = token.current; const w = pool[idx]; const i = idx;
      setMisses((m) => [...m, { word: w, reason: 'timeout' }]);
      setCombo(0); setReveal('miss');
      later(() => { if (token.current === t) advance(i, pool.length); }, NEXT_DELAY_MISS);
    }, 100);
    return () => clearInterval(id);
  }, [phase, pool, idx, advance]);

  /* ---------- trả lời ---------- */
  const hit = (w: Word) => {
    locked.current = true;
    const t = token.current; const i = idx;
    const left = Math.max(0, deadline.current - performance.now());
    const n = combo + 1;
    const d = damageFor(n);
    const newHp = Math.max(0, hp - d);
    setCombo(n); setMaxCombo((m) => Math.max(m, n)); setCorrect((c) => c + 1);
    setTimes((a) => [...a, performance.now() - startedAt.current]);
    setScore((s) => s + d * 10 + Math.round(left / 100));
    setHp(newHp); setReveal('ok'); setFx('hit'); setHitKey((k) => k + 1); setDmg({ n: d, k: Date.now() });
    if (newHp <= 0) {
      later(() => setFx('dead'), 350);
      later(() => setPhase('won'), 1300);
    } else {
      later(() => setFx('idle'), 400);
      later(() => { if (token.current === t) advance(i, pool.length); }, NEXT_DELAY_HIT);
    }
    void w;
  };
  const onChange = (v: string) => {
    if (locked.current || phase !== 'playing') return;
    setValue(v);
    if (word && isPinyinMatch(v, word.pinyin ?? '', strict)) hit(word);
  };
  const onEnter = () => {
    if (locked.current || phase !== 'playing' || !value.trim()) return;
    if (word && isPinyinMatch(value, word.pinyin ?? '', strict)) { hit(word); return; }
    // gõ sai: không gây sát thương, đồng hồ vẫn chạy, chuỗi combo bị ngắt
    setSlips((s) => s + 1); setCombo(0); setValue(''); setShake((k) => k + 1);
  };

  /* ---------- tạm dừng ---------- */
  const pause = () => { pausedLeft.current = Math.max(0, deadline.current - performance.now()); setPhase('paused'); };
  const resume = () => { deadline.current = performance.now() + pausedLeft.current; setPhase('playing'); setTimeout(() => inputRef.current?.focus(), 30); };

  /* ---------- dẫn xuất ---------- */
  const hpPct = Math.round((hp / maxHp) * 100);
  const mood: Mood = phase === 'won' ? 'hurt' : fx === 'hit' ? 'hurt' : hpPct <= 30 ? 'low' : 'idle';
  const { name: bossName, Art } = BOSSES[level];
  const presented = phase === 'won' || phase === 'ended' ? Math.min(pool.length, idx + 1) : idx + 1;
  const accuracy = presented ? Math.round((correct / presented) * 100) : 0;
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length / 1000 : 0;
  const hpColor = hpPct > 50 ? '#3bb273' : hpPct > 25 ? '#f0a030' : '#e0503c';
  const timerPct = Math.max(0, Math.min(100, (remaining / limitMs) * 100));
  const answerShown = reveal === 'miss' ? word?.pinyin : null;

  const stageBoss = useMemo(() => (
    <div key={hitKey} className={`${styles.boss} ${fx === 'hit' ? styles.hit : fx === 'dead' ? styles.dead : phase === 'won' ? styles.win : styles.idle}`}><Art mood={mood} /></div>
  ), [hitKey, fx, mood, phase, Art]);

  /* ================= màn hình ================= */
  // Mọi màn hình đều nằm gọn trong một khung nhìn (không cuộn trang): máy tính chia hai cột, điện thoại xếp dọc theo chiều cao màn hình.
  const FRAME = 'mx-auto grid min-h-0 w-full max-w-5xl flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3 lg:grid-cols-2 lg:grid-rows-1';

  if (phase === 'setup' || phase === 'loading') {
    return (
      <div className={FRAME}>
        <div className={styles.stage}>
          <div className={styles.ground} />
          <div className="relative flex flex-1 items-end justify-center gap-2 sm:gap-6">
            {[1, 2, 3].map((l) => { const B = BOSSES[l]; return (
              <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} aria-label={`HSK ${l}: ${B.name}`}
                className={`relative z-10 flex w-1/3 flex-col items-center rounded-xl border-2 p-2 transition-colors ${level === l ? 'border-[rgb(91,63,209)] bg-white' : 'border-transparent bg-white/40 hover:bg-white/70'}`}>
                <span className="block aspect-square h-[clamp(56px,13dvh,170px)]"><B.Art mood={level === l ? 'happy' : 'idle'} /></span>
                <span className="mt-1 text-sm font-bold">HSK {l}</span><span className="text-xs text-stone-600">{B.name}</span>
              </button>); })}
          </div>
        </div>

        <div className="lab-surface flex min-h-0 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-28 text-sm font-semibold text-stone-600">Thời gian mỗi từ</span>
            {TIME_OPTIONS.map((t) => <button key={t} onClick={() => setSecs(t)} aria-pressed={secs === t} className={`min-h-[44px] min-w-[56px] rounded-lg border px-3 text-sm font-bold ${secs === t ? 'border-brand-ink/50 bg-brand text-ink' : 'border-line bg-white text-stone-600 hover:border-stone-400'}`}>{t} giây</button>)}
          </div>
          <label className="flex min-h-[44px] items-center gap-3 text-sm text-stone-700">
            <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} className="h-5 w-5 shrink-0 accent-[rgb(91,63,209)]" />
            <span>Yêu cầu gõ đúng dấu thanh (mặc định không cần dấu, ví dụ gõ <b>nihao</b> cho nǐ hǎo)</span>
          </label>
          <ul className="list-inside list-disc text-sm text-stone-600">
            <li>Gõ pinyin của chữ Hán hiện ra để tấn công Boss. Gõ sai không mất máu nhưng ngắt combo.</li>
            <li>Boss HSK {level} có {maxHp} HP; trả lời đúng liên tiếp để gây thêm sát thương.</li>
          </ul>
          {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button className="btn-primary mt-auto !min-h-[52px] w-full shrink-0 text-base" onClick={start} disabled={phase === 'loading'}>{phase === 'loading' ? 'Đang tải từ vựng…' : `Đấu với ${bossName}`}</button>
        </div>
      </div>
    );
  }

  if (phase === 'won' || phase === 'ended') {
    const won = phase === 'won';
    return (
      <div className={FRAME}>
        <div className="flex min-h-0 flex-col gap-3">
          <div className={styles.stage}>
            <div className={styles.ground} />
            <div className={styles.bossWrap}>{won ? <div className={`${styles.boss} ${styles.win}`}><span className="flex h-full items-center justify-center text-[clamp(3rem,11dvh,6rem)] leading-none" aria-hidden>🎉</span></div> : <div className={`${styles.boss} ${styles.idle}`}><Art mood="happy" /></div>}</div>
            <h2 className="relative text-center text-xl font-extrabold sm:text-2xl">{won ? `Bạn đã hạ ${bossName}!` : `${bossName} vẫn còn ${hp} HP`}</h2>
            <p className="relative text-center text-sm text-stone-700">{won ? 'Chiến thắng! Đây là kết quả trận đấu của bạn.' : 'Đã hết từ trong lượt này. Thử lại để hạ Boss nhé.'}</p>
          </div>
          <dl className="grid grid-cols-4 gap-2">
            {[['Từ đúng', `${correct}/${presented}`], ['Chính xác', `${accuracy}%`], ['Tốc độ TB', avg ? `${avg.toFixed(1)}s` : '—'], ['Combo cao nhất', `${maxCombo}`]].map(([k, v]) => (
              <div key={k} className="lab-surface px-1 py-2 text-center"><dt className="text-[11px] leading-tight text-stone-600">{k}</dt><dd className="mt-0.5 text-lg font-extrabold tabular-nums">{v}</dd></div>
            ))}
          </dl>
          <p className="text-center text-sm text-stone-600">Điểm: <b className="tabular-nums text-ink">{score}</b> · Số lần gõ sai: {slips}</p>
        </div>

        <section aria-labelledby="can-on" className="lab-surface flex min-h-0 flex-col gap-3 p-4">
          <h2 id="can-on" className="shrink-0 font-bold">Từ cần ôn ({misses.length})</h2>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {misses.length === 0 ? <p className="text-stone-700">Không có từ nào bị bỏ lỡ. Tuyệt vời!</p> : (
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
                {misses.map((m) => (
                  <li key={m.word.id}><Link href={`/word/${m.word.id}`} className="flex min-h-[56px] items-center gap-3 px-3 py-2 hover:bg-stone-50">
                    <span lang="zh-Hans" className="hanzi w-16 shrink-0 text-2xl">{m.word.hanzi}</span>
                    <span className="min-w-0 flex-1"><span className="pinyin block font-medium text-brand-ink">{m.word.pinyin}</span><span className="block truncate text-sm text-stone-700">{m.word.meaningVi || m.word.meaningEn}</span></span>
                    <span className="text-xs text-stone-500">Hết giờ</span></Link></li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="btn-primary !min-h-[48px] flex-1" onClick={start}>Chơi lại</button>
            <button className="btn-ghost !min-h-[48px] flex-1" onClick={() => setPhase('setup')}>Đổi Boss</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={FRAME}>
      <div className={styles.stage}>
        <div className={styles.ground} />
        <div className="relative mb-1 flex shrink-0 items-center gap-3">
          <span className="text-sm font-bold">{bossName}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full border-2 border-[#5b5a6b] bg-white" role="progressbar" aria-label="Máu của Boss" aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={hp}>
            <div className={`${styles.bar} h-full`} style={{ width: `${hpPct}%`, background: hpColor }} />
          </div>
          <span className="w-16 text-right text-sm font-bold tabular-nums" data-testid="hp">{hp}/{maxHp}</span>
        </div>
        <div className={styles.bossWrap}>
          {stageBoss}
          {dmg && <span key={dmg.k} className={styles.dmg} aria-hidden>-{dmg.n} HP</span>}
        </div>
      </div>

      <div className="lab-surface flex min-h-0 flex-col p-3 text-center sm:p-4">
        <div className="flex shrink-0 items-center justify-between text-sm">
          <span>Từ {idx + 1}/{pool.length}</span>
          <span className="font-bold">Điểm <span className="tabular-nums" data-testid="score">{score}</span></span>
          <span className="font-bold">Combo <span key={combo} className={`${styles.combo} tabular-nums`} data-testid="combo">x{combo}</span></span>
        </div>

        {phase === 'paused' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3"><p className="text-xl font-bold">Đã tạm dừng</p><button className="btn-primary !min-h-[48px]" onClick={resume}>Tiếp tục</button></div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col items-stretch justify-center gap-[clamp(0.25rem,1.2dvh,0.75rem)]">
              <p lang="zh-Hans" data-testid="word" className="hanzi text-[clamp(2.5rem,11dvh,7rem)] leading-[1.1] lg:text-[clamp(3.5rem,15dvh,8rem)]">{word?.hanzi}</p>
              <div className="h-3 shrink-0 overflow-hidden rounded-full bg-stone-100" role="timer" aria-label="Thời gian còn lại"><div className={`${styles.timer} h-full rounded-full`} style={{ width: `${timerPct}%`, background: timerPct > 30 ? '#4a90d9' : '#e0503c' }} /></div>
              <p className="text-sm tabular-nums text-stone-600" data-testid="secs">{(remaining / 1000).toFixed(1)} giây</p>
              <div className={shake ? styles.shake : undefined} key={shake}>
                <label htmlFor="pinyin-input" className="sr-only">Gõ pinyin</label>
                <input id="pinyin-input" ref={inputRef} value={value} disabled={reveal !== null}
                  onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } }}
                  inputMode="text" enterKeyHint="send" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
                  placeholder={strict ? 'Gõ pinyin có dấu rồi nhấn Enter' : 'Gõ pinyin (không cần dấu) rồi nhấn Enter'} className="input !min-h-[52px] text-center text-xl" />
              </div>
              <div aria-live="polite" className="min-h-[2rem] text-sm [@media(min-height:700px)]:min-h-[2.5rem]">
                {reveal === 'ok' && <p className="font-bold text-emerald-700">✓ Trúng đòn! <span className="pinyin text-brand-ink">{word?.pinyin}</span> · {word?.meaningVi || word?.meaningEn}</p>}
                {reveal === 'miss' && <p className="font-bold text-red-700">Hết giờ! Đáp án: <span className="pinyin text-lg text-brand-ink" data-testid="answer">{answerShown}</span> · {word?.meaningVi || word?.meaningEn}</p>}
              </div>
            </div>
            <div className="shrink-0 pt-1"><button className="btn-ghost !min-h-[44px]" onClick={pause} disabled={reveal !== null}>Tạm dừng</button></div>
          </>
        )}
      </div>
    </div>
  );
}
