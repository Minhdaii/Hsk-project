import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import FavoritesProvider from '@/components/FavoritesProvider';

export const metadata: Metadata = {
  title: 'Học tiếng Trung HSK',
  description: 'Học từ vựng HSK 1-3 với flashcard lặp lại ngắt quãng, quiz, nghe phát âm và tập viết chữ Hán.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#c0392b' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen pb-20 sm:pb-0">
        <FavoritesProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">{children}</main>
        </FavoritesProvider>
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-stone-500">
          <Link href="/credits" className="underline">Nguồn dữ liệu</Link> · <Link href="/privacy" className="underline">Quyền riêng tư</Link>
        </footer>
      </body>
    </html>
  );
}
