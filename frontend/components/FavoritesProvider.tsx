'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useUser } from '@/lib/useUser';

type Ctx = { has: (id: number) => boolean; toggle: (id: number) => Promise<void> };
const FavCtx = createContext<Ctx>({ has: () => false, toggle: async () => {} });
export const useFavorites = () => useContext(FavCtx);

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    api<{ ids: number[] }>('/favorites/ids').then((r) => setIds(new Set(r.ids))).catch(() => {});
  }, [user]);

  const toggle = useCallback(async (id: number) => {
    if (!user) { router.push('/login'); return; }
    const had = ids.has(id);
    const flip = (on: boolean) => setIds((prev) => { const n = new Set(prev); if (on) n.add(id); else n.delete(id); return n; });
    flip(!had);
    try { await api(`/favorites/${id}`, { method: had ? 'DELETE' : 'POST' }); } catch { flip(had); }
  }, [user, ids, router]);

  return <FavCtx.Provider value={{ has: (id) => ids.has(id), toggle }}>{children}</FavCtx.Provider>;
}
