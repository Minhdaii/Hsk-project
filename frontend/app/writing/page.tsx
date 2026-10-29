import WritingPad from '@/components/writing/WritingPad';

export const metadata = { title: 'Giấy luyện viết chữ Hán' };

export default function WritingPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Giấy luyện viết</h1>
        <p className="mt-1 max-w-2xl text-stone-600">Viết chữ Hán tự do như trên giấy thật. Hệ thống tự tách chữ và nhận diện, rồi tra nghĩa nếu chữ có trong kho từ HSK.</p>
      </header>
      <WritingPad />
    </div>
  );
}
