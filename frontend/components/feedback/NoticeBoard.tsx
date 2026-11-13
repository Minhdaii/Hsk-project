'use client';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import type { FeedbackBoardData, FeedbackCategory, FeedbackNote } from '@/lib/types';
import StickyNote, { CATEGORY_CONFIG, CATEGORY_LABELS } from './StickyNote';
import FeedbackDraftModal from './FeedbackDraftModal';
import FeedbackAdminModal from './FeedbackAdminModal';
import ChainaStrokeLoading from '@/components/ChainaStrokeLoading';

export default function NoticeBoard() {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState<FeedbackBoardData>({
    totalCount: 0,
    categoryCounts: {},
    items: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc danh mục
  const [activeCategory, setActiveCategory] = useState<string>('all');
  // Chế độ hiển thị: 'board' (Khung giấy canvas) hoặc 'grid' (Lưới danh sách)
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');

  // Modals
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<FeedbackNote | null>(null);
  const [newlyPinnedId, setNewlyPinnedId] = useState<number | null>(null);

  const loadBoard = useCallback(() => {
    setLoading(true);
    api<FeedbackBoardData>('/feedback')
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Không thể tải dữ liệu góp ý. Vui lòng thử lại sau.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Lọc theo danh mục
  const filteredNotes = useMemo(() => {
    if (activeCategory === 'all') return data.items;
    return data.items.filter((item) => item.category === activeCategory);
  }, [data.items, activeCategory]);

  const handleSuccessPinned = (newNote: FeedbackNote) => {
    setNewlyPinnedId(newNote.id);
    setData((prev) => ({
      totalCount: prev.totalCount + 1,
      categoryCounts: {
        ...prev.categoryCounts,
        [newNote.category]: (prev.categoryCounts[newNote.category] || 0) + 1,
      },
      items: [newNote, ...prev.items],
    }));

    setTimeout(() => {
      setNewlyPinnedId(null);
    }, 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Tiêu đề trang tối giản & thanh lịch */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>HÒM THƯ Ý KIẾN & ĐÓNG GÓP</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Khung ghi chú góp ý
            </h1>
            <p className="mt-1 text-sm text-stone-500 max-w-2xl leading-relaxed">
              Chia sẻ ý kiến tính năng, báo lỗi hoặc gửi lời nhắn. Mỗi ghi chú được dán trực tiếp
              lên khung với cơ chế bảo mật kín — chỉ bạn và đội ngũ quản trị mới đọc được nội dung.
            </p>
          </div>

          {/* Nút viết ghi chú chính */}
          <button
            onClick={() => setIsDraftOpen(true)}
            className="btn-primary shrink-0 !px-5 !py-2.5 text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Dán ghi chú mới</span>
          </button>
        </div>
      </div>

      {/* Thanh công cụ: Thống kê + Bộ lọc + Chế độ xem */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-stone-200/90 shadow-sm">
        {/* Số lượng ghi chú */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700 shrink-0">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink">
                {data.totalCount.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-stone-500 font-medium">ghi chú trên khung</span>
            </div>
            <p className="text-[11px] text-stone-400">Nội dung được bảo mật và mã hóa riêng tư</p>
          </div>
        </div>

        {/* Các nút công cụ bên phải */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {isAdmin && (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-brand-ink/30 bg-brand-soft text-brand-ink text-xs font-semibold hover:bg-brand-soft/80 transition"
            >
              Quản trị ({data.totalCount})
            </button>
          )}

          {/* Toggle Chế độ xem: Khung giấy / Danh sách */}
          <div className="inline-flex rounded-xl border border-stone-200 p-1 bg-stone-50">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                viewMode === 'board'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span>Khung dán</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-ink shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bộ lọc theo danh mục (Clean Chips, Zero Emojis) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory('all')}
          className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium transition border ${
            activeCategory === 'all'
              ? 'bg-ink text-white border-ink font-semibold'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Tất cả ({data.totalCount})
        </button>
        {(Object.keys(CATEGORY_CONFIG) as FeedbackCategory[]).map((catKey) => {
          const cfg = CATEGORY_CONFIG[catKey];
          const count = data.categoryCounts[catKey] || 0;
          const active = activeCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium transition border ${
                active
                  ? 'bg-brand-soft text-brand-ink border-brand-ink/40 font-semibold'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cfg.short} ({count})
            </button>
          );
        })}
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 text-center font-medium">
          {error}
        </div>
      )}

      {/* KHUNG DÁN GIẤY KIẾN TRÚC TỐI GIẢN (ARCHITECTURAL FRAME CANVAS) */}
      <div
        className="relative rounded-2xl border border-stone-200/90 bg-[#FAF9F6] shadow-sm overflow-hidden transition-all duration-300"
        style={{
          backgroundImage: 'radial-gradient(#E5E3DC 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Header góc khung: Tên khung tinh tế */}
        <div className="px-5 py-3 border-b border-stone-200/60 bg-white/70 backdrop-blur-xs flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span className="font-semibold text-stone-600 tracking-wide uppercase text-[11px]">
              Không gian lưu trữ ý kiến
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            {filteredNotes.length} ghi chú hiển thị
          </span>
        </div>

        {/* Nội dung khung */}
        {loading ? (
          <div className="flex min-h-[20rem] items-center justify-center py-12">
            <ChainaStrokeLoading mode="INLINE" size="md" message="Đang tải các tờ ghi chú…" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-24 px-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-stone-700 text-sm font-semibold">
              Chưa có ghi chú nào trong mục này
            </p>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Hãy là người đầu tiên dán ghi chú lên khung để chia sẻ suy nghĩ hoặc góp ý tính năng.
            </p>
            <button
              onClick={() => setIsDraftOpen(true)}
              className="btn-primary !px-4 !py-2 text-xs font-semibold shadow-xs"
            >
              + Viết ghi chú ngay
            </button>
          </div>
        ) : viewMode === 'board' ? (
          /* CHẾ ĐỘ KHUNG DÁN TỰ DO - Khung có chiều cao cố định để percentage top tính toán chính xác */
          <div className="relative w-full h-[580px] sm:h-[680px] p-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
            <div className="relative w-full h-full min-w-[680px] sm:min-w-full">
              {filteredNotes.map((note) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  mode="absolute"
                  isHighlighted={newlyPinnedId === note.id}
                  onClick={() => setActiveNote(note)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* CHẾ ĐỘ LƯỚI DANH SÁCH */
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <StickyNote
                key={note.id}
                note={note}
                mode="grid"
                isHighlighted={newlyPinnedId === note.id}
                onClick={() => setActiveNote(note)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cam kết bảo mật chân khung */}
      <div className="text-center text-xs text-stone-500 py-1">
        <p className="font-medium text-[11px] sm:text-xs">
          Nội dung góp ý được lưu trữ an toàn và chỉ hiển thị với người gửi cùng ban quản trị kỹ thuật.
        </p>
      </div>

      {/* Modal Soạn giấy nhớ mới */}
      <FeedbackDraftModal
        isOpen={isDraftOpen}
        onClose={() => setIsDraftOpen(false)}
        onSuccessPinned={handleSuccessPinned}
      />

      {/* Modal Quản trị viên (Admin/Dev) */}
      <FeedbackAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={loadBoard}
      />

      {/* Modal Xem chi tiết ghi chú khi click vào */}
      {activeNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-500">
                Ghi chú #{activeNote.id}
              </span>
              <button
                onClick={() => setActiveNote(null)}
                className="h-7 w-7 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 flex items-center justify-center text-xs transition"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="py-1">
              <StickyNote note={activeNote} mode="grid" disableAnimation />
            </div>

            {activeNote.content ? (
              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 leading-relaxed border border-stone-200/60">
                {activeNote.isMine ? (
                  <span>
                    Đây là ghi chú bạn đã gửi. Chỉ bạn và đội ngũ quản trị mới có thể xem nội dung này.
                  </span>
                ) : (
                  <span>Bạn đang xem nội dung với quyền Quản trị viên.</span>
                )}
              </div>
            ) : (
              <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 leading-relaxed border border-stone-200/60">
                <p className="font-semibold text-stone-800 mb-1">Nội dung được bảo mật:</p>
                <p>
                  Để bảo vệ quyền riêng tư, nội dung của ghi chú này được giữ kín, chỉ người gửi và ban
                  quản trị mới có thể đọc.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveNote(null)}
                className="btn-ghost !px-4 !py-1.5 text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
