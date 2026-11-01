'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import { STAGE_LESSONS, StageQuestion } from '../stageData';
import { speak } from '@/lib/speak';
import Confetti from '@/components/Confetti';
import Anim from '@/components/motion/Anim';

export default function StageLessonPage() {
  const params = useParams<{ stageId: string }>();
  const router = useRouter();
  const stageId = parseInt(params.stageId, 10);
  const stage = STAGE_LESSONS[stageId];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Dành riêng cho câu hỏi dạng "order" (ghép từ thành câu)
  const [orderBank, setOrderBank] = useState<string[]>([]);
  const [orderPicked, setOrderPicked] = useState<string[]>([]);

  const question: StageQuestion | undefined = stage?.questions[currentIdx];

  // Khởi tạo state khi chuyển câu hỏi
  useEffect(() => {
    if (!question) return;
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);

    if (question.type === 'order' && question.tokens) {
      // Xáo trộn nhẹ hoặc giữ nguyên thứ tự tokens mẫu
      const shuffled = [...question.tokens].sort(() => Math.random() - 0.5);
      setOrderBank(shuffled);
      setOrderPicked([]);
    }
  }, [currentIdx, question]);

  if (!stage) {
    return (
      <div className="editorial-card mx-auto max-w-lg p-8 text-center space-y-4">
        <span className="seal h-12 w-12 text-2xl mx-auto flex items-center justify-center">程</span>
        <h1 className="text-lg font-bold text-ink">Không tìm thấy chặng học này</h1>
        <p className="text-xs text-stone-600">Lộ trình học tiếng Trung hiện có từ Chặng 1 đến Chặng 9.</p>
        <Link href="/path" className="btn-back mx-auto">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Về lộ trình học</span>
        </Link>
      </div>
    );
  }

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const ok = opt === question.answer;
    setIsCorrect(ok);
    if (ok) {
      setScore((s) => s + 1);
      if (question.audio || question.promptZh) {
        speak(question.audio || question.promptZh || '');
      }
    }
  };

  const handlePickOrderToken = (token: string, bankIdx: number) => {
    if (isAnswered) return;
    const newBank = [...orderBank];
    newBank.splice(bankIdx, 1);
    setOrderBank(newBank);
    setOrderPicked((prev) => [...prev, token]);
  };

  const handleRemoveOrderToken = (token: string, pickedIdx: number) => {
    if (isAnswered) return;
    const newPicked = [...orderPicked];
    newPicked.splice(pickedIdx, 1);
    setOrderPicked(newPicked);
    setOrderBank((prev) => [...prev, token]);
  };

  const handleCheckOrder = () => {
    if (isAnswered || orderPicked.length === 0) return;
    const assembled = orderPicked.join('');
    const target = (question.tokens || []).join('');
    const ok = assembled === target || assembled === question.answer;

    setIsAnswered(true);
    setIsCorrect(ok);
    if (ok) {
      setScore((s) => s + 1);
      speak(assembled);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < stage.questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Lưu tiến độ hoàn thành vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`hsk_stage_${stage.id}_done`, 'true');
      }
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Nút quay lại và thanh tiêu đề */}
      <div className="flex items-center justify-between">
        <Link href="/path" className="btn-back">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Bản đồ Lộ trình</span>
        </Link>
        <span className="editorial-badge-stone font-semibold">
          Chặng {stage.id}/9 · HSK {stage.level}
        </span>
      </div>

      {/* Màn hình hoàn thành chặng */}
      {isFinished ? (
        <div className="editorial-card p-6 sm:p-8 text-center space-y-6 animate-fade-up">
          <Confetti count={40} />

          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-brand text-ink shadow-card">
            <span lang="zh-Hans" className="hanzi text-4xl font-bold">
              {stage.hanzi}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="editorial-badge">HOÀN THÀNH MỤC TIÊU</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink">
              Chúc mừng bạn đã chinh phục Chặng {stage.id}!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              {stage.title} — {stage.focus}
            </p>
          </div>

          {/* Bảng điểm tổng kết */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="rounded-xl border border-line bg-stone-50 p-3">
              <span className="block text-[11px] text-stone-600">Đúng</span>
              <span className="text-lg font-bold text-emerald-700">
                {score}/{stage.questions.length}
              </span>
            </div>
            <div className="rounded-xl border border-line bg-stone-50 p-3">
              <span className="block text-[11px] text-stone-600">Chính xác</span>
              <span className="text-lg font-bold text-brand-ink">
                {Math.round((score / stage.questions.length) * 100)}%
              </span>
            </div>
            <div className="rounded-xl border border-line bg-stone-50 p-3">
              <span className="block text-[11px] text-stone-600">Điểm kinh nghiệm</span>
              <span className="text-lg font-bold text-amber-700">+50 XP</span>
            </div>
          </div>

          {/* Các nút điều hướng */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {stage.id < 9 ? (
              <Link
                href={`/path/${stage.id + 1}`}
                className="btn-editorial-primary w-full sm:w-auto !min-h-[44px] !px-6 text-xs font-bold"
              >
                <span>Học tiếp Chặng {stage.id + 1}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/path"
                className="btn-editorial-primary w-full sm:w-auto !min-h-[44px] !px-6 text-xs font-bold"
              >
                <span>Xem lại bản đồ Lộ trình</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            <button
              onClick={handleRetry}
              className="btn-editorial-ghost w-full sm:w-auto !min-h-[44px] !px-5 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Ôn tập lại chặng này</span>
            </button>
          </div>
        </div>
      ) : (
        /* Giao diện làm bài tập tương tác của chặng */
        <div className="space-y-5">
          {/* Header tiến độ từng câu */}
          <div className="editorial-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  lang="zh-Hans"
                  className="hanzi flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-bold text-ink"
                >
                  {stage.hanzi}
                </span>
                <span className="font-bold text-ink truncate max-w-[200px] sm:max-w-none">
                  {stage.title}
                </span>
              </div>
              <span className="text-stone-600 font-semibold tabular-nums">
                Câu {currentIdx + 1} / {stage.questions.length}
              </span>
            </div>

            {/* Thanh tiến độ */}
            <div className="flex gap-1.5">
              {stage.questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < currentIdx
                      ? 'bg-brand-ink'
                      : i === currentIdx
                      ? 'bg-brand ring-2 ring-brand-soft'
                      : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thẻ câu hỏi chính */}
          <div className="editorial-card p-5 sm:p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="editorial-badge">
                  {question.type === 'order'
                    ? 'SẮP XẾP CÂU'
                    : question.type === 'cloze'
                    ? 'ĐIỀN TỪ VÀO CHỖ TRỐNG'
                    : 'CÂU HỎI TRẮC NGHIỆM'}
                </span>
                {question.pinyin && (
                  <span className="pinyin text-xs text-brand-ink font-semibold">
                    [{question.pinyin}]
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-ink leading-snug">
                {question.prompt}
              </h2>

              {/* Chữ Hán tiêu điểm nếu có */}
              {question.promptZh && (
                <div className="my-3 flex items-center justify-between rounded-xl border border-line bg-stone-50/70 p-4">
                  <div className="space-y-0.5">
                    <span lang="zh-Hans" className="hanzi text-3xl sm:text-4xl font-bold text-ink">
                      {question.promptZh}
                    </span>
                    {question.pinyin && (
                      <p className="pinyin text-xs text-stone-600">{question.pinyin}</p>
                    )}
                  </div>
                  <button
                    onClick={() => speak(question.audio || question.promptZh || '')}
                    className="btn-editorial-ghost !min-h-[38px] !px-3 text-xs"
                    aria-label="Phát âm"
                  >
                    <Volume2 className="h-4 w-4 text-brand-ink" />
                    <span>Nghe</span>
                  </button>
                </div>
              )}
            </div>

            {/* DẠNG 1 & 2: CHOICE / CLOZE OPTIONS */}
            {question.type !== 'order' && question.options && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {question.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isRight = opt === question.answer;

                  let style =
                    'border-line bg-white hover:border-stone-400 hover:bg-stone-50 text-ink';

                  if (isAnswered) {
                    if (isRight) {
                      style =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold animate-pop shadow-xs';
                    } else if (isSelected) {
                      style =
                        'border-red-400 bg-red-50 text-red-950 font-bold animate-shake';
                    } else {
                      style = 'border-line bg-stone-50/50 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`flex min-h-[50px] items-center justify-between rounded-xl border px-4 py-3 text-left text-xs sm:text-sm font-medium transition-all ${style}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isRight && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {isAnswered && isSelected && !isRight && (
                        <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* DẠNG 3: ORDER (Ghép thẻ từ vào câu) */}
            {question.type === 'order' && (
              <div className="space-y-4">
                {/* Khu vực câu đang ghép */}
                <div className="min-h-[64px] rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-3 flex flex-wrap items-center gap-2">
                  {orderPicked.length === 0 ? (
                    <span className="text-xs text-stone-400 select-none">
                      Chạm vào các từ bên dưới theo thứ tự đúng để tạo thành câu hoàn chỉnh…
                    </span>
                  ) : (
                    orderPicked.map((tok, idx) => (
                      <button
                        key={`${tok}-${idx}`}
                        disabled={isAnswered}
                        onClick={() => handleRemoveOrderToken(tok, idx)}
                        className="hanzi rounded-lg border border-brand/40 bg-white px-3 py-1.5 text-base font-bold text-ink shadow-xs transition-all hover:bg-red-50 hover:border-red-300"
                        title="Chạm để bỏ từ này ra"
                      >
                        {tok}
                      </button>
                    ))
                  )}
                </div>

                {/* Kho từ để chọn */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {orderBank.map((tok, idx) => (
                    <button
                      key={`${tok}-${idx}`}
                      disabled={isAnswered}
                      onClick={() => handlePickOrderToken(tok, idx)}
                      className="hanzi rounded-xl border border-line bg-white px-4 py-2.5 text-base font-bold text-ink shadow-xs transition-all hover:border-stone-400 hover:bg-stone-50 active:scale-95"
                    >
                      {tok}
                    </button>
                  ))}
                </div>

                {/* Nút kiểm tra cho dạng Order */}
                {!isAnswered && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        const resetBank = [...orderBank, ...orderPicked];
                        setOrderBank(resetBank);
                        setOrderPicked([]);
                      }}
                      disabled={orderPicked.length === 0}
                      className="btn-editorial-ghost !min-h-[40px] !px-4 text-xs font-semibold"
                    >
                      Xếp lại
                    </button>
                    <button
                      onClick={handleCheckOrder}
                      disabled={orderPicked.length === 0}
                      className="btn-editorial-primary !min-h-[40px] !px-5 text-xs font-bold"
                    >
                      Kiểm tra đáp án
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Thẻ giải thích chi tiết khi đã trả lời */}
            {isAnswered && (
              <div
                className={`rounded-xl border p-4 text-xs space-y-2 animate-fade-up ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                    : 'border-red-200 bg-red-50/70 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Chính xác tuyệt đối!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Đáp án đúng: {question.answer}</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed opacity-90">{question.explanation}</p>
              </div>
            )}

            {/* Nút tiếp theo sau khi trả lời */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="btn-editorial-primary w-full animate-fade-up !min-h-[44px] !py-3 text-xs font-bold"
              >
                <span>
                  {currentIdx + 1 < stage.questions.length ? 'Câu tiếp theo' : 'Xem kết quả chặng'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
