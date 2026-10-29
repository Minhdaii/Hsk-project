import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import '@fontsource/noto-serif-sc/chinese-simplified-600.css';
import '@fontsource/noto-serif-sc/chinese-simplified-900.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import FavoritesProvider from '@/components/FavoritesProvider';
import ChromeSwitch from '@/components/ChromeSwitch';

export const metadata: Metadata = {
  title: 'Học tiếng Trung HSK 1-3',
  description: 'Học từ vựng, ngữ pháp HSK 1-3 với flashcard lặp lại ngắt quãng, bài tập đa dạng, nghe phát âm và tập viết chữ Hán. Miễn phí.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#c0392b' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen">
        <FavoritesProvider>
          <ChromeSwitch>{children}</ChromeSwitch>
        </FavoritesProvider>
      </body>
    </html>
  );
}
