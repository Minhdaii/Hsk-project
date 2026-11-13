'use client';

import Link from 'next/link';
import Script from 'next/script';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, setToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import ChainaStrokeLoading from '@/components/ChainaStrokeLoading';
import Chaina25DMascot from '@/components/Chaina25DMascot';

declare global {
  interface Window {
    google?: any;
  }
}

// Logo Chaina HSK SVG chuẩn nhận diện thương hiệu
function ChainaBrandLogo({ className = 'w-36 sm:w-40 h-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 850 240" className={`${className} overflow-visible text-[#26252D]`} aria-label="Chaina HSK">
      <path d="M 142 125 C 122 95, 62 96, 56 164 C 50 226, 114 236, 138 197" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M 177 104 L 172 224 M 174 172 C 184 146, 232 146, 234 182 L 234 224" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M 318 175 C 312 148, 262 148, 260 189 C 258 228, 312 228, 319 194 M 320 162 C 318 188, 319 216, 336 223" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M 369 160 L 364 224" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <circle cx="372" cy="130" r="12.5" fill="#D84A34" />
      <path d="M 408 159 L 405 224 M 407 175 C 417 147, 469 147, 471 182 L 471 224" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M 556 175 C 550 148, 500 148, 498 189 C 496 228, 550 228, 557 194 M 558 162 C 556 188, 557 216, 574 223" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M 571 153 C 579 155, 584 160, 586 167" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      <path d="M 632 134 L 632 222 M 632 178 L 680 178 M 680 134 L 680 222" fill="none" stroke="#DA88A0" strokeWidth="16" strokeLinecap="round" />
      <path d="M 754 148 C 742 130, 706 132, 706 155 C 706 182, 758 174, 758 202 C 758 224, 718 228, 704 209" fill="none" stroke="#DA88A0" strokeWidth="16" strokeLinecap="round" />
      <path d="M 784 134 L 784 222 M 834 136 L 786 180 L 838 222" fill="none" stroke="#DA88A0" strokeWidth="16" strokeLinecap="round" />
    </svg>
  );
}

