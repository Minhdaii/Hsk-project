import BossGame from '@/components/boss/BossGame';

export const metadata = { title: 'Boss gõ Pinyin' };

export default function PinyinBossPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Boss gõ Pinyin</h1>
        <p className="mt-1 max-w-2xl text-stone-600">Gõ pinyin của chữ Hán thật nhanh để đánh bại Boss. Mỗi cấp HSK 1 đến 3 có một Boss riêng.</p>
      </header>
      <BossGame />
    </div>
  );
}
