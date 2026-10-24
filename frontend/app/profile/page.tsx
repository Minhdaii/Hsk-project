'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';
import PageHeader from '@/components/PageHeader';
import Skeleton from '@/components/Skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { stats } = useStats(!!user);

  const [dailyGoal, setDailyGoal] = useState(20);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const savedGoal = Number(localStorage.getItem('hsk_daily_goal') || '20');
    setDailyGoal(savedGoal);
    setAutoSpeak(localStorage.getItem('hsk_autospeak') === '1');
  }, []);

  const handleSaveGoal = (g: number) => {
    setDailyGoal(g);
    localStorage.setItem('hsk_daily_goal', String(g));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const toggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    localStorage.setItem('hsk_autospeak', next ? '1' : '0');
  };

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-1/3" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="editorial-card mx-auto max-w-md p-8 text-center">
        <p lang="zh-Hans" aria-hidden className="hanzi text-5xl font-bold text-[#55449E]">
          个人
        </p>
        <h2 className="mt-4 text-base font-bold text-[#302B3D]">Yêu cầu đăng nhập</h2>
        <p className="mt-1.5 text-xs text-[#777184]">
          Đăng nhập để xem thông tin hồ sơ và tùy chỉnh mục tiêu học tập cá nhân của bạn.
        </p>
        <div className="mt-5">
          <Link href="/login" className="btn-editorial-primary w-full text-center text-xs">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        glyph="我"
        title="Hồ sơ & Mục tiêu học tập"
        subtitle="Quản lý tài khoản, thiết lập chỉ tiêu số từ học hằng ngày và cài đặt hỗ trợ âm thanh"
      />

      {/* Thông tin học viên */}
      <section className="editorial-card p-6" aria-labelledby="thong-tin-hoc-vien">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#A99AE8] text-2xl font-bold uppercase text-[#241D45] shadow-xs"
          >
            {user.username.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="thong-tin-hoc-vien" className="text-lg font-bold text-[#302B3D]">
              {user.username}
            </h2>
            <p className="text-xs text-[#777184]">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="editorial-badge">Chuỗi {stats?.streak ?? 0} ngày</span>
              <span className="editorial-badge-stone">{stats?.xp ?? 0} XP tích lũy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Thiết lập mục tiêu học tập hằng ngày */}
      <section className="editorial-card p-6 space-y-4" aria-labelledby="muc-tieu-ngay">
        <div>
          <h3 id="muc-tieu-ngay" className="text-sm font-bold text-[#302B3D]">
            Chỉ tiêu học từ vựng mỗi ngày
          </h3>
          <p className="mt-0.5 text-xs text-[#777184]">
            Hệ thống sẽ dựa vào chỉ tiêu này để tính tỷ lệ hoàn thành mục tiêu ngày trên trang Tổng quan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[10, 20, 30, 50].map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => handleSaveGoal(goal)}
              className={`min-h-[40px] rounded-lg border px-4 text-xs font-bold transition-all ${
                dailyGoal === goal
                  ? 'border-[#D8CFF2] bg-[#EEE9FC] text-[#3B2D78] shadow-xs'
                  : 'border-[#E7E2F0] bg-white text-[#777184] hover:border-[#A99AE8]'
              }`}
            >
              {goal} từ / ngày
            </button>
          ))}
        </div>

        {savedMsg && (
          <p className="text-xs font-semibold text-emerald-700 animate-fade-in">
            ✓ Đã lưu cài đặt chỉ tiêu học tập thành công!
          </p>
        )}
      </section>

      {/* Tùy chọn trợ năng & Âm thanh */}
      <section className="editorial-card p-6 space-y-4" aria-labelledby="tuy-chon-am-thanh">
        <div>
          <h3 id="tuy-chon-am-thanh" className="text-sm font-bold text-[#302B3D]">
            Cài đặt âm thanh phát âm
          </h3>
          <p className="mt-0.5 text-xs text-[#777184]">
            Tự động đọc từ khi mở thẻ từ mới trong phòng học flashcard.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#F0ECF6] pt-3">
          <span className="text-xs font-medium text-[#302B3D]">Tự động phát âm khi chuyển thẻ</span>
          <button
            onClick={toggleAutoSpeak}
            aria-pressed={autoSpeak}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              autoSpeak ? 'bg-[#A99AE8]' : 'bg-stone-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                autoSpeak ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Đăng xuất tài khoản */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="btn-editorial-ghost w-full !border-red-200 text-xs font-bold text-red-700 hover:bg-red-50"
        >
          Đăng xuất khỏi tài khoản
        </button>
      </div>
    </div>
  );
}
