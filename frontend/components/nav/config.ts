import {
  BookOpen, Bookmark, CalendarDays, ChartLine, ChartNoAxesCombined, CircleHelp, ClipboardCheck, Gamepad2,
  House, Languages, Layers, LayoutDashboard, LayoutGrid, PenTool, Route, Settings, Trophy, type LucideIcon,
} from 'lucide-react';

/**
 * Cấu trúc điều hướng: Các khu vực chức năng được phân nhóm rõ ràng, khoa học.
 * - Dashboard: Trang chủ cá nhân, chuỗi học tập, hiệu suất và lối tắt nhanh.
 * - Học tập: Học theo chủ đề (/categories), Kho từ vựng (/words), Thẻ nhớ flashcard (/study), Ngữ pháp (/grammar).
 * - Luyện tập: 5 Mini-games, Quiz trắc nghiệm, Luyện viết chữ Hán, Pinyin boss.
 * - Tiến độ: Lộ trình 9 chặng, Thống kê học tập, Ôn tập SM-2, Bảng xếp hạng.
 */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string, mode?: string | null) => boolean;
  usesMode?: boolean;
};

export type Section = {
  id: 'dashboard' | 'learn' | 'practice' | 'progress';
  label: string;
  href: string;
  icon: LucideIcon;
  owns: (path: string) => boolean;
  items: NavItem[];
};

export type MobileTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
};

const under = (...prefixes: string[]) => (p: string) => prefixes.some((x) => p === x || p.startsWith(x + '/'));
const item = (href: string, label: string, icon: LucideIcon, prefixes: string[] = [href]): NavItem => ({
  href,
  label,
  icon,
  match: (p) => under(...prefixes)(p),
});

export const SETTINGS: NavItem = item('/profile', 'Cài đặt và hồ sơ', Settings);

/** 5 Tab điều hướng cốt lõi trên Mobile (Hiển thị cố định đáy màn hình) */
export const MOBILE_TABS: MobileTab[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: House, match: (p) => p === '/dashboard' || p === '/profile' },
  { href: '/categories', label: 'Chủ đề', icon: LayoutGrid, match: (p) => under('/categories')(p) },
  { href: '/words', label: 'Từ vựng', icon: BookOpen, match: (p) => under('/words', '/word', '/study', '/grammar', '/favorites')(p) },
  { href: '/exercises', label: 'Luyện tập', icon: Gamepad2, match: (p) => under('/exercises', '/quiz', '/writing', '/pinyin-boss')(p) },
  { href: '/path', label: 'Lộ trình', icon: Route, match: (p) => under('/path')(p) },
];

export const SECTIONS: Section[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: House,
    owns: under('/dashboard', '/profile'),
    items: [
      item('/dashboard', 'Tổng quan', LayoutDashboard),
      item('/categories', 'Học theo chủ đề', LayoutGrid, ['/categories']),
      item('/words', 'Kho từ vựng', BookOpen, ['/words', '/word']),
      item('/exercises', 'Luyện tập', Gamepad2, ['/exercises', '/quiz', '/writing', '/pinyin-boss']),
      item('/path', 'Lộ trình HSK', Route),
      item('/stats', 'Tiến độ học', ChartNoAxesCombined, ['/stats', '/review', '/leaderboard']),
    ],
  },
  {
    id: 'learn',
    label: 'Học tập & Từ vựng',
    href: '/categories',
    icon: BookOpen,
    owns: under('/categories', '/words', '/word', '/study', '/grammar', '/favorites'),
    items: [
      item('/categories', 'Học theo chủ đề', LayoutGrid, ['/categories']),
      item('/words', 'Kho từ vựng HSK', BookOpen, ['/words', '/word']),
      item('/study', 'Thẻ nhớ Flashcard', Layers),
      item('/grammar', 'Cẩm nang ngữ pháp', Languages, ['/grammar']),
      item('/favorites', 'Sổ tay từ vựng', Bookmark),
    ],
  },
  {
    id: 'practice',
    label: 'Phòng luyện tập',
    href: '/exercises',
    icon: Gamepad2,
    owns: under('/exercises', '/quiz', '/writing', '/pinyin-boss'),
    items: [
      item('/exercises', 'Phòng luyện tập & Game', ClipboardCheck, ['/exercises']),
      item('/quiz', 'Quiz trắc nghiệm', CircleHelp),
      item('/writing', 'Nhận diện chữ viết', PenTool),
      item('/pinyin-boss', 'Game gõ Pinyin Boss', Gamepad2),
    ],
  },
  {
    id: 'progress',
    label: 'Lộ trình & Tiến độ',
    href: '/path',
    icon: ChartLine,
    owns: under('/path', '/stats', '/review', '/leaderboard'),
    items: [
      item('/path', 'Lộ trình 9 chặng', Route),
      item('/stats', 'Thống kê học tập', ChartNoAxesCombined),
      item('/review', 'Lịch ôn tập SM-2', CalendarDays),
      item('/leaderboard', 'Bảng xếp hạng', Trophy),
    ],
  },
];

export const sectionOf = (path: string): Section => SECTIONS.find((s) => s.owns(path)) ?? SECTIONS[0];
