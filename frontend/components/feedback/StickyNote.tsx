'use client';
import { useMemo, useState } from 'react';
import type { FeedbackCategory, FeedbackNote } from '@/lib/types';

export const CATEGORY_CONFIG: Record<
  FeedbackCategory,
  { label: string; short: string; badge: string }
> = {
  suggestion: {
    label: 'Góp ý tính năng',
    short: 'Tính năng',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  bug: {
    label: 'Báo lỗi hệ thống',
    short: 'Báo lỗi',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  content: {
    label: 'Đóng góp nội dung',
    short: 'Nội dung',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  compliment: {
    label: 'Lời nhắn gửi',
    short: 'Lời nhắn',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  suggestion: 'Tính năng',
  bug: 'Báo lỗi',
  content: 'Nội dung',
  compliment: 'Lời nhắn',
};

// Alias để tương thích nếu import CATEGORY_META
export const CATEGORY_META = CATEGORY_CONFIG;

export const PAPER_PALETTES: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-[#FAF6EC]', border: 'border-[#EBE4D2]', text: 'text-[#2D2A24]' },
  pink: { bg: 'bg-[#FAF2F2]', border: 'border-[#EEDADB]', text: 'text-[#332224]' },
  blue: { bg: 'bg-[#F0F4F7]', border: 'border-[#D4DFE6]', text: 'text-[#1F2B33]' },
  green: { bg: 'bg-[#F1F5F2]', border: 'border-[#D5E1D8]', text: 'text-[#223126]' },
  purple: { bg: 'bg-[#F4F1F9]', border: 'border-[#E0D8ED]', text: 'text-[#2B2338]' },
  orange: { bg: 'bg-[#F9F3ED]', border: 'border-[#EBDDD0]', text: 'text-[#36271E]' },
};

interface StickyNoteProps {
  note: FeedbackNote;
  onClick?: () => void;
  mode?: 'absolute' | 'grid';
  isHighlighted?: boolean;
  disableAnimation?: boolean; // Tắt animation khi hiển thị bên trong popup/modal chi tiết
}

export default function StickyNote({
  note,
  onClick,
  mode = 'grid',
  isHighlighted = false,
  disableAnimation = false,
}: StickyNoteProps) {
  const catLabel = CATEGORY_LABELS[note.category] || 'Góp ý';
  const paper = PAPER_PALETTES[note.color] || PAPER_PALETTES.yellow;

  // Hướng gió đơn chiều theo hướng quét của chuột ('left' | 'right' | null)
  const [breezeDir, setBreezeDir] = useState<'left' | 'right' | null>(null);

  const dateStr = useMemo(() => {
    try {
      const d = new Date(note.createdAt);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  }, [note.createdAt]);

  const isPositioned = mode === 'absolute';

  // Ánh xạ tọa độ an toàn: đảm bảo thẻ không bao giờ bị cắt viền trên, dưới, trái, phải
  const rawX = typeof note.posX === 'number' && !isNaN(note.posX) ? note.posX : 50;
  const rawY = typeof note.posY === 'number' && !isNaN(note.posY) ? note.posY : 50;
  const safeX = Math.max(16, Math.min(84, rawX));
  const safeY = Math.max(20, Math.min(80, rawY));

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disableAnimation) return;

    // Nhận diện hướng quét của chuột:
    // Chuột quét sang phải -> gió thổi đuôi giấy dạt hẳn sang phải
    // Chuột quét sang trái -> gió thổi đuôi giấy dạt hẳn sang trái
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const isToRight = e.movementX > 0 || mouseX < rect.width / 2;

    setBreezeDir(isToRight ? 'right' : 'left');
  };

  const handleAnimationEnd = () => {
    setBreezeDir(null);
  };

  return (
    <article
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      style={
        isPositioned
          ? {
              left: `${safeX}%`,
              top: `${safeY}%`,
              transform: `translate(-50%, -50%) rotate(${note.rotation}deg)`,
            }
          : {
              transform: `rotate(${note.rotation}deg)`,
            }
      }
      className={`group relative select-none ${
        disableAnimation ? 'cursor-default' : 'cursor-pointer'
      } transition-all duration-300 ${
        isPositioned ? 'absolute w-52 sm:w-56 hover:z-40' : 'w-full min-h-[175px]'
      }`}
    >
      {/* LỚP LÁ GIẤY VẬT LÝ: Cố định mép dán trên (transformOrigin: top center).
          Đuôi giấy chỉ uốn cong bay dạt về ĐÚNG 1 HƯỚNG theo luồng gió chuột rồi hạ êm, KHÔNG lắc qua lại 2 chiều. */}
      <div
        onAnimationEnd={handleAnimationEnd}
        style={{ transformOrigin: 'top center' }}
        className={`relative w-full h-full p-4 border transition-shadow duration-300 ${
          paper.bg
        } ${paper.text} ${paper.border} ${
          isHighlighted
            ? 'ring-2 ring-brand-ink ring-offset-2 scale-105 z-30 shadow-md animate-[paperLanding_0.6s_cubic-bezier(0.16,1,0.3,1)] rounded-[3px]'
            : !disableAnimation && breezeDir === 'right'
            ? 'animate-[paperWindToRight_0.95s_cubic-bezier(0.18,0.9,0.3,1)] z-30 shadow-xl'
            : !disableAnimation && breezeDir === 'left'
            ? 'animate-[paperWindToLeft_0.95s_cubic-bezier(0.18,0.9,0.3,1)] z-30 shadow-xl'
            : 'rounded-[3px] hover:shadow-md'
        }`}
      >
        {/* Ánh sáng & bóng đổ gợn sóng đồng bộ theo hướng gió */}
        {!disableAnimation && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-300 ${
              breezeDir === 'right'
                ? 'animate-[paperShadingRight_0.95s_cubic-bezier(0.18,0.9,0.3,1)]'
                : breezeDir === 'left'
                ? 'animate-[paperShadingLeft_0.95s_cubic-bezier(0.18,0.9,0.3,1)]'
                : 'opacity-0'
            }`}
          />
        )}

        {/* Miếng dán Washi mờ tối giản ở đầu tờ giấy - cố định điểm neo mép trên */}
        <div
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-stone-300/40 backdrop-blur-[1px] border-t border-b border-white/60 shadow-xs rotate-[-1deg] pointer-events-none rounded-[1px] transition-all duration-300 ${
            !disableAnimation && breezeDir ? 'scale-x-105 bg-stone-300/60' : ''
          }`}
        />

        {/* Header giấy: Phân loại & Ngày */}
        <div className="flex items-center justify-between border-b border-current/10 pb-2 text-xs">
          <span className="font-semibold text-[10px] sm:text-[11px] tracking-wide opacity-80 uppercase">
            {catLabel}
          </span>
          <span className="text-[10px] tabular-nums opacity-50">{dateStr}</span>
        </div>

        {/* Thân giấy: Nội dung thực (của chính mình / admin) HOẶC Nội dung bảo mật của người khác */}
        <div className="my-2.5 min-h-[64px] flex flex-col justify-center">
          {note.content ? (
            <div className="space-y-1">
              {note.isMine && (
                <span className="inline-block text-[10px] font-semibold text-brand-ink bg-white/75 px-1.5 py-0.2 rounded border border-brand-ink/15">
                  Của bạn
                </span>
              )}
              <p className="text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap break-words font-sans text-stone-800">
                {note.content}
              </p>
            </div>
          ) : (
            /* Khối nội dung người khác được niêm phong */
            <div className="py-2 text-center space-y-2">
              {/* Các vạch dòng kẻ mô phỏng chữ viết */}
              <div
                className={`w-full space-y-1.5 transition-all duration-300 ${
                  !disableAnimation && breezeDir ? 'opacity-40' : 'opacity-20'
                }`}
              >
                <div
                  className={`h-1.5 rounded-full bg-current w-full transition-transform duration-300 ${
                    !disableAnimation && breezeDir ? 'scale-x-[1.03]' : ''
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full bg-current w-4/5 mx-auto transition-transform duration-300 ${
                    !disableAnimation && breezeDir ? 'scale-x-[1.05]' : ''
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full bg-current w-3/5 mx-auto transition-transform duration-300 ${
                    !disableAnimation && breezeDir ? 'scale-x-[1.07]' : ''
                  }`}
                />
              </div>

              {/* Con dấu niêm phong bảo mật */}
              <div
                className={`inline-flex items-center gap-1.5 text-[10px] font-medium tracking-wide px-2.5 py-0.5 rounded-full border shadow-xs transition-all duration-300 ${
                  !disableAnimation && breezeDir
                    ? 'bg-white border-brand-ink/40 text-brand-ink shadow-sm scale-105'
                    : 'bg-stone-200/50 text-stone-600 border-stone-300/40'
                }`}
              >
                <svg
                  className={`w-3 h-3 transition-transform duration-300 ${
                    !disableAnimation && breezeDir === 'right'
                      ? 'rotate-[-8deg] opacity-100 text-brand-ink'
                      : !disableAnimation && breezeDir === 'left'
                      ? 'rotate-[8deg] opacity-100 text-brand-ink'
                      : 'opacity-60'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Nội dung bảo mật</span>
              </div>

              {/* Gợi ý tương tác khi ở ngoài khung dán */}
              {!disableAnimation && (
                <p
                  className={`text-[9px] text-stone-400 font-medium tracking-wide transition-all duration-300 transform -mt-0.5 ${
                    breezeDir
                      ? 'translate-y-0 opacity-100 text-brand-ink'
                      : 'translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                  }`}
                >
                  Nhấn để xem chi tiết
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer giấy: Tác giả & Trạng thái xử lý */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-current/10 text-[11px]">
          <span className="truncate max-w-[130px] opacity-60 text-[10px] sm:text-[11px] font-medium">
            {note.author}
          </span>
          {note.status === 'resolved' && (
            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Đã xử lý
            </span>
          )}
        </div>

        {/* Góc gấp nhẹ trang giấy tự nhiên (Dog-ear fold) */}
        <div
          className={`absolute bottom-0 right-0 bg-gradient-to-tl from-black/18 via-black/6 to-transparent pointer-events-none rounded-br-[inherit] transition-all duration-300 ${
            !disableAnimation && breezeDir === 'right' ? 'w-5 h-5 opacity-90' : 'w-3.5 h-3.5'
          }`}
        />
      </div>
    </article>
  );
}
