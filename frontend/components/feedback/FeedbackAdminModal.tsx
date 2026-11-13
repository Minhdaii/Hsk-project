'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { AdminFeedbackItem } from '@/lib/types';
import { CATEGORY_CONFIG } from './StickyNote';
import ChainaStrokeLoading from '@/components/ChainaStrokeLoading';

interface FeedbackAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export default function FeedbackAdminModal({
  isOpen,
  onClose,
  onDataChanged,
}: FeedbackAdminModalProps) {
  const [items, setItems] = useState<AdminFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (search.trim()) params.set('search', search.trim());

    api<{ total: number; items: AdminFeedbackItem[] }>(`/feedback/admin?${params.toString()}`)
      .then((res) => {
        setItems(res.items);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (id: number, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    setActionLoading(id);
    try {
      await api(`/feedback/admin/${id}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      loadData();
      onDataChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa ghi chú này khỏi hệ thống không?')) return;
    setActionLoading(id);
    try {
      await api(`/feedback/admin/${id}`, { method: 'DELETE' });
      loadData();
      onDataChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-hidden">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-ink text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Quản trị ý kiến & Góp ý</h2>
            <p className="text-xs text-stone-400">
              Quyền quản trị viên: Xem toàn bộ nội dung góp ý của học viên
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition text-sm"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center gap-3 text-xs">
          <input
            type="text"
            placeholder="Tìm theo nội dung, email, tên người gửi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-brand-ink"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-brand-ink font-medium"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="reviewed">Đã ghi nhận</option>
            <option value="resolved">Đã giải quyết</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-brand-ink font-medium"
          >
            <option value="">Tất cả chủ đề</option>
            <option value="suggestion">Tính năng</option>
            <option value="bug">Báo lỗi</option>
            <option value="content">Nội dung</option>
            <option value="compliment">Lời nhắn</option>
          </select>
          <button onClick={loadData} className="btn-ghost !py-2 !px-3 font-semibold text-xs">
            Làm mới
          </button>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="flex min-h-[14rem] items-center justify-center py-8">
              <ChainaStrokeLoading mode="INLINE" size="sm" message="Đang tải danh sách góp ý…" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500">
              Không tìm thấy ghi chú nào phù hợp bộ lọc.
            </div>
          ) : (
            items.map((item) => {
              const cfg =
                CATEGORY_CONFIG[item.category as keyof typeof CATEGORY_CONFIG] ||
                CATEGORY_CONFIG.suggestion;
              const isWorking = actionLoading === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs hover:border-stone-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold border ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs font-bold text-ink">
                        {item.name || 'Học viên ẩn danh'}
                      </span>
                      {item.user && (
                        <span className="text-[11px] text-stone-500">
                          ({item.user.email} · @{item.user.username})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-400">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          item.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'reviewed'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {item.status === 'resolved'
                          ? 'Đã xong'
                          : item.status === 'reviewed'
                          ? 'Đã xem'
                          : 'Chờ duyệt'}
                      </span>
                    </div>
                  </div>

                  {/* Nội dung đầy đủ */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans">
                    {item.content}
                  </div>

                  {/* Nút thao tác Admin */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'reviewed')}
                        disabled={isWorking || item.status === 'reviewed'}
                        className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium disabled:opacity-40"
                      >
                        Đánh dấu đã xem
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'resolved')}
                        disabled={isWorking || item.status === 'resolved'}
                        className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 disabled:opacity-40"
                      >
                        Xác nhận đã xử lý
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isWorking}
                      className="text-rose-600 hover:text-rose-800 font-medium px-2 py-1 transition"
                    >
                      Xóa ghi chú
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
