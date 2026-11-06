import Link from 'next/link';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import StrokeExperience from '@/components/landing/StrokeExperience';
import ToneExperience from '@/components/landing/ToneExperience';
import { RevealGroup, ScrollJourney } from '@/components/landing/ScrollJourney';
import MilestoneTimeline from '@/components/landing/MilestoneTimeline';

export default function LandingPage() {
  return <main className="learning-lab">
    <ScrollJourney />
    <LandingNav />
    <section className="lab-hero">
      <div className="lab-hero__copy"><p className="lab-overline">HSK 1—3 <span>·</span> CHINESE LEARNING SPACE</p><h1>Học tiếng Trung.<br/><em>Cảm nhận từng nét chữ.</em></h1><p className="lab-hero__lead">Nghe thanh điệu chuyển động. Theo dõi từng nét chữ Hán. Học từng bước trong một không gian được tạo riêng cho bạn.</p><div className="lab-hero__actions"><Link href="/dashboard" className="lab-button">Bắt đầu học <span>↗</span></Link><a href="#tone-experience" className="lab-link">Khám phá trải nghiệm <span>↓</span></a></div></div>
      <RevealGroup className="lab-hero__visual"><div className="lab-hero__orb"/><div className="lab-hero__character" lang="zh-Hans">学</div><span className="lab-hero__hanzi-float" lang="zh-Hans">字</span><span className="lab-hero__hanzi-float lab-hero__hanzi-float--two" lang="zh-Hans">声</span><div className="lab-float-card lab-float-card--tone"><small>PINYIN · 01</small><b>mā <i>↗</i></b><span>thanh ngang · cao</span></div><div className="lab-float-card lab-float-card--stroke"><small>STROKE ORDER</small><b lang="zh-Hans">永 <span>8 nét</span></b><span>Học theo đúng thứ tự</span></div><div className="lab-hero__orbit"/></RevealGroup>
      <div className="lab-hero__foot"><span>01 / LANGUAGE IN MOTION</span><span>SCROLL TO EXPLORE ↓</span></div>
    </section>

    <section id="stroke-experience" className="lab-interactions"><div className="lab-section-head"><span className="lab-overline">01 — STROKE ORDER</span><h2>Mỗi nét chữ,<br/><em>đều có trình tự.</em></h2><p>Xem hướng đi chính xác của từng nét. Dữ liệu thực từ Hanzi Writer, có thể phát lại và tự luyện viết.</p></div><StrokeExperience /></section>

    <section id="tone-experience" className="tone-section"><div className="lab-section-head"><span className="lab-overline">02 — PINYIN TONES</span><h2>Một âm tiết.<br/><em>Bốn đường cao độ.</em></h2><p>Chọn thanh điệu để nghe nhìn sự thay đổi của âm: ngang, lên, xuống lên và đi xuống.</p></div><ToneExperience /></section>

    <MilestoneTimeline />

    <section className="lab-cta"><div><span className="lab-overline">YOUR NEXT CHARACTER</span><h2>Sẵn sàng bắt đầu<br/><em>chưa?</em></h2></div><Link href="/dashboard" className="lab-button lab-button--light">Bắt đầu học ngay <span>↗</span></Link><span className="lab-cta__mark" lang="zh-Hans">学</span></section>
    <LandingFooter />
  </main>;
}
