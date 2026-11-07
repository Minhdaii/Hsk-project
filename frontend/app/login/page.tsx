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
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [age, setAge] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [learningExperience, setLearningExperience] = useState('');
  const [studyPurpose, setStudyPurpose] = useState('');
  const [onboardingTarget, setOnboardingTarget] = useState('');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState('');

  useEffect(() => { if (!loading && user && !showOnboarding) router.replace('/dashboard'); }, [loading, user, showOnboarding, router]);

  async function submit() {
    if (mode === 'up') {
      if (!fullName.trim() || !username.trim() || !email.trim()) { setMsg('Vui lòng nhập họ tên, username và email.'); return; }
      if (password.length < 8) { setMsg('Mật khẩu cần có ít nhất 8 ký tự.'); return; }
      if (confirm !== password) { setMsg('Mật khẩu xác nhận chưa khớp.'); return; }
      if (age && (!Number.isInteger(Number(age)) || Number(age) < 10 || Number(age) > 100)) { setMsg('Tuổi cần là số nguyên từ 10 đến 100.'); return; }
    } else if (!email.trim() || password.length < 6) {
      setMsg('Vui lòng nhập email/username và mật khẩu.'); return;
    }
    setBusy(true); setMsg('');
    try {
      const res = await api<{ accessToken: string }>(mode === 'in' ? '/auth/login' : '/auth/register', { body: mode === 'in' ? { identifier: email, password } : { email, username, fullName, chineseName, age: age ? Number(age) : undefined, password } });
      setToken(res.accessToken);
      if (mode === 'up') setShowOnboarding(true);
      else router.push('/dashboard');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    }
    setBusy(false);
  }

  async function finishOnboarding(skip = false) {
    setBusy(true); setOnboardingError('');
    try {
      if (!skip) await api('/auth/me', { method: 'PATCH', body: {
        learningExperience: learningExperience || null,
        studyPurpose: studyPurpose || null,
        targetHskLevel: onboardingTarget ? Number(onboardingTarget) : null,
        dailyStudyMinutes: dailyStudyMinutes ? Number(dailyStudyMinutes) : null,
      } });
      router.push('/dashboard');
    } catch (e) {
      setOnboardingError(e instanceof Error ? e.message : 'Không thể lưu thông tin học tập');
    } finally { setBusy(false); }
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
        <div className={`w-full animate-fade-up ${mode === 'up' ? 'max-w-xl space-y-4' : 'max-w-sm space-y-6'}`}>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-brand">← Về trang giới thiệu</Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{mode === 'in' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}</h1>
            <p className="mt-1 text-stone-500">{mode === 'in' ? 'Đăng nhập để tiếp tục chuỗi ngày học của bạn.' : 'Miễn phí và chỉ mất vài giây.'}</p>
          </div>
          <div className={mode === 'up' ? 'space-y-2.5' : 'space-y-3'}>
            {mode === 'up' && <>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block"><span className="mb-1 block text-sm font-semibold text-stone-700">Họ và tên <span className="text-red-500">*</span></span><input autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nguyễn Văn A" className="input" /></label>
                <label className="block"><span className="mb-1 block text-sm font-semibold text-stone-700">Username <span className="text-red-500">*</span></span><input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="van.a" className="input" /></label>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-[1fr_9rem]">
                <label className="block"><span className="mb-1 block text-sm font-semibold text-stone-700">Tên chữ Hán <span className="text-xs font-normal text-stone-400">(không bắt buộc)</span></span><input value={chineseName} onChange={e=>setChineseName(e.target.value)} placeholder="Ví dụ: 安文" className="input" /></label>
                <label className="block"><span className="mb-1 block text-sm font-semibold text-stone-700">Tuổi</span><input type="number" min="10" max="100" value={age} onChange={e=>setAge(e.target.value)} placeholder="Tuỳ chọn" className="input" /></label>
              </div>
            </>}
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">{mode === 'in' ? 'Email hoặc username' : 'Email'}</span>
              <input type={mode === 'in' ? 'text' : 'email'} autoComplete={mode === 'in' ? 'username' : 'email'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={mode === 'in' ? 'email hoặc username' : 'ban@example.com'} className="input" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-700">Mật khẩu</span>
              <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !busy) submit(); }} placeholder={mode === 'up' ? 'Ít nhất 8 ký tự' : 'Ít nhất 6 ký tự'} className="input" />
              <button type="button" className="mt-1 text-xs text-brand-ink underline" onClick={()=>setShowPassword(v=>!v)}>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</button>
            </label>
            {mode === 'up' && <label className="block"><span className="mb-1 block text-sm font-semibold text-stone-700">Xác nhận mật khẩu</span><input type={showPassword?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="input" aria-describedby="password-confirm-hint" />{confirm && <span id="password-confirm-hint" className={`mt-1 block text-xs ${confirm===password?'text-emerald-700':'text-red-600'}`}>{confirm===password?'Mật khẩu đã khớp':'Mật khẩu chưa khớp'}</span>}</label>}
            <button className="btn-primary w-full !py-3 text-base" disabled={busy} onClick={submit}>
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
      {showOnboarding && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm" role="presentation">
        <section role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="my-auto w-full max-w-xl animate-fade-up rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand">HSK LEARNING PROFILE</p><h2 id="onboarding-title" className="mt-2 text-2xl font-extrabold">Bắt đầu từ đâu nhỉ?</h2><p className="mt-1 text-sm text-stone-500">Vài câu hỏi để gợi ý lộ trình phù hợp. Bạn có thể chỉnh sửa sau trong HSK ID.</p></div><span aria-hidden className="hanzi text-4xl text-brand">学</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Bạn đã biết tiếng Trung đến đâu?<select className="input mt-1.5" value={learningExperience} onChange={e=>setLearningExperience(e.target.value)}><option value="">Chọn mức hiện tại</option><option value="new">Mình chưa học</option><option value="pinyin">Biết pinyin và vài từ</option><option value="basic">Đã học cơ bản (HSK 1–2)</option><option value="intermediate">Có nền tảng (HSK 3–4)</option><option value="advanced">Khá vững (HSK 5 trở lên)</option></select></label>
            <label className="block text-sm font-semibold">Bạn muốn đạt mục tiêu nào?<select className="input mt-1.5" value={studyPurpose} onChange={e=>setStudyPurpose(e.target.value)}><option value="">Chọn mục tiêu</option><option value="exam">Thi chứng chỉ HSK</option><option value="conversation">Giao tiếp hằng ngày</option><option value="travel">Du lịch</option><option value="work">Công việc hoặc học tập</option><option value="interest">Yêu thích ngôn ngữ và văn hoá</option></select></label>
            <label className="block text-sm font-semibold">Mục tiêu HSK<select className="input mt-1.5" value={onboardingTarget} onChange={e=>setOnboardingTarget(e.target.value)}><option value="">Chưa xác định</option>{[1,2,3,4,5,6].map(level=><option key={level} value={level}>HSK {level}</option>)}</select></label>
            <label className="block text-sm font-semibold">Thời gian học mỗi ngày<select className="input mt-1.5" value={dailyStudyMinutes} onChange={e=>setDailyStudyMinutes(e.target.value)}><option value="">Chưa chọn</option>{[10,20,30,45,60].map(minutes=><option key={minutes} value={minutes}>{minutes} phút</option>)}</select></label>
          </div>
          {onboardingError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{onboardingError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-editorial-ghost" disabled={busy} onClick={()=>finishOnboarding(true)}>Để sau</button><button type="button" className="btn-primary" disabled={busy} onClick={()=>finishOnboarding()}>{busy ? 'Đang lưu…' : 'Lưu và bắt đầu học'}</button></div>
        </section>
      </div>}
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginInner /></Suspense>;
}
