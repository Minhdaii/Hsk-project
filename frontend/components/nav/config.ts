import {
  BookOpen, Bookmark, CalendarDays, ChartLine, ChartNoAxesCombined, CircleHelp, ClipboardCheck, Gamepad2, GraduationCap,
  House, Languages, Layers, LayoutDashboard, Library, MessageCircle, PenTool, Route, Settings, Trophy, type LucideIcon,
} from 'lucide-react';

/**
 * Cấu trúc điều hướng: 4 khu vực ở thanh trên (chỉ icon), mỗi khu vực có bộ mục riêng ở thanh bên (chỉ icon).
 * Chỉ trỏ tới các trang có thật trong dự án. Tên chức năng chỉ hiện trong tooltip và aria-label.
 * `match` nhận thêm `mode` (tham số ?mode= trên URL) để phân biệt "Phòng luyện tập" và "Giao tiếp", vì cả hai nằm ở /exercises.
 */
export type NavItem = {
  href: string; label: string; icon: LucideIcon;
  match: (path: string, mode: string | null) => boolean;
  usesMode?: boolean;
};
export type Section = {
  id: 'dashboard' | 'learn' | 'progress' | 'courses';
  label: string; href: string; icon: LucideIcon;
  owns: (path: string) => boolean;
  items: NavItem[];
};

const under = (...prefixes: string[]) => (p: string) => prefixes.some((x) => p === x || p.startsWith(x + '/'));
const item = (href: string, label: string, icon: LucideIcon, prefixes: string[] = [href]): NavItem => ({ href, label, icon, match: (p) => under(...prefixes)(p) });

export const SETTINGS: NavItem = item('/profile', 'Cài đặt và hồ sơ', Settings);

export const SECTIONS: Section[] = [
  {
    id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: House,
    owns: under('/dashboard', '/profile'),
    items: [
      item('/dashboard', 'Tổng quan', LayoutDashboard),
      item('/words', 'Từ vựng', BookOpen, ['/words', '/word']),
      item('/exercises', 'Phòng luyện tập', ClipboardCheck),
      item('/stats', 'Thống kê', ChartNoAxesCombined),
      item('/leaderboard', 'Thành tích', Trophy),
    ],
  },
  {
    id: 'learn', label: 'Học tập', href: '/exercises', icon: BookOpen,
    owns: under('/study', '/words', '/word', '/grammar', '/exercises', '/quiz', '/writing', '/pinyin-boss', '/favorites'),
    // "Học tập" và "Phòng luyện tập" là một: nút Học tập ở thanh trên mở thẳng Phòng luyện tập, cũng là mục đầu của thanh bên
    items: [
      { href: '/exercises', label: 'Phòng luyện tập', icon: ClipboardCheck, usesMode: true, match: (p, mode) => under('/exercises')(p) && mode !== 'dialogue' },
      { href: '/exercises?mode=dialogue', label: 'Tình huống giao tiếp', icon: MessageCircle, usesMode: true, match: (p, mode) => under('/exercises')(p) && mode === 'dialogue' },
      item('/words', 'Từ vựng', BookOpen, ['/words', '/word']),
      item('/study', 'Học thẻ ôn tập', Layers),
      item('/grammar', 'Ngữ pháp', Languages),
      item('/writing', 'Nhận diện chữ viết', PenTool),
      item('/pinyin-boss', 'Game học tập', Gamepad2),
      item('/quiz', 'Quiz từ vựng', CircleHelp),
      item('/favorites', 'Sổ tay từ vựng', Bookmark),
    ],
  },
  {
    id: 'progress', label: 'Tiến độ', href: '/stats', icon: ChartLine,
    owns: under('/stats', '/review', '/leaderboard'),
    items: [
      item('/stats', 'Thống kê học tập', ChartNoAxesCombined),
      item('/review', 'Lịch ôn tập', CalendarDays),
      item('/leaderboard', 'Thành tích và xếp hạng', Trophy),
    ],
  },
  {
    id: 'courses', label: 'Khóa học', href: '/path', icon: Library,
    owns: under('/path'),
    items: [
      item('/path', 'Lộ trình HSK', Route),
      { href: '/study?level=1', label: 'Học theo cấp độ HSK', icon: GraduationCap, match: () => false },
    ],
  },
];

export const sectionOf = (path: string): Section => SECTIONS.find((s) => s.owns(path)) ?? SECTIONS[0];
