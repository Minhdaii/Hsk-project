'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ClozeQuestion, ExerciseMeta, OrderQuestion, Word } from '@/lib/types';
import { speak } from '@/lib/speak';
import SpeakButton from '@/components/SpeakButton';
import CountPicker from '@/components/CountPicker';
import PageHeader from '@/components/PageHeader';
import { AnswerPanel, GameHeader, GameResult, useCombo } from '@/components/game/GameBits';

type GameMode = 'match' | 'order' | 'cloze' | 'listen' | 'dialogue';

const GAMES: { id: GameMode; glyph: string; title: string; desc: string; duration: string }[] = [
  { id: 'match', glyph: '配', title: '1. Ghép từ với nghĩa', desc: 'Chọn từng cặp chữ Hán và giải nghĩa tiếng Việt tương ứng.', duration: '2–3 phút' },
  { id: 'order', glyph: '排', title: '2. Sắp xếp từ thành câu', desc: 'Sắp đặt các thẻ từ theo đúng trật tự ngữ pháp chuẩn.', duration: '3–5 phút' },
  { id: 'cloze', glyph: '填', title: '3. Điền từ còn thiếu', desc: 'Chọn từ vựng chính xác để hoàn thành vị trí trống trong câu.', duration: '3–5 phút' },
  { id: 'listen', glyph: '听', title: '4. Nghe và chọn đáp án', desc: 'Lắng nghe phát âm âm thanh và chọn mặt chữ Hán chuẩn xác.', duration: '2–4 phút' },
  { id: 'dialogue', glyph: '话', title: '5. Tình huống giao tiếp', desc: 'Chọn câu phản hồi phù hợp trong các bối cảnh đời sống hằng ngày.', duration: '3–5 phút' },
];

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const shortMeaning = (m: string | null) => (m || '').split(';')[0].trim();

type GameProps = { level: number; count: number; onAgain: () => void; onExit: () => void };

function useFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let off = false;
    setData(null); setError('');
    api<T>(path)
      .then((d) => { if (!off) setData(d); })
      .catch((e) => { if (!off) setError(e instanceof Error ? e.message : 'Có lỗi xảy ra khi tải bài tập'); });
    return () => { off = true; };
  }, [path]);
  return { data, error };
}

function Problem({ msg, onExit }: { msg: string; onExit: () => void }) {
  return (
    <div className="editorial-card space-y-4 p-8 text-center">
      <p className="text-xs text-stone-600">{msg}</p>
      <button className="btn-editorial-ghost text-xs" onClick={onExit}>Quay lại danh mục trò chơi</button>
    </div>
  );
}

const Loading = () => <div className="editorial-card flex h-48 items-center justify-center text-xs text-[#777184]">Đang chuẩn bị nội dung bài tập…</div>;

function NextButton({ last, onClick }: { last: boolean; onClick: () => void }) {
  return (
    <button className="btn-editorial-primary w-full animate-fade-up !py-3.5 text-xs font-bold" onClick={onClick}>
      {last ? 'Hoàn thành và xem kết quả' : 'Câu tiếp theo'} →
    </button>
  );
}

const optionBase = 'rounded-lg border px-3.5 py-3 text-center transition-all duration-150';
const optionIdle = 'border-[#E7E2F0] bg-white hover:border-[#A99AE8] hover:bg-[#FAF9FD] text-[#302B3D] active:translate-y-px';
const optionRight = 'animate-pop border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs';
const optionWrong = 'animate-shake border-red-400 bg-red-50 text-red-900 font-semibold';
const optionDim = 'border-[#E7E2F0] bg-white opacity-40 text-stone-400';

/* ============================================================
   GAME 1: GHÉP TỪ VỚI NGHĨA (Matching Pairs)
   ============================================================ */
type MatchItem = { id: number; text: string; wordId: number; type: 'hanzi' | 'meaning'; matched: boolean };

function MatchGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ items: Word[] }>(`/words?level=${level}&limit=${Math.min(count, 8)}`);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selected, setSelected] = useState<MatchItem | null>(null);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  useEffect(() => {
    if (!data?.items?.length) return;
    const cards: MatchItem[] = [];
    data.items.slice(0, 6).forEach((w, idx) => {
      cards.push({ id: idx * 2 + 1, text: w.hanzi, wordId: w.id, type: 'hanzi', matched: false });
      cards.push({ id: idx * 2 + 2, text: shortMeaning(w.meaningVi || w.meaningEn), wordId: w.id, type: 'meaning', matched: false });
    });
    setItems(shuffle(cards));
    setSelected(null);
    setWrongIds([]);
    setScore(0);
    setDone(false);
  }, [data]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  if (done) return <GameResult score={score} total={items.length / 2} best={best} onAgain={onAgain} onExit={onExit} />;

  const handleSelect = (item: MatchItem) => {
    if (item.matched || wrongIds.length > 0) return;
    if (!selected) {
      setSelected(item);
      return;
    }
    if (selected.id === item.id) {
      setSelected(null);
      return;
    }
    // So sánh xem có cùng wordId nhưng khác loại (hanzi ↔ meaning) không
    if (selected.wordId === item.wordId && selected.type !== item.type) {
      // Đúng
      record(true);
      setScore((s) => s + 1);
      const updated = items.map((x) =>
        x.wordId === item.wordId ? { ...x, matched: true } : x
      );
      setItems(updated);
      setSelected(null);
      if (updated.every((x) => x.matched)) {
        setTimeout(() => setDone(true), 600);
      }
    } else {
      // Sai
      record(false);
      setWrongIds([selected.id, item.id]);
      setTimeout(() => {
        setWrongIds([]);
        setSelected(null);
      }, 700);
    }
  };

  const matchedCount = items.filter((x) => x.matched).length / 2;
  const totalPairs = items.length / 2;

  return (
    <div className="space-y-4">
      <GameHeader i={matchedCount} total={totalPairs} score={score} combo={combo} />
      <div className="editorial-card p-4 text-center sm:p-5">
        <span className="editorial-badge">GHÉP CẶP TƯƠNG ỨNG</span>
        <p className="mt-1.5 text-xs text-[#777184]">
          Chạm vào một ô chữ Hán và ô ý nghĩa tiếng Việt tương ứng để nối thành cặp chuẩn xác
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const isSelected = selected?.id === item.id;
          const isWrong = wrongIds.includes(item.id);
          const isHanzi = item.type === 'hanzi';

          const state = item.matched
            ? 'border-emerald-400 bg-emerald-50/70 text-emerald-800 opacity-40 cursor-default scale-95'
            : isWrong
            ? 'animate-shake border-rose-400 bg-rose-50 text-rose-900 font-bold'
            : isSelected
            ? 'border-2 border-[#A99AE8] bg-[#EEE9FC] text-[#3B2D78] shadow-sm -translate-y-0.5'
            : isHanzi
            ? 'border-[#E7E2F0] bg-white text-[#302B3D] hover:border-[#A99AE8] hover:bg-[#FAF9FD] active:translate-y-px shadow-2xs'
            : 'border-[#E7E2F0] bg-[#FAF9FD] text-[#484256] hover:border-[#A99AE8] hover:bg-white active:translate-y-px shadow-2xs';

          return (
            <button
              key={item.id}
              disabled={item.matched}
              onClick={() => handleSelect(item)}
              className={`flex min-h-[72px] flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${state}`}
            >
              <span className={isHanzi ? 'hanzi text-2xl font-bold' : 'text-xs font-semibold'}>
                {item.text}
              </span>
              <span className="mt-1 text-[10px] text-[#9892A6]">
                {isHanzi ? 'Chữ Hán' : 'Tiếng Việt'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   GAME 2: SẮP XẾP TỪ THÀNH CÂU (Sentence Order)
   ============================================================ */
type Chip = { id: number; t: string };

function OrderGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: OrderQuestion[] }>(`/exercises/order?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [bank, setBank] = useState<Chip[]>([]);
  const [ans, setAns] = useState<Chip[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();
  const qs = data?.questions;

  useEffect(() => {
    const q = qs?.[i];
    if (!q) return;
    setBank(shuffle(q.tokens.map((t, id) => ({ id, t }))));
    setAns([]); setChecked(null);
  }, [qs, i]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!qs) return <Loading />;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const locked = checked !== null;
  const check = () => {
    const ok = ans.map((c) => c.t).join('') === q.tokens.join('');
    setChecked(ok); record(ok);
    if (ok) setScore((s) => s + 1);
  };
  const chip = 'hanzi rounded-lg border px-3 py-1.5 text-lg font-bold transition-all duration-150 active:translate-y-px';

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <div className="editorial-card space-y-2 p-5 text-center sm:p-7">
        <span className="editorial-badge">SẮP XẾP THÀNH CÂU HOÀN CHỈNH</span>
        <p className="text-base font-bold leading-snug text-[#302B3D] sm:text-lg">{q.meaningVi}</p>
      </div>

      <div className={`flex min-h-[4.75rem] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-3.5 transition-colors ${checked === null ? 'border-[#E7E2F0] bg-white' : checked ? 'border-emerald-500 bg-emerald-50/60' : 'animate-shake border-red-400 bg-red-50/70'}`}>
        {ans.length === 0 && <span className="px-1 text-xs text-[#777184]">Chạm vào các thẻ từ bên dưới để ghép thành câu…</span>}
        {ans.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setAns(ans.filter((x) => x.id !== c.id)); setBank([...bank, c]); }}
            className={`${chip} animate-pop border-[#DED7F0] bg-[#EEE9FC] text-[#3B2D78] hover:border-[#A99AE8]`}>{c.t}</button>
        ))}
      </div>

      <div className="flex min-h-[3.5rem] flex-wrap justify-center gap-2">
        {bank.map((c) => (
          <button key={c.id} disabled={locked} onClick={() => { setBank(bank.filter((x) => x.id !== c.id)); setAns([...ans, c]); }}
            className={`${chip} border-[#E7E2F0] bg-white text-[#302B3D] hover:border-[#A99AE8] hover:bg-[#FAF9FD]`}>{c.t}</button>
        ))}
      </div>

      {locked && (
        <div className={`rounded-xl border p-4 text-center ${checked ? 'border-emerald-500/50 bg-emerald-50/70' : 'border-red-400/50 bg-red-50/80'}`}>
          <p className={`text-xs font-bold ${checked ? 'text-emerald-800' : 'text-red-800'}`}>{checked ? '✓ Rất chính xác!' : '✕ Chưa đúng. Câu chuẩn là:'}</p>
          <p className="hanzi mt-1 text-2xl font-bold text-[#302B3D]">{q.tokens.join('')}</p>
          {q.pinyin && <p className="pinyin mt-0.5 text-xs font-semibold text-[#55449E]">{q.pinyin}</p>}
          <div className="mt-2">
            <SpeakButton text={q.tokens.join('')} label />
          </div>
        </div>
      )}

      {!locked ? (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-editorial-ghost !py-3 text-xs" disabled={ans.length === 0} onClick={() => { setBank([...bank, ...ans]); setAns([]); }}>Xếp lại</button>
          <button className="btn-editorial-primary !py-3 text-xs" disabled={bank.length > 0} onClick={check}>Kiểm tra đáp án</button>
        </div>
      ) : <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else setI(i + 1); }} />}
    </div>
  );
}

