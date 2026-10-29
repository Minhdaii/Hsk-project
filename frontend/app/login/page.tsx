'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import Icon from '@/components/Icon';

const PERKS = ['Lộ trình ôn tập thông minh theo SM-2', 'Chuỗi ngày học và bảng xếp hạng XP', 'Ngữ pháp, bài tập và sổ tay từ vựng'];

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading } = useUser();
  const [mode, setMode] = useState<'in' | 'up'>(sp.get('mode') === 'up' ? 'up' : 'in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [loading, user, router]);

  async function submit() {
    setBusy(true); setMsg('');
    try {
      const res = await api<{ accessToken: string }>(mode === 'in' ? '/auth/login' : '/auth/register', { body: { email, password } });
      setToken(res.accessToken);
      router.push('/dashboard');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Cột thương hiệu */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-[#a8301f] to-[#6d1b13] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <span aria-hidden className="hanzi pointer-events-none absolute -bottom-16 -right-6 animate-float select-none text-[22rem] leading-none text-white/10">学</span>
        <Link href="/" className="relative flex items-center gap-3 font-bold">
          <span className="hanzi flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-2xl backdrop-blur">汉</span>
          <span className="text-lg">学汉语 · HSK 1-3</span>
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-balance text-4xl font-extrabold leading-tight">Mỗi ngày một chút, tiếng Trung sẽ tiến bộ thấy rõ</h2>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/90"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20"><Icon name="check" className="h-4 w-4" /></span>{p}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">Miễn phí · Chuẩn HSK 3.0</p>
      </div>

      {/* Cột biểu mẫu */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-up space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-brand">← Về trang giới thiệu</Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{mode === 'in' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</h1>
            <p className="mt-1 text-stone-500">{mode === 'in' ? 'Đăng nhập để tiếp tục chuỗi ngày học của bạn.' : 'Miễn phí và chỉ mất vài giây.'}</p>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">Email</span>
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@example.com" className="input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">Mật khẩu</span>
              <input type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && email && password.length >= 6 && !busy) submit(); }} placeholder="Tối thiểu 6 ký tự" className="input" />
            </label>
            <button className="btn-primary w-full !py-3 text-base" disabled={busy || !email || password.length < 6} onClick={submit}>
              {busy ? 'Đang xử lý…' : mode === 'in' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
            {msg && <p className="animate-shake rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
          </div>
          <p className="text-center text-sm text-stone-600">
            {mode === 'in' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button className="font-bold text-brand underline-offset-4 hover:underline" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(''); }}>
              {mode === 'in' ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginInner /></Suspense>;
}
