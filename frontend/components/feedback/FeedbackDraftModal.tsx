'use client';
import { useState, useId } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import type { FeedbackCategory, FeedbackNote } from '@/lib/types';
import { CATEGORY_LABELS, PAPER_PALETTES } from './StickyNote';
import { playPinSound } from './PinningAudio';

interface FeedbackDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPinned: (newNote: FeedbackNote) => void;
}

const PALETTE_OPTIONS = [
  { id: 'yellow', name: 'Ngà' },
  { id: 'blue', name: 'Lam' },
  { id: 'green', name: 'Lục' },
  { id: 'pink', name: 'Hồng' },
  { id: 'purple', name: 'Tím' },
  { id: 'orange', name: 'Cam' },
] as const;

export default function FeedbackDraftModal({
  isOpen,
  onClose,
  onSuccessPinned,
}: FeedbackDraftModalProps) {
  const { user } = useUser();
  const formId = useId();

  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [color, setColor] = useState<string>('yellow');
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hiệu ứng dán giấy vật lý
  const [isPasting, setIsPasting] = useState(false);

  if (!isOpen) return null;

  const currentPaper = PAPER_PALETTES[color] || PAPER_PALETTES.yellow;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 5) {
      setError('Vui lòng nhập nội dung tối thiểu 5 ký tự.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api<{
        success: boolean;
        id: number;
        category: FeedbackCategory;
        color: string;
        rotation: number;
        posX: number;
        posY: number;
        pinType: string;
        createdAt: string;
        message: string;
      }>('/feedback', {
        method: 'POST',
        body: {
          category,
          color,
          name: authorName.trim() || undefined,
          content: content.trim(),
        },
      });

      // Kích hoạt animation giấy bóc và dán
      setIsPasting(true);
      playPinSound();

      const newNote: FeedbackNote = {
        id: res.id,
        category: res.category,
        color: res.color,
        rotation: res.rotation,
        posX: res.posX,
        posY: res.posY,
        pinType: 'tape',
        status: 'pending',
        createdAt: res.createdAt,
        isMine: true,
        author: authorName.trim() || user?.fullName || user?.username || 'Bạn',
        content: content.trim(),
      };

      // Đợi animation hoàn thành để dán dính vào khung
      setTimeout(() => {
        setIsPasting(false);
        setLoading(false);
        setContent('');
        onSuccessPinned(newNote);
        onClose();
      }, 750);
    } catch (err: unknown) {
      setLoading(false);
      setIsPasting(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể gửi ghi chú. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      {/* Hiệu ứng giấy bóc ra khỏi bàn bay vào khung */}
      {isPasting && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
          <div className="animate-[paperPeelAndStick_0.75s_cubic-bezier(0.2,0.8,0.25,1)_forwards]">
            <div
              className={`w-60 p-4 rounded-[3px] border shadow-2xl ${currentPaper.bg} ${currentPaper.border} ${currentPaper.text}`}
            >
              <div className="w-12 h-3.5 mx-auto -mt-5 bg-stone-300/60 border-t border-b border-white/60 shadow-xs mb-2 rounded-[1px]" />
              <div className="flex justify-between items-center text-[10px] font-bold uppercase opacity-75 border-b border-current/10 pb-1.5 mb-2">
                <span>{CATEGORY_LABELS[category]}</span>
                <span>Vừa dán</span>
              </div>
              <p className="text-xs leading-relaxed line-clamp-3 text-stone-800">{content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tờ giấy soạn thảo chính */}
      <div
        className={`relative w-full max-w-lg rounded-2xl bg-white border border-stone-200/90 shadow-2xl overflow-hidden transition-all duration-300 ${
          isPasting ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">Viết ghi chú mới</h2>
            <p className="text-xs text-stone-500">Ghi chú sẽ được dán vào khung lưu trữ ý kiến</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center text-sm transition"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Phân loại & Màu giấy */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Chủ đề ghi chú
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((catKey) => {
                  const active = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition text-center ${
                        active
                          ? 'border-brand-ink bg-brand-soft text-brand-ink font-semibold'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {CATEGORY_LABELS[catKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                Chất liệu màu giấy
              </label>
              <div className="flex items-center gap-2">
                {PALETTE_OPTIONS.map((pal) => {
                  const pTheme = PAPER_PALETTES[pal.id];
                  const active = color === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setColor(pal.id)}
                      className={`h-8 px-3 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${pTheme.bg} ${pTheme.border} ${pTheme.text} ${
                        active ? 'ring-2 ring-brand-ink ring-offset-1 font-bold' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      {pal.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Người gửi */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-stone-600">
                Tên hiển thị (Tùy chọn)
              </label>
              <span className="text-[11px] text-stone-400">Để trống nếu muốn ẩn danh</span>
            </div>
            <input
              id={`${formId}-name`}
              type="text"
              maxLength={40}
              placeholder={user ? user.fullName || user.username : 'Học viên ẩn danh'}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs text-ink outline-none focus:border-brand-ink focus:bg-white transition"
            />
          </div>

          {/* Vùng viết nội dung trên giấy */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={`${formId}-content`} className="text-xs font-semibold text-stone-600">
                Nội dung ghi chú
              </label>
              <span className="text-[11px] text-stone-400 tabular-nums">
                {content.length} / 1500 ký tự
              </span>
            </div>
            <textarea
              id={`${formId}-content`}
              rows={4}
              required
              maxLength={1500}
              placeholder="Nhập nội dung ý kiến, báo lỗi hoặc chia sẻ của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full rounded-xl border p-3.5 text-xs sm:text-sm leading-relaxed outline-none transition focus:ring-1 focus:ring-brand-ink ${currentPaper.bg} ${currentPaper.border} ${currentPaper.text}`}
            />
          </div>

          {/* Ghi chú bảo mật ngắn gọn, tối giản */}
          <p className="text-[11px] text-stone-500 leading-normal">
            Nội dung được bảo mật riêng tư. Học viên khác chỉ thấy tờ giấy nhớ trên khung nhưng không
            thể đọc văn bản của bạn.
          </p>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || content.trim().length < 5}
              className="btn-primary !px-5 !py-2 text-xs font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Đang dán...' : 'Dán vào khung'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