/* ============================================================
   GAME 3: ĐIỀN TỪ CÒN THIẾU (Cloze Question)
   ============================================================ */
function ClozeGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: ClozeQuestion[] }>(`/exercises/cloze?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  const qs = data.questions;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const answered = picked !== null;
  const correct = picked === q.answer.hanzi;
  const [before, after] = q.sentence.split('____');
  const pick = (hanzi: string) => {
    if (answered) return;
    const ok = hanzi === q.answer.hanzi;
    setPicked(hanzi); record(ok); if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      <div className="editorial-card space-y-3 p-5 text-center sm:p-7">
        <span className="editorial-badge">ĐIỀN TỪ CÒN THIẾU</span>
        <div className="hanzi break-words text-2xl font-bold leading-relaxed text-[#302B3D] sm:text-3xl">
          {before}
          <span className={`mx-1.5 inline-block min-w-[3.5rem] border-b-2 px-1.5 transition-colors ${!answered ? 'border-[#A99AE8] text-transparent' : correct ? 'border-emerald-600 text-emerald-800' : 'border-red-500 text-red-600'}`}>
            {answered ? picked : '＿＿'}
          </span>
          {after}
        </div>
        {q.meaningVi && <p className="text-xs leading-relaxed text-[#777184]">{q.meaningVi}</p>}
        {answered && (
          <div className="animate-fade-up space-y-1 border-t border-[#E7E2F0] pt-4">
            <p className={`text-xs font-bold ${correct ? 'text-emerald-800' : 'text-red-700'}`}>
              {correct ? '✓ Rất chính xác!' : <>Đáp án chuẩn: <span className="hanzi text-base font-bold text-emerald-800">{q.answer.hanzi}</span></>}
            </p>
            {q.pinyin && <p className="pinyin text-xs font-semibold text-[#55449E]">{q.pinyin}</p>}
            <div className="pt-1">
              <SpeakButton text={q.fullSentence} label />
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {q.options.map((o) => {
          const isAnswer = o.hanzi === q.answer.hanzi;
          const state = !answered ? optionIdle : isAnswer ? optionRight : o.hanzi === picked ? optionWrong : optionDim;
          return (
            <button key={o.hanzi} disabled={answered} onClick={() => pick(o.hanzi)} className={`${optionBase} ${state}`}>
              <span className="hanzi block text-2xl font-bold">{o.hanzi}</span>
              {answered && <span className="pinyin block text-xs font-medium text-stone-500">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>
      {answered && <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }} />}
    </div>
  );
}

/* ============================================================
   GAME 5: NGHE VÀ CHỌN ĐÁP ÁN (Listening Quiz)
   ============================================================ */
type QuizQ = { word: Word; options: Word[] };

function ListenGame({ level, count, onAgain, onExit }: GameProps) {
  const { data, error } = useFetch<{ questions: QuizQ[] }>(`/quiz?level=${level}&count=${count}`);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  useEffect(() => {
    if (data?.questions?.[i]) {
      speak(data.questions[i].word.hanzi, data.questions[i].word.audioUrl);
    }
  }, [data, i]);

  if (error) return <Problem msg={error} onExit={onExit} />;
  if (!data) return <Loading />;
  const qs = data.questions;
  if (done) return <GameResult score={score} total={qs.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = qs[i];
  const answered = picked !== null;
  const ok = picked === q.word.id;
  const pick = (id: number) => {
    if (answered) return;
    setPicked(id); record(id === q.word.id); if (id === q.word.id) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={qs.length} score={score} combo={combo} />
      
      {/* Khung trung tâm thính giác với hiệu ứng âm thanh */}
      <div className="editorial-card flex min-h-[13rem] flex-col items-center justify-center p-6 text-center sm:p-8">
        <span className="editorial-badge mb-3">NGHE PHÁT ÂM CHỌN MẶT CHỮ</span>
        
        {/* Sóng âm visualizer */}
        <div className="flex items-center gap-1.5 my-3 h-8">
          <span className="w-1.5 h-4 bg-[#A99AE8] rounded-full animate-pulse" />
          <span className="w-1.5 h-8 bg-[#55449E] rounded-full animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-6 bg-[#A99AE8] rounded-full animate-pulse [animation-delay:300ms]" />
          <span className="w-1.5 h-10 bg-[#55449E] rounded-full animate-pulse [animation-delay:75ms]" />
          <span className="w-1.5 h-5 bg-[#A99AE8] rounded-full animate-pulse [animation-delay:220ms]" />
        </div>

        <button
          onClick={() => speak(q.word.hanzi, q.word.audioUrl)}
          className="btn-editorial-primary !min-h-[46px] !px-7 text-xs font-bold shadow-sm"
        >
          🔊 Phát âm lại giọng bản ngữ
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((o) => {
          const isAnswer = o.id === q.word.id;
          const state = !answered ? optionIdle : isAnswer ? optionRight : o.id === picked ? optionWrong : optionDim;
          return (
            <button key={o.id} disabled={answered} onClick={() => pick(o.id)} className={`${optionBase} ${state} !min-h-[72px]`}>
              <span className="hanzi block text-3xl font-bold">{o.hanzi}</span>
              {answered && <span className="pinyin block text-xs font-semibold text-[#55449E] mt-1">{o.pinyin}</span>}
            </button>
          );
        })}
      </div>

      {answered && <AnswerPanel ok={ok} hanzi={q.word.hanzi} pinyin={q.word.pinyin} meaning={q.word.meaningVi} audioUrl={q.word.audioUrl} />}
      {answered && <NextButton last={i + 1 >= qs.length} onClick={() => { if (i + 1 >= qs.length) setDone(true); else { setI(i + 1); setPicked(null); } }} />}
    </div>
  );
}

/* ============================================================
   GAME 6: TÌNH HUỐNG GIAO TIẾP (Dialogue Scenarios)
   ============================================================ */
type ScenarioQ = {
  scenario: string;
  speakerA: string;
  speakerAPinyin: string;
  speakerAMeaning: string;
  options: { hanzi: string; pinyin: string; meaning: string; correct: boolean }[];
  explanation: string;
};

const SCENARIOS: ScenarioQ[] = [
  {
    scenario: 'Chào hỏi lần đầu gặp gỡ',
    speakerA: '你好！很高兴认识你。',
    speakerAPinyin: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.',
    speakerAMeaning: 'Xin chào! Rất vui được quen biết bạn.',
    options: [
      { hanzi: '我也很高兴认识你。', pinyin: 'Wǒ yě hěn gāoxìng rènshí nǐ.', meaning: 'Tôi cũng rất vui được quen bạn.', correct: true },
      { hanzi: '没关系。', pinyin: 'Méi guānxi.', meaning: 'Không có gì.', correct: false },
      { hanzi: '多少钱？', pinyin: 'Duōshao qián?', meaning: 'Bao nhiêu tiền?', correct: false },
      { hanzi: '再见！', pinyin: 'Zàijiàn!', meaning: 'Tạm biệt!', correct: false },
    ],
    explanation: 'Khi đối phương nói "很高兴认识你", câu đáp chuẩn lịch sự là "我也很高兴认识你" (Tôi cũng rất vui...).',
  },
  {
    scenario: 'Hỏi giá khi mua sắm',
    speakerA: '这个苹果多少钱一斤？',
    speakerAPinyin: 'Zhège píngguǒ duōshao qián yī jīn?',
    speakerAMeaning: 'Táo này bao nhiêu tiền một cân?',
    options: [
      { hanzi: '五块钱一斤。', pinyin: 'Wǔ kuài qián yī jīn.', meaning: 'Năm tệ một cân.', correct: true },
      { hanzi: '我是越南人。', pinyin: 'Wǒ shì yuènán rén.', meaning: 'Tôi là người Việt Nam.', correct: false },
      { hanzi: '太谢谢你了。', pinyin: 'Tài xièxie nǐ le.', meaning: 'Cảm ơn bạn rất nhiều.', correct: false },
      { hanzi: '现在三点。', pinyin: 'Xiànzài sān diǎn.', meaning: 'Bây giờ là ba giờ.', correct: false },
    ],
    explanation: 'Câu hỏi về giá tiền "多少钱" cần câu trả lời có số tiền và đơn vị tệ ("五块钱...").',
  },
  {
    scenario: 'Hỏi thăm thời gian',
    speakerA: '请问，现在几点了？',
    speakerAPinyin: 'Qǐngwèn, xiànzài jǐ diǎn le?',
    speakerAMeaning: 'Xin hỏi, bây giờ là mấy giờ rồi?',
    options: [
      { hanzi: '现在上午十点半。', pinyin: 'Xiànzài shàngwǔ shí diǎn bàn.', meaning: 'Bây giờ là mười giờ rưỡi sáng.', correct: true },
      { hanzi: '明天见。', pinyin: 'Míngtiān jiàn.', meaning: 'Ngày mai gặp.', correct: false },
      { hanzi: '我不去。', pinyin: 'Wǒ bù qù.', meaning: 'Tôi không đi.', correct: false },
      { hanzi: '很好吃。', pinyin: 'Hěn hǎochī.', meaning: 'Rất ngon miệng.', correct: false },
    ],
    explanation: 'Câu hỏi giờ "几点了" đáp lại bằng thời điểm cụ thể ("十点半").',
  },
  {
    scenario: 'Lời cảm ơn và đáp lễ',
    speakerA: '今天太谢谢你了！',
    speakerAPinyin: 'Jīntiān tài xièxie nǐ le!',
    speakerAMeaning: 'Hôm nay cảm ơn bạn nhiều lắm nhé!',
    options: [
      { hanzi: '不客气，不用谢。', pinyin: 'Bù kèqi, bù yòng xiè.', meaning: 'Không có chi, đừng khách sáo.', correct: true },
      { hanzi: '对不起。', pinyin: 'Duìbuqǐ.', meaning: 'Xin lỗi.', correct: false },
      { hanzi: '欢迎光临。', pinyin: 'Huānyíng guānglín.', meaning: 'Hoan nghênh quý khách.', correct: false },
      { hanzi: '去医院。', pinyin: 'Qù yīyuàn.', meaning: 'Đi bệnh viện.', correct: false },
    ],
    explanation: 'Khi nhận lời cảm ơn "谢谢", câu đáp lễ chuẩn mực là "不客气" hoặc "不用谢".',
  },
];

function DialogueGame({ onAgain, onExit }: { onAgain: () => void; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { combo, best, record } = useCombo();

  if (done) return <GameResult score={score} total={SCENARIOS.length} best={best} onAgain={onAgain} onExit={onExit} />;

  const q = SCENARIOS[i];
  const answered = picked !== null;
  const isCorrect = picked !== null && q.options[picked].correct;

  const handlePick = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    const ok = q.options[idx].correct;
    record(ok);
    if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <GameHeader i={i} total={SCENARIOS.length} score={score} combo={combo} />
      
      {/* Khung mô phỏng đàm thoại thực tế */}
      <div className="editorial-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-2.5">
          <span className="editorial-badge">BỐI CẢNH ĐÀM THOẠI</span>
          <span className="text-xs font-semibold text-[#55449E]">{q.scenario}</span>
        </div>

        {/* Bong bóng lời nói của đối phương */}
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A99AE8] text-sm font-bold text-[#241D45] shadow-xs">
            友
          </span>
          <div className="rounded-2xl rounded-tl-sm border border-[#DED7F0] bg-[#EEE9FC]/80 p-4 max-w-lg shadow-2xs">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#55449E] mb-1">
              Người đối thoại nói:
            </span>
            <div lang="zh-Hans" className="hanzi text-xl font-bold text-[#302B3D] sm:text-2xl">
              {q.speakerA}
            </div>
            <div className="pinyin mt-0.5 text-xs font-semibold text-[#55449E]">{q.speakerAPinyin}</div>
            <div className="mt-1 text-xs text-[#777184]">{q.speakerAMeaning}</div>
            <div className="mt-2.5">
              <SpeakButton text={q.speakerA} label />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold text-[#302B3D] uppercase tracking-wider">
            Bạn sẽ đáp lại như thế nào?
          </p>
        </div>
      </div>

      <div className="grid gap-2.5">
        {q.options.map((o, idx) => {
          const isSelected = picked === idx;
          const state = !answered
            ? optionIdle
            : o.correct
            ? optionRight
            : isSelected
            ? optionWrong
            : optionDim;

          return (
            <button
              key={idx}
              disabled={answered}
              onClick={() => handlePick(idx)}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-xl border p-4 text-left transition-all ${state} !min-h-[56px]`}
            >
              <div className="flex items-baseline gap-2.5">
                <span className="editorial-badge !text-[10px] !px-1.5">#{idx + 1}</span>
                <span className="hanzi text-lg font-bold text-[#302B3D]">{o.hanzi}</span>
              </div>
              <span className="text-xs text-[#777184]">{o.meaning}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`rounded-xl border p-4 text-xs ${isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-rose-400 bg-rose-50 text-rose-950'}`}>
          <div className="font-bold">{isCorrect ? '✓ Đáp án chuẩn xác!' : '✕ Chưa phù hợp.'}</div>
          <p className="mt-1 leading-relaxed text-[#504A5D]">{q.explanation}</p>
        </div>
      )}

      {answered && (
        <NextButton
          last={i + 1 >= SCENARIOS.length}
          onClick={() => {
            if (i + 1 >= SCENARIOS.length) setDone(true);
            else { setI(i + 1); setPicked(null); }
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   TRANG CHÍNH: PHÒNG LUYỆN TẬP TỔNG HỢP (GAME HUB)
   ============================================================ */
function ExercisesContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') as GameMode | null;
  const initialLevel = Number(searchParams.get('level')) || 1;

  const [mode, setMode] = useState<GameMode | null>(
    initialMode && ['match', 'order', 'cloze', 'listen', 'dialogue'].includes(initialMode)
      ? initialMode
      : null
  );
  const [level, setLevel] = useState(initialLevel >= 1 && initialLevel <= 3 ? initialLevel : 1);
  const [count, setCount] = useState(10);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const qMode = searchParams.get('mode') as GameMode | null;
    if (qMode && ['match', 'order', 'cloze', 'listen', 'dialogue'].includes(qMode)) {
      setMode(qMode as GameMode);
    }
  }, [searchParams]);

  useEffect(() => {
    const n = Number(localStorage.getItem('hsk_count'));
    if (n >= 3 && n <= 50) setCount(n);
  }, []);
  const changeCount = (n: number) => {
    setCount(n);
    localStorage.setItem('hsk_count', String(n));
  };

  if (mode) {
    const selectedGame = GAMES.find((x) => x.id === mode)!;
    return (
      <div className="mx-auto max-w-lg space-y-4">
        {/* Thanh điều hướng lúc chơi (In-Game Focus Bar) */}
        <div className="flex items-center gap-3 border-b border-[#E7E2F0] pb-3">
          <button className="btn-editorial-ghost !min-h-[36px] !px-3 text-xs" onClick={() => setMode(null)}>
            ← Danh mục trò chơi
          </button>
          <span lang="zh-Hans" aria-hidden className="hanzi flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEE9FC] text-base font-bold text-[#55449E]">
            {selectedGame.glyph}
          </span>
          <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-[#302B3D]">
            {selectedGame.title} <span className="text-xs font-normal text-[#777184]">· HSK Cấp {level}</span>
          </h1>
        </div>

        {mode === 'match' && <MatchGame key={`m-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'order' && <OrderGame key={`o-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'cloze' && <ClozeGame key={`c-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'listen' && <ListenGame key={`l-${level}-${count}-${round}`} level={level} count={count} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
        {mode === 'dialogue' && <DialogueGame key={`d-${round}`} onAgain={() => setRound((r) => r + 1)} onExit={() => setMode(null)} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        glyph="练"
        title="Phòng luyện tập & Mini-games"
        subtitle="5 trò chơi giáo dục tương tác rèn luyện phản xạ chữ Hán, ngữ pháp, thính giác và đàm thoại đời sống"
      />

      {/* Thử thách đề xuất hôm nay (Featured Activity) */}
      <div className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white relative overflow-hidden p-6 sm:p-7 border-l-4 border-l-[#A99AE8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <span className="editorial-badge">THỬ THÁCH HÔM NAY</span>
              <span className="text-xs text-[#777184]">Thời lượng 2–3 phút</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-[#302B3D]">
              Ghép từ vựng phản xạ HSK Cấp {level}
            </h2>
            <p className="mt-1 text-xs text-[#777184] leading-relaxed">
              Khởi động ngày mới với bài tập ghép cặp chữ Hán và giải nghĩa tiếng Việt, rèn luyện tốc độ nhận diện mặt chữ và phản xạ ngữ nghĩa tức thì.
            </p>
          </div>
          <button
            onClick={() => setMode('match')}
            className="btn-editorial-primary shrink-0 text-xs font-bold !min-h-[46px] !px-6 shadow-sm"
          >
            Chơi ngay hôm nay →
          </button>
        </div>
      </div>

      {/* Bộ điều khiển cấp độ & số lượng câu hỏi */}
      <section className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white space-y-4 p-5 sm:p-6 shadow-sm" aria-labelledby="cau-hinh-bai-tap">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <span id="cau-hinh-bai-tap" className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-[#777184]">
            Cấp độ luyện
          </span>
          <div role="group" aria-label="Chọn cấp độ luyện tập" className="inline-flex rounded-xl border border-[#D8D1EE] bg-[#FAF9FD] p-1">
            {[1, 2, 3].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                aria-pressed={l === level}
                className={`min-h-[36px] rounded-lg px-4 text-xs font-bold transition-all ${
                  l === level
                    ? 'border border-[#C8BEF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                    : 'text-[#777184] hover:text-[#302B3D]'
                }`}
              >
                HSK Cấp {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#F0ECF6] pt-4 sm:flex-row sm:items-center sm:gap-6">
          <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wider text-[#777184]">
            Số câu hỏi
          </span>
          <CountPicker value={count} onChange={changeCount} />
        </div>
      </section>

      {/* DANH SÁCH 5 TRÒ CHƠI — ĐÓNG KHUNG RÕ RÀNG VÀ DỄ NHÌN */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E7E2F0] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="editorial-badge !text-[10px]">DANH MỤC TRÒ CHƠI</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#302B3D]">
              5 Mini-games luyện tập phản xạ
            </h3>
          </div>
          <span className="text-xs text-[#777184]">HSK Cấp {level}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Ghép từ với nghĩa */}
          <div className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white flex flex-col justify-between p-5 hover:border-[#A99AE8] hover:shadow-md transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span lang="zh-Hans" className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE9FC] text-xl font-bold text-[#55449E]">
                  配
                </span>
                <span className="rounded-md bg-[#F0ECF6] px-2 py-0.5 text-[10px] font-semibold text-[#777184]">
                  2–3 phút
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-[#302B3D]">1. Ghép từ với nghĩa</h4>
              <p className="mt-1 text-xs text-[#777184] leading-relaxed">
                Nối từng cặp chữ Hán và ý nghĩa tiếng Việt tương ứng để củng cố phản xạ nhận diện từ vựng.
              </p>
              {/* Visual Preview */}
              <div className="mt-3.5 flex items-center gap-2 text-xs">
                <span className="rounded-md border border-[#D8D1EE] bg-[#FAF9FD] px-2.5 py-1 font-bold text-[#302B3D]">你好</span>
                <span className="text-[#A99AE8] font-bold">↔</span>
                <span className="rounded-md border border-[#DED7F0] bg-[#EEE9FC] px-2.5 py-1 text-[11px] font-semibold text-[#55449E]">Xin chào</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0ECF6]">
              <button
                onClick={() => setMode('match')}
                className="btn-editorial-primary w-full text-xs font-bold !min-h-[44px] shadow-sm"
              >
                Bắt đầu ghép từ →
              </button>
            </div>
          </div>

          {/* 2. Sắp xếp thành câu */}
          <div className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white flex flex-col justify-between p-5 hover:border-[#A99AE8] hover:shadow-md transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span lang="zh-Hans" className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE9FC] text-xl font-bold text-[#55449E]">
                  排
                </span>
                <span className="rounded-md bg-[#F0ECF6] px-2 py-0.5 text-[10px] font-semibold text-[#777184]">
                  3–5 phút
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-[#302B3D]">2. Sắp xếp từ thành câu</h4>
              <p className="mt-1 text-xs text-[#777184] leading-relaxed">
                Sắp đặt các thẻ từ theo đúng trật tự ngữ pháp và cú pháp chuẩn mực trong tiếng Trung.
              </p>
              {/* Visual Preview */}
              <div className="mt-3.5 flex items-center gap-1.5 text-xs">
                <span className="rounded-md border border-[#DED7F0] bg-[#EEE9FC] px-2 py-0.5 text-[11px] font-bold text-[#3B2D78]">我</span>
                <span className="rounded-md border border-[#DED7F0] bg-[#EEE9FC] px-2 py-0.5 text-[11px] font-bold text-[#3B2D78]">是</span>
                <span className="rounded-md border border-[#DED7F0] bg-[#EEE9FC] px-2 py-0.5 text-[11px] font-bold text-[#3B2D78]">学生</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0ECF6]">
              <button
                onClick={() => setMode('order')}
                className="btn-editorial-primary w-full text-xs font-bold !min-h-[44px] shadow-sm"
              >
                Bắt đầu sắp xếp câu →
              </button>
            </div>
          </div>

          {/* 3. Điền từ còn thiếu */}
          <div className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white flex flex-col justify-between p-5 hover:border-[#A99AE8] hover:shadow-md transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span lang="zh-Hans" className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE9FC] text-xl font-bold text-[#55449E]">
                  填
                </span>
                <span className="rounded-md bg-[#F0ECF6] px-2 py-0.5 text-[10px] font-semibold text-[#777184]">
                  3–5 phút
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-[#302B3D]">3. Điền từ còn thiếu</h4>
              <p className="mt-1 text-xs text-[#777184] leading-relaxed">
                Đọc hiểu câu văn có chỗ khuyết và lựa chọn từ vựng chính xác điền vào vị trí ngữ cảnh.
              </p>
              {/* Visual Preview */}
              <div className="mt-3.5 flex items-center gap-1 text-xs">
                <span className="text-xs font-semibold text-[#302B3D]">我喜欢喝 ＿＿ 咖啡</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0ECF6]">
              <button
                onClick={() => setMode('cloze')}
                className="btn-editorial-primary w-full text-xs font-bold !min-h-[44px] shadow-sm"
              >
                Bắt đầu điền từ →
              </button>
            </div>
          </div>

          {/* 4. Nghe và chọn đáp án */}
          <div className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white flex flex-col justify-between p-5 hover:border-[#A99AE8] hover:shadow-md transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span lang="zh-Hans" className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE9FC] text-xl font-bold text-[#55449E]">
                  听
                </span>
                <span className="rounded-md bg-[#F0ECF6] px-2 py-0.5 text-[10px] font-semibold text-[#777184]">
                  2–4 phút
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-[#302B3D]">4. Nghe chọn chữ Hán</h4>
              <p className="mt-1 text-xs text-[#777184] leading-relaxed">
                Lắng nghe phát âm âm thanh giọng bản ngữ và nhận diện chữ Hán tương ứng chính xác.
              </p>
              {/* Visual Preview */}
              <div className="mt-3.5 flex items-center gap-2 text-xs">
                <span className="rounded-md bg-[#EEE9FC] border border-[#DED7F0] px-2 py-0.5 text-[11px] font-bold text-[#55449E]">🔊 Phát âm chuẩn</span>
                <span className="text-[#777184] text-[11px]">4 phương án</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0ECF6]">
              <button
                onClick={() => setMode('listen')}
                className="btn-editorial-primary w-full text-xs font-bold !min-h-[44px] shadow-sm"
              >
                Bắt đầu luyện nghe →
              </button>
            </div>
          </div>

          {/* 5. Tình huống giao tiếp */}
          <div className="editorial-card rounded-2xl border-2 border-[#D8D1EE] bg-white flex flex-col justify-between p-5 hover:border-[#A99AE8] hover:shadow-md transition-all shadow-sm sm:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <span lang="zh-Hans" className="hanzi flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE9FC] text-xl font-bold text-[#55449E]">
                  话
                </span>
                <span className="rounded-md bg-[#F0ECF6] px-2 py-0.5 text-[10px] font-semibold text-[#777184]">
                  3–5 phút
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-[#302B3D]">5. Tình huống giao tiếp đời sống</h4>
              <p className="mt-1 text-xs text-[#777184] leading-relaxed">
                Mô phỏng đàm thoại thực tế: Đọc câu đối thoại của đối phương và chọn câu phản hồi lịch sự, chuẩn xác trong đời thường.
              </p>
              {/* Visual Preview */}
              <div className="mt-3.5 flex items-center gap-2 text-xs">
                <span className="rounded-md border border-[#D8D1EE] bg-[#FAF9FD] px-2.5 py-1 text-[11px] font-medium text-[#302B3D]">“A: 很高兴认识你！”</span>
                <span className="text-[#A99AE8] font-bold">→</span>
                <span className="rounded-md border border-[#DED7F0] bg-[#EEE9FC] px-2.5 py-1 text-[11px] font-semibold text-[#55449E]">“B: 我也很高兴认识你。”</span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#F0ECF6]">
              <button
                onClick={() => setMode('dialogue')}
                className="btn-editorial-primary w-full text-xs font-bold !min-h-[44px] shadow-sm"
              >
                Bắt đầu đàm thoại giao tiếp →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<div className="editorial-card h-48 flex items-center justify-center text-xs text-[#777184]">Đang tải phòng luyện tập…</div>}>
      <ExercisesContent />
    </Suspense>
  );
}
