'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setMsg('');
    try {
      const res = await api<{ accessToken: string }>(mode === 'in' ? '/auth/login' : '/auth/register', { body: { email, password } });
      setToken(res.accessToken);
      router.push('/');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="text-center">
        <span className="hanzi mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-3xl text-white shadow-soft">汉</span>
        <h1 className="mt-3 text-2xl font-bold">{mode === 'in' ? 'Đăng nhập' : 'Tạo tài khoản'}</h1>
      </div>
      <div className="card space-y-3 shadow-soft">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (tối thiểu 6 ký tự)" className="input" />
        <button className="btn-primary w-full" disabled={busy || !email || password.length < 6} onClick={submit}>
          {busy ? 'Đang xử lý…' : mode === 'in' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
        {msg && <p className="text-sm text-brand">{msg}</p>}
      </div>
      <button className="block w-full text-center text-sm text-stone-600 underline" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(''); }}>
        {mode === 'in' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
      </button>
    </div>
  );
}