// Biểu tượng Google chuẩn 4 màu chính thức
function GoogleIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" />
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
      <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5L1.6 17c1.9 3.9 5.8 7 10.4 7z" />
    </svg>
  );
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, loading } = useUser();

  // Tab mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    sp.get('mode') === 'up' ? 'register' : 'login',
  );

  // Tab Đăng nhập Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Tab Đăng ký Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regTerms, setRegTerms] = useState(false);

  // Field validation errors
  const [errors, setErrors] = useState<{
    loginIdentifier?: string;
    loginPassword?: string;
    regUsername?: string;
    regEmail?: string;
    regPassword?: string;
    regTerms?: string;
  }>({});

  // Banner message
  const [msg, setMsg] = useState<{ text: string; type: 'error' | 'info' | 'success' } | null>(null);

  // Execution & Loading State
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang đăng nhập…');

  // Modals
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // New User Onboarding Modal
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  const [learningExperience, setLearningExperience] = useState('');
  const [studyPurpose, setStudyPurpose] = useState('');
  const [onboardingTarget, setOnboardingTarget] = useState('');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState('');

  const tokenClientRef = useRef<any>(null);
  const rawClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const googleClientId = rawClientId ? rawClientId.replace(/^["']|["']$/g, '').trim() : '';

  // Nếu người dùng đã đăng nhập và không ở onboarding, chuyển tiếp
  useEffect(() => {
    if (!loading && user && !showOnboarding) {
      const redirectUrl = sp.get('redirect') || '/dashboard';
      router.replace(redirectUrl);
    }
  }, [loading, user, showOnboarding, router, sp]);

  // Khởi tạo Google OAuth2 Token Client
  const initGoogle = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2 || !googleClientId) return;
    try {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setMsg({ text: 'Đăng nhập Google đã bị hủy.', type: 'info' });
            setGoogleBusy(false);
            return;
          }
          if (!tokenResponse?.access_token) {
            setMsg({ text: 'Không nhận được mã xác thực từ Google.', type: 'error' });
            setGoogleBusy(false);
            return;
          }
          setLoadingText('Đang xác thực với Google…');
          setGoogleBusy(true);
          setMsg(null);
          try {
            const res = await api<{ accessToken: string; user: any; isNew: boolean }>('/auth/google', {
              body: { accessToken: tokenResponse.access_token },
            });
            setToken(res.accessToken);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('auth-changed'));
            }
            if (res.isNew) {
              setShowOnboarding(true);
            } else {
              const redirectUrl = sp.get('redirect') || '/dashboard';
              router.push(redirectUrl);
            }
          } catch (e) {
            setMsg({
              text: e instanceof Error ? e.message : 'Đăng nhập Google thất bại. Vui lòng thử lại.',
              type: 'error',
            });
          } finally {
            setGoogleBusy(false);
          }
        },
      });
    } catch (err) {
      console.error('Lỗi khởi tạo Google OAuth2:', err);
    }
  }, [googleClientId, router, sp]);

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      initGoogle();
    }
  }, [initGoogle]);

  // Kích hoạt Google Sign In qua Popup OAuth2 chính quy (nút chuẩn, không bị biến dạng 2 dòng)
  const handleGoogleSignIn = () => {
    if (!googleClientId) {
      setMsg({
        text: 'Hệ thống chưa thiết lập Google Client ID trong biến môi trường.',
        type: 'info',
      });
      return;
    }
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else if (window.google?.accounts?.oauth2) {
      initGoogle();
      tokenClientRef.current?.requestAccessToken({ prompt: 'select_account' });
    } else {
      setMsg({
        text: 'Thư viện Google đang tải, bạn vui lòng nhấn lại sau giây lát.',
        type: 'info',
      });
    }
  };

  // Submit Login Form
  async function handleLoginSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setMsg(null);
    const newErrors: typeof errors = {};

    if (!loginIdentifier.trim()) {
      newErrors.loginIdentifier = 'Vui lòng nhập Email hoặc Username.';
    }
    if (!loginPassword) {
      newErrors.loginPassword = 'Mật khẩu không được để trống.';
    } else if (loginPassword.length < 6) {
      newErrors.loginPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoadingText('Đang đăng nhập vào Chaina…');
    setBusy(true);

    try {
      const res = await api<{ accessToken: string }>('/auth/login', {
        body: {
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        },
      });
      setToken(res.accessToken);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      const redirectUrl = sp.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : 'Tài khoản hoặc mật khẩu không chính xác';
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  // Submit Register Form
  async function handleRegisterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setMsg(null);
    const newErrors: typeof errors = {};

    const u = regUsername.trim().toLowerCase();
    if (!u) {
      newErrors.regUsername = 'Vui lòng chọn một Username hợp lệ (tối thiểu 3 ký tự).';
    } else if (u.length < 3 || u.length > 32) {
      newErrors.regUsername = 'Username phải từ 3 đến 32 ký tự.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(u)) {
      newErrors.regUsername = 'Username chỉ chứa chữ cái, số, dấu gạch dưới hoặc chấm.';
    }

    const em = regEmail.trim().toLowerCase();
    if (!em) {
      newErrors.regEmail = 'Vui lòng nhập địa chỉ Email hợp lệ.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      newErrors.regEmail = 'Định dạng email chưa đúng (ví dụ: hocvien@chaina.vn).';
    }

    if (!regPassword) {
      newErrors.regPassword = 'Mật khẩu cần có tối thiểu 8 ký tự.';
    } else if (regPassword.length < 8) {
      newErrors.regPassword = 'Mật khẩu cần có tối thiểu 8 ký tự.';
    }

    if (!regTerms) {
      newErrors.regTerms = 'Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoadingText('Đang tạo tài khoản Chaina…');
    setBusy(true);

    try {
      const res = await api<{ accessToken: string }>('/auth/register', {
        body: {
          username: u,
          email: em,
          fullName: u,
          password: regPassword,
        },
      });
      setToken(res.accessToken);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'));
      }
      setShowOnboarding(true);
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : 'Đăng ký tài khoản thất bại';
      setMsg({ text: errorMsg, type: 'error' });
      if (errorMsg.includes('Email này đã được')) {
        setErrors((prev) => ({ ...prev, regEmail: errorMsg }));
      } else if (errorMsg.includes('Username này đã được')) {
        setErrors((prev) => ({ ...prev, regUsername: errorMsg }));
      }
    } finally {
      setBusy(false);
    }
  }

  // Finish Onboarding
  async function finishOnboarding(skip = false) {
    setLoadingText('Đang lưu thông tin học tập…');
    setBusy(true);
    setOnboardingError('');
    try {
      if (!skip) {
        await api('/auth/me', {
          method: 'PATCH',
          body: {
            learningExperience: learningExperience || null,
            studyPurpose: studyPurpose || null,
            targetHskLevel: onboardingTarget ? Number(onboardingTarget) : null,
            dailyStudyMinutes: dailyStudyMinutes ? Number(dailyStudyMinutes) : null,
          },
        });
      }
      router.push('/dashboard');
    } catch (e) {
      setOnboardingError(e instanceof Error ? e.message : 'Không thể lưu thông tin học tập');
    } finally {
      setBusy(false);
    }
  }

  const isScreenLoading = busy || googleBusy;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />

      {/* =========================================================================
           CENTERED LOADING OVERLAY WITH BLURRED BACKDROP
           ========================================================================= */}
      {isScreenLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm transition-opacity duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Đang xử lý xác thực"
        >
          <div className="mx-4 flex w-full max-w-xs flex-col items-center rounded-2xl border border-slate-200/90 bg-white p-7 text-center shadow-2xl">
            <ChainaStrokeLoading mode="INLINE" size="md" background="transparent" />
            <p className="mt-4 text-sm font-semibold text-slate-800">{loadingText}</p>
            <p className="mt-1 text-xs text-slate-500">Vui lòng chờ trong giây lát…</p>
          </div>
        </div>
      )}

      {/* =========================================================================
           MAIN AUTHENTICATION CONTAINER (SPLIT LAYOUT 60/40)
           ========================================================================= */}
      <div className="relative min-h-screen flex flex-col justify-between bg-[#0284C7] bg-[linear-gradient(135deg,#0369A1_0%,#0284C7_35%,#38BDF8_80%,#7DD3FC_100%)] text-[#26252D] overflow-hidden">
        {/* Lớp ánh sáng xanh sáng trang nhã (Ambient Bright Sky Glows) */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] bg-white/25 rounded-full blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-32 w-[520px] h-[520px] bg-sky-200/35 rounded-full blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-400/20 rounded-full blur-[120px]" />
        
        {/* Main Content Area */}
        <main className="relative z-10 max-w-[1060px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex items-center justify-center">
          <div className="w-full max-w-[1060px] bg-white rounded-[24px] shadow-[0_28px_70px_rgba(3,105,161,0.28)] overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-white/80">

            {/* ===================================================================
                 LEFT PANEL (~60% ON DESKTOP -> 7/12 COLS): FORM & GOOGLE SIGN-IN
                 =================================================================== */}
            <section className="md:col-span-7 p-6 sm:p-9 md:p-11 flex flex-col justify-between bg-white">
              <div>
                
                {/* Top Back Link & Motto Badge */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#D84A34] transition-colors focus:outline-none"
                  >
                    <span aria-hidden="true">←</span> Quay lại trang chủ
                  </Link>

                  <span className="font-serif-sc text-xs tracking-widest text-[#B85D76] font-medium px-2.5 py-0.5 rounded-full bg-[#EBF4FA]">
                    「学无止境」
                  </span>
                </div>

                {/* Brand Logo & Greeting Header */}
                <div className="mb-5">
                  <Link href="/" className="inline-flex items-center gap-3 mb-2 focus:outline-none" aria-label="Trang chủ Chaina HSK">
                    <ChainaBrandLogo />
                  </Link>

                  <p className="text-xs sm:text-sm font-medium text-slate-500">
                    {activeTab === 'login'
                      ? 'Chào mừng bạn quay trở lại! Tiếp tục hành trình chinh phục HSK cùng Chaina.'
                      : 'Tạo tài khoản học tập, lưu lại tiến trình từ vựng và luyện thi HSK thông minh.'}
                  </p>
                </div>

                {/* Title & Two-Tab Switcher (Đăng nhập / Đăng ký) */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 max-w-[440px]">
                  <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#26252D] tracking-tight">
                    {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </h1>

                  <div className="inline-flex rounded-lg bg-[#EBF4FA] p-1 border border-[#D5E6F2]" role="tablist" aria-label="Chuyển đổi Đăng nhập và Đăng ký">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'login'}
                      onClick={() => {
                        setActiveTab('login');
                        setErrors({});
                        setMsg(null);
                      }}
                      className={`${
                        activeTab === 'login' ? 'chaina-tab-active' : 'chaina-tab-inactive'
                      } px-4 py-1.5 rounded-md text-xs font-bold transition-all`}
                    >
                      Đăng nhập
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === 'register'}
                      onClick={() => {
                        setActiveTab('register');
                        setErrors({});
                        setMsg(null);
                      }}
                      className={`${
                        activeTab === 'register' ? 'chaina-tab-active' : 'chaina-tab-inactive'
                      } px-4 py-1.5 rounded-md text-xs font-bold transition-all`}
                    >
                      Đăng ký
                    </button>
                  </div>
                </div>

                {/* Inline Feedback Banner */}
                {msg && (
                  <div
                    role="alert"
                    className={`max-w-[440px] mb-4 px-3.5 py-2.5 rounded-lg border text-xs font-medium flex items-start gap-2.5 ${
                      msg.type === 'error'
                        ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]'
                        : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">!</span>
                    <span className="leading-relaxed">{msg.text}</span>
                  </div>
                )}

                {/* ===============================================================
                     TAB 1: FORM ĐĂNG NHẬP
                     =============================================================== */}
                {activeTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-[440px]" noValidate>
                    {/* Field 1: Email hoặc Username */}
                    <div>
                      <label htmlFor="loginIdentifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email hoặc Username
                      </label>
                      <div
                        className={`chaina-input-wrap rounded-lg px-3.5 py-2.5 flex items-center ${
                          errors.loginIdentifier ? 'input-error' : ''
                        }`}
                      >
                        <input
                          id="loginIdentifier"
                          name="identifier"
                          type="text"
                          autoComplete="username"
                          value={loginIdentifier}
                          onChange={(e) => {
                            setLoginIdentifier(e.target.value);
                            if (errors.loginIdentifier) setErrors((prev) => ({ ...prev, loginIdentifier: undefined }));
                          }}
                          placeholder="hocvien@chaina.vn hoặc username"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-500/80 focus:outline-none"
                        />
                      </div>
                      {errors.loginIdentifier && (
                        <p className="text-[11px] font-medium text-red-600 mt-1">
                          {errors.loginIdentifier}
                        </p>
                      )}
                    </div>

                    {/* Field 2: Mật khẩu + Quên mật khẩu + Hiện/ẩn */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-700">
                          Mật khẩu
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMsg({
                              text: 'Tính năng khôi phục mật khẩu đang được hỗ trợ qua email: support@chaina.vn hoặc bạn có thể đăng nhập ngay với Google.',
                              type: 'info',
                            });
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-[#D84A34] focus:outline-none transition-colors"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>
                      <div
                        className={`chaina-input-wrap rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                          errors.loginPassword ? 'input-error' : ''
                        }`}
                      >
                        <input
                          id="loginPassword"
                          name="password"
                          type={showLoginPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            if (errors.loginPassword) setErrors((prev) => ({ ...prev, loginPassword: undefined }));
                          }}
                          placeholder="••••••••••••"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-500/80 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((v) => !v)}
                          aria-label="Hiện hoặc ẩn mật khẩu"
                          className="text-[#B85D76] hover:text-[#D84A34] text-xs font-semibold px-1.5 py-0.5 shrink-0 focus:outline-none transition-colors"
                        >
                          {showLoginPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                      {errors.loginPassword && (
                        <p className="text-[11px] font-medium text-red-600 mt-1">
                          {errors.loginPassword}
                        </p>
                      )}
                    </div>

                    {/* Field 3: Ghi nhớ đăng nhập */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#DA88A0] focus:ring-0"
                        />
                        <span className="text-xs font-medium text-slate-600">Ghi nhớ đăng nhập</span>
                      </label>
                    </div>

                    {/* Primary Submit CTA: Đăng nhập vào Chaina */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={busy || googleBusy}
                        className="chaina-btn-primary w-full px-6 text-xs sm:text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2"
                      >
                        <span>Đăng nhập vào Chaina</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ===============================================================
                       TAB 2: FORM ĐĂNG KÝ
                       =============================================================== */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-w-[440px]" noValidate>
                    {/* Field 1: Username */}
                    <div>
                      <label htmlFor="regUsername" className="block text-xs font-semibold text-slate-700 mb-1">
                        Username
                      </label>
                      <div
                        className={`chaina-input-wrap rounded-lg px-3.5 py-2.5 flex items-center ${
                          errors.regUsername ? 'input-error' : ''
                        }`}
                      >
                        <input
                          id="regUsername"
                          name="username"
                          type="text"
                          autoComplete="username"
                          value={regUsername}
                          onChange={(e) => {
                            setRegUsername(e.target.value);
                            if (errors.regUsername) setErrors((prev) => ({ ...prev, regUsername: undefined }));
                          }}
                          placeholder="minhdai_hsk"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-500/80 focus:outline-none"
                        />
                      </div>
                      {errors.regUsername && (
                        <p className="text-[11px] font-medium text-red-600 mt-1">
                          {errors.regUsername}
                        </p>
                      )}
                    </div>

                    {/* Field 2: Email */}
                    <div>
                      <label htmlFor="regEmail" className="block text-xs font-semibold text-slate-700 mb-1">
                        Email
                      </label>
                      <div
                        className={`chaina-input-wrap rounded-lg px-3.5 py-2.5 flex items-center ${
                          errors.regEmail ? 'input-error' : ''
                        }`}
                      >
                        <input
                          id="regEmail"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={regEmail}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            if (errors.regEmail) setErrors((prev) => ({ ...prev, regEmail: undefined }));
                          }}
                          placeholder="hocvien@chaina.vn"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-500/80 focus:outline-none"
                        />
                      </div>
                      {errors.regEmail && (
                        <p className="text-[11px] font-medium text-red-600 mt-1">
                          {errors.regEmail}
                        </p>
                      )}
                    </div>

                    {/* Field 3: Mật khẩu */}
                    <div>
                      <label htmlFor="regPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                        Mật khẩu
                      </label>
                      <div
                        className={`chaina-input-wrap rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                          errors.regPassword ? 'input-error' : ''
                        }`}
                      >
                        <input
                          id="regPassword"
                          name="password"
                          type={showRegPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={regPassword}
                          onChange={(e) => {
                            setRegPassword(e.target.value);
                            if (errors.regPassword) setErrors((prev) => ({ ...prev, regPassword: undefined }));
                          }}
                          placeholder="Tối thiểu 8 ký tự"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-500/80 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((v) => !v)}
                          aria-label="Hiện hoặc ẩn mật khẩu"
                          className="text-[#B85D76] hover:text-[#D84A34] text-xs font-semibold px-1.5 py-0.5 shrink-0 focus:outline-none transition-colors"
                        >
                          {showRegPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                      {errors.regPassword && (
                        <p className="text-[11px] font-medium text-red-600 mt-1">
                          {errors.regPassword}
                        </p>
                      )}
                    </div>

                    {/* Field 4: Mandatory Terms & Privacy Checkbox */}
                    <div className="pt-0.5">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={regTerms}
                          onChange={(e) => {
                            setRegTerms(e.target.checked);
                            if (errors.regTerms) setErrors((prev) => ({ ...prev, regTerms: undefined }));
                          }}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#DA88A0] focus:ring-0"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          Tôi đồng ý với{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setTermsModalOpen(true);
                            }}
                            className="font-semibold text-sky-700 hover:text-[#D84A34] underline focus:outline-none"
                          >
                            Điều khoản sử dụng
                          </button>{' '}
                          và{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPrivacyModalOpen(true);
                            }}
                            className="font-semibold text-sky-700 hover:text-[#D84A34] underline focus:outline-none"
                          >
                            Chính sách bảo mật
                          </button>{' '}
                          của Chaina HSK.
                        </span>
                      </label>
                      {errors.regTerms && (
                        <p className="text-[11px] font-medium text-red-600 mt-1">
                          {errors.regTerms}
                        </p>
                      )}
                    </div>

                    {/* Primary Submit CTA: Tạo tài khoản Chaina */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={busy || googleBusy}
                        className="chaina-btn-primary w-full px-6 text-xs sm:text-sm font-bold tracking-wide inline-flex items-center justify-center gap-2"
                      >
                        <span>Tạo tài khoản Chaina</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* =================================================================
                   GOOGLE SIGN-IN SECTION
                   ================================================================= */}
              <div className="max-w-[440px] pt-5 mt-4">
                <div className="flex items-center gap-3 mb-3.5">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-xs font-medium text-slate-400">Hoặc tiếp tục với</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="w-full flex justify-center min-h-[44px]">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={busy || googleBusy}
                    className="chaina-btn-google w-full px-6 flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold transition-all hover:shadow-md active:scale-[0.99]"
                  >
                    <GoogleIcon />
                    <span>Tiếp tục với Google</span>
                  </button>
                </div>

                {/* Bottom Quick Switch Link */}
                <p className="text-center text-xs text-slate-500 mt-4">
                  {activeTab === 'login' ? (
                    <>
                      <span>Chưa có tài khoản?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('register');
                          setErrors({});
                          setMsg(null);
                        }}
                        className="font-bold text-[#DA88A0] hover:text-[#D84A34] ml-1 focus:outline-none transition-colors"
                      >
                        Đăng ký ngay
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Đã có tài khoản Chaina HSK?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setErrors({});
                          setMsg(null);
                        }}
                        className="font-bold text-[#DA88A0] hover:text-[#D84A34] ml-1 focus:outline-none transition-colors"
                      >
                        Đăng nhập
                      </button>
                    </>
                  )}
                </p>
              </div>

            </section>

            {/* ===================================================================
                 RIGHT PANEL (~40% ON DESKTOP -> 5/12 COLS): 2.5D SOFT ILLUSTRATION MASCOT
                 =================================================================== */}
            <section className="md:col-span-5 bg-[#C3DFF2] px-6 py-6 sm:px-7 sm:py-8 flex flex-col items-center justify-between relative overflow-hidden border-t md:border-t-0 md:border-l border-[#B4D4EB]">
              
              {/* Top Subtle Brand Tag inside Mascot Panel */}
              <div className="w-full flex items-center justify-between z-10">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-700/75">
                  Chaina Companion
                </span>
                <span className="font-serif-sc text-xs font-semibold text-slate-700/85 px-2.5 py-0.5 rounded-full bg-white/60 border border-white/80">
                  汉语学习
                </span>
              </div>

              {/* Bespoke 2.5D Soft Layered Illustration Asset */}
              <div className="w-full max-w-[300px] sm:max-w-[340px] md:max-w-full my-2 flex items-center justify-center z-10">
                <Chaina25DMascot />
              </div>

              {/* Bottom Caption inside Right Panel */}
              <div className="w-full text-center z-10 pt-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Người bạn đồng hành chinh phục HSK 1 – 6
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Lộ trình cá nhân hóa • Ôn tập thông minh • Luyện thi chuẩn quốc tế
                </p>
              </div>

            </section>

          </div>
        </main>

        {/* Global Footer */}
        <footer className="relative z-10 w-full max-w-[1060px] mx-auto px-4 py-4 text-center text-xs text-sky-100/90 font-medium flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 Chaina HSK · Nền tảng học tiếng Trung thế hệ mới</span>
          <div className="flex items-center gap-4 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Điều khoản
            </button>
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Bảo mật
            </button>
            <Link href="/" className="hover:text-white transition-colors">
              Trung tâm trợ giúp
            </Link>
          </div>
        </footer>

      </div>

      {/* =========================================================================
           MODAL 1: ĐIỀU KHOẢN SỬ DỤNG (TERMS OF SERVICE)
           ========================================================================= */}
      {termsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 flex items-center justify-center p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="termsModalTitle"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 id="termsModalTitle" className="text-base font-bold text-slate-900">
                  Điều khoản sử dụng — Chaina HSK
                </h2>
                <p className="text-xs text-slate-500">Cập nhật dành cho học viên hệ thống Chaina HSK</p>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed max-h-[55vh] overflow-y-auto pr-1">
              <p>
                <strong>1. Quyền sử dụng học liệu:</strong> Tài khoản Chaina HSK cung cấp quyền truy cập vào kho từ vựng, ngữ pháp, bài nghe và đề thi thử từ HSK 1 đến HSK 6 cho mục đích học tập cá nhân.
              </p>
              <p>
                <strong>2. Trách nhiệm tài khoản:</strong> Học viên tự bảo mật thông tin đăng nhập và không chia sẻ tài khoản cho nhiều người dùng truy cập đồng thời.
              </p>
              <p>
                <strong>3. Quy chuẩn cộng đồng:</strong> Mọi nội dung trao đổi và ghi chú học tập trên nền tảng cần tuân thủ quy tắc văn minh, tôn trọng bản quyền học liệu.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegTerms(true);
                  if (errors.regTerms) setErrors((prev) => ({ ...prev, regTerms: undefined }));
                  setTermsModalOpen(false);
                }}
                className="chaina-btn-primary px-5 py-2 h-auto text-xs font-bold"
              >
                Đã hiểu &amp; Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           MODAL 2: CHÍNH SÁCH BẢO MẬT (PRIVACY POLICY)
           ========================================================================= */}
      {privacyModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/65 flex items-center justify-center p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacyModalTitle"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 id="privacyModalTitle" className="text-base font-bold text-slate-900">
                  Chính sách bảo mật — Chaina HSK
                </h2>
                <p className="text-xs text-slate-500">Cam kết bảo vệ dữ liệu cá nhân và lịch sử học tập</p>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed max-h-[55vh] overflow-y-auto pr-1">
              <p>
                <strong>1. Dữ liệu thu thập:</strong> Chaina HSK chỉ lưu trữ Username, địa chỉ Email và dữ liệu tiến độ học tập (từ vựng SRS, lịch sử làm bài HSK) nhằm đồng bộ hóa trải nghiệm của bạn.
              </p>
              <p>
                <strong>2. Liên kết Google Sign-In:</strong> Khi chọn tiếp tục với Google, hệ thống chỉ nhận mã định danh OAuth và email xác thực, tuyệt đối không truy cập dữ liệu riêng tư khác.
              </p>
              <p>
                <strong>3. An toàn thông tin:</strong> Mật khẩu được mã hóa một chiều và không chia sẻ cho bất kỳ bên thứ ba nào.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegTerms(true);
                  if (errors.regTerms) setErrors((prev) => ({ ...prev, regTerms: undefined }));
                  setPrivacyModalOpen(false);
                }}
                className="chaina-btn-primary px-5 py-2 h-auto text-xs font-bold"
              >
                Đã hiểu &amp; Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           MODAL 3: POPUP ONBOARDING CHO TÀI KHOẢN MỚI
           ========================================================================= */}
      {showOnboarding && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            className="my-auto w-full max-w-xl animate-fade-up rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#DA88A0]">
                  HSK LEARNING PROFILE
                </p>
                <h2 id="onboarding-title" className="mt-1.5 text-2xl font-extrabold text-[#26252D]">
                  Bắt đầu từ đâu nhỉ?
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Vài câu hỏi để gợi ý lộ trình phù hợp. Bạn có thể chỉnh sửa sau trong tài khoản.
                </p>
              </div>
              <span aria-hidden="true" className="font-serif-sc text-4xl text-[#DA88A0]">
                学
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Bạn đã biết tiếng Trung đến đâu?
                <select
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#5B9BD5]"
                  value={learningExperience}
                  onChange={(e) => setLearningExperience(e.target.value)}
                >
                  <option value="">Chọn mức hiện tại</option>
                  <option value="new">Mình chưa học</option>
                  <option value="pinyin">Biết pinyin và vài từ</option>
                  <option value="basic">Đã học cơ bản (HSK 1–2)</option>
                  <option value="intermediate">Có nền tảng (HSK 3–4)</option>
                  <option value="advanced">Khá vững (HSK 5 trở lên)</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Bạn muốn đạt mục tiêu nào?
                <select
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#5B9BD5]"
                  value={studyPurpose}
                  onChange={(e) => setStudyPurpose(e.target.value)}
                >
                  <option value="">Chọn mục tiêu</option>
                  <option value="exam">Thi chứng chỉ HSK</option>
                  <option value="conversation">Giao tiếp hằng ngày</option>
                  <option value="travel">Du lịch</option>
                  <option value="work">Công việc hoặc học tập</option>
                  <option value="interest">Yêu thích ngôn ngữ và văn hoá</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Mục tiêu HSK
                <select
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#5B9BD5]"
                  value={onboardingTarget}
                  onChange={(e) => setOnboardingTarget(e.target.value)}
                >
                  <option value="">Chưa xác định</option>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>
                      HSK {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Thời gian học mỗi ngày
                <select
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#5B9BD5]"
                  value={dailyStudyMinutes}
                  onChange={(e) => setDailyStudyMinutes(e.target.value)}
                >
                  <option value="">Chưa chọn</option>
                  {[10, 20, 30, 45, 60].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} phút
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {onboardingError && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs sm:text-sm text-red-700">
                {onboardingError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                disabled={busy}
                onClick={() => finishOnboarding(true)}
              >
                Để sau
              </button>
              <button
                type="button"
                className="chaina-btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md"
                disabled={busy}
                onClick={() => finishOnboarding(false)}
              >
                Lưu và bắt đầu học
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
