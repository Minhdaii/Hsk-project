import type { Metadata } from 'next';
import NoticeBoard from '@/components/feedback/NoticeBoard';

export const metadata: Metadata = {
  title: 'Bảng Thông Báo Góp Ý · Chaina HSK',
  description:
    'Bảng ghim thông báo trường học góp ý tính năng, báo lỗi và gửi lời nhắn cho Chaina HSK. Bảo mật nội dung riêng tư tuyệt đối.',
};

export default function FeedbackPage() {
  return (
    <div className="py-2 sm:py-4">
      <NoticeBoard />
    </div>
  );
}
