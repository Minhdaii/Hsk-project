'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, clearToken, getToken, ApiError } from './api';
import type { AuthUser } from './types';

export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      setUser(await api<AuthUser>('/auth/me'));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) clearToken();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('auth-changed', load);
    return () => window.removeEventListener('auth-changed', load);
  }, [load]);

  return { user, loading };
}
