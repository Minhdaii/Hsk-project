import BossGame from '@/components/boss/BossGame';

export const metadata = { title: 'Boss gõ Pinyin' };

// Trang vừa khít một khung nhìn (AppShell khóa chiều cao cho đường dẫn này), nên tiêu đề gọn và phần mô tả chỉ hiện khi đủ chỗ.
export default function PinyinBossPage() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 sm:gap-3">
      <header className="shrink-0">
        <h1 className="text-2xl font-medium leading-tight tracking-tight sm:text-3xl [@media(max-height:700px)]:sr-only">Boss gõ Pinyin</h1>
        <p className="hidden max-w-2xl text-sm text-stone-600 [@media(min-height:760px)]:block">Gõ pinyin của chữ Hán thật nhanh để đánh bại Boss. Mỗi cấp HSK 1 đến 3 có một Boss riêng.</p>
      </header>
      <BossGame />
    </div>
  );
}
