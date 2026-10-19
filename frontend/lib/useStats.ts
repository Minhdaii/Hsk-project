'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Stats } from './types';

/**
 * Thống kê học tập của người dùng, cập nhật gần như tức thời:
 * - sự kiện "stats-changed" (có thể kèm số liệu mới để cập nhật ngay, rồi đồng bộ lại với server)
 * - khi quay lại tab / cửa sổ, và mỗi 60 giây (để ngọn lửa tự tắt qua nửa đêm)
 */
export function useStats(enabled: boolean) {
  const [stats, setStats] = useState<Stats | null>(null);

  const load = useCallback(() => {
    if (!enabled) { setStats(null); return; }
    api<Stats>('/study/stats').then(setStats).catch(() => {});
  }, [enabled]);

  useEffect(() => {
    load();
    const onChange = (e: Event) => {
      const patch = (e as CustomEvent<Partial<Stats> | undefined>).detail;
      if (patch) setStats((prev) => (prev ? { ...prev, ...patch } : prev));
      load();
    };
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    window.addEventListener('stats-changed', onChange);
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(load, 60000);
    return () => {
      window.removeEventListener('stats-changed', onChange);
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [load]);

  return { stats, reload: load };
}
