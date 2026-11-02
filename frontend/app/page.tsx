import Link from 'next/link';
import InkMountains from '@/components/landing/InkMountains';
import BrushDivider from '@/components/landing/BrushDivider';
import RedSeal from '@/components/landing/RedSeal';
import DemoCard from '@/components/landing/DemoCard';
import WordOfDay from '@/components/landing/WordOfDay';
import Reveal from '@/components/Reveal';
import Anim from '@/components/motion/Anim';
import SplitWords from '@/components/motion/SplitWords';
import CountUp from '@/components/motion/CountUp';

/* ============================================================================
   MODERN INK EDITORIAL — HSK LANDING PAGE
   Black / White / Vermilion · Chinese Ink Wash · Contemporary Typography
   ============================================================================ */

const FEATURES = [
  { han: '记', title: 'Flashcard thông minh', text: 'Chọn nghĩa tiếng Việt đúng, hệ thống tự chấm và lên lịch ôn lại theo thuật toán lặp lại ngắt quãng SM-2.' },
  { han: '法', title: 'Ngữ pháp dễ hiểu', text: '39 điểm ngữ pháp HSK 1-3 giải thích bằng tiếng Việt, kèm ví dụ có pinyin và nút nghe.' },
  { han: '练', title: 'Bài tập đa dạng', text: 'Điền từ vào câu, sắp xếp câu, dịch Việt → Hán, gõ pinyin. Tự chọn số câu cho mỗi lần luyện.' },
  { han: '听写', title: 'Nghe và tập viết', text: 'Nghe phát âm từng từ, xem thứ tự nét và tự viết trực tiếp từng chữ Hán trên màn hình.' },
  { han: '火', title: 'Giữ lửa mỗi ngày', text: 'Chuỗi ngày học, điểm XP và bảng xếp hạng giúp bạn duy trì thói quen học đều đặn.' },
  { han: '收藏', title: 'Sổ tay riêng', text: 'Lưu những từ khó nhớ vào sổ tay để xem lại bất cứ lúc nào.' },
];

const STEPS = [
  { han: '一', title: 'Học từ mới mỗi ngày', text: 'Mỗi lượt có 10 từ mới theo tần suất sử dụng, từ thông dụng nhất đến ít gặp hơn.' },
  { han: '二', title: 'Ôn đúng lúc sắp quên', text: 'Từ bạn trả lời đúng sẽ được hẹn ôn lại sau 1, 6 ngày rồi xa dần. Trả lời sai thì quay lại ngay trong buổi học.' },
  { han: '三', title: 'Luyện tập và giữ lửa', text: 'Làm bài tập, học ngữ pháp và giữ chuỗi ngày học để biến kiến thức thành phản xạ.' },
];

const LEVELS = [
  { level: 1, han: '一级', words: 506, desc: 'Chào hỏi, số đếm, gia đình, đồ ăn thức uống.', sample: ['我', '你好', '谢谢', '学生', '朋友'] },
  { level: 2, han: '二级', words: 750, desc: 'Giao tiếp hằng ngày, mua sắm, thời gian, sức khỏe.', sample: ['已经', '因为', '旅游', '准备', '希望'] },
  { level: 3, han: '三级', words: 953, desc: 'Công việc, du lịch, học tập, bày tỏ ý kiến.', sample: ['经验', '环境', '机会', '解决', '同意'] },
];

export default function LandingPage() {
  return (
    <>
      {/* ================================================================
          SECTION 01 — HERO: THE ART OF LEARNING CHINESE
          Ink wash landscape backdrop, editorial oversized typography,
          vermilion seal accent, asymmetric multi-layer composition.
          ================================================================ */}
      <section className="relative overflow-hidden bg-white">
        {/* Ink landscape backdrop — chiếm toàn bộ hero */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none">
          <img
            src="/images/landing/ink-landscape/hero-mountains.jpg"
            alt=""
            aria-hidden
            className="w-full max-w-[1600px] object-cover object-bottom opacity-[0.18] mix-blend-multiply"
            style={{ maskImage: 'linear-gradient(to top, black 40%, transparent 95%)', WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 95%)' }}
          />
        </div>

        {/* SVG ink mountains overlay — animated */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none">
          <InkMountains className="w-full max-h-[55vh] opacity-30" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid min-h-[90vh] items-center gap-8 pb-16 pt-12 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-20">

            {/* Cột trái — Typography chính */}
            <div className="lg:col-span-7 relative z-10">
              {/* Chữ Hán trang trí — rất lớn, mờ nền */}
              <span
                lang="zh-Hans"
                aria-hidden
                className="absolute -left-4 -top-8 font-hanzi text-[12rem] font-black leading-none text-[#111]/[0.04] select-none pointer-events-none sm:text-[16rem] lg:-left-12 lg:-top-12 lg:text-[20rem]"
              >
                汉
              </span>

              <Anim as="div" className="relative">
                <RedSeal char="學" size="lg" className="mb-6" />
              </Anim>

              <Anim as="p" delay={100} className="text-sm font-medium tracking-wide text-[#777] uppercase">
                Modern Chinese Learning Platform
              </Anim>

              <SplitWords
                as="h1"
                delay={200}
                text="Mỗi ngày một chữ, nhớ lâu hơn."
                className="mt-4 text-balance text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-[#111] sm:text-6xl lg:text-[4.75rem]"
              />

              <Anim as="p" delay={600} className="mt-6 max-w-xl text-lg leading-relaxed text-[#555]">
                Hơn 2.200 từ vựng và 39 điểm ngữ pháp HSK 1–3. Học bằng flashcard lặp lại ngắt quãng,
                bài tập đa dạng, nghe phát âm chuẩn và tập viết từng nét chữ Hán.
              </Anim>

              {/* CTAs */}
              <Anim delay={750} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-none bg-[#111] px-8 py-3 text-base font-bold text-white transition-all hover:bg-[#333] active:translate-y-px"
                >
                  Bắt đầu học
                </Link>
                <Link
                  href="/path"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-none border-2 border-[#111] bg-transparent px-7 py-3 text-base font-bold text-[#111] transition-all hover:bg-[#111] hover:text-white active:translate-y-px"
                >
                  Khám phá lộ trình
                </Link>
              </Anim>

              {/* Stats strip */}
              <Anim as="dl" delay={900} className="mt-12 hidden max-w-lg border-t-2 border-b-2 border-[#111]/20 sm:flex">
                {([[2200, '+', 'từ vựng'], [39, '', 'điểm ngữ pháp'], [4, '', 'dạng bài tập']] as const).map(([n, suf, l], i) => (
                  <div key={l} className={`flex-1 py-4 ${i ? 'border-l-2 border-[#111]/20 pl-5' : 'pr-5'}`}>
                    <dt className="text-3xl font-black text-[#111]"><CountUp to={n} suffix={suf} /></dt>
                    <dd className="text-sm text-[#777]">{l}</dd>
                  </div>
                ))}
              </Anim>
            </div>

            {/* Cột phải — Chữ Hán hôm nay */}
            <div className="relative z-10 lg:col-span-5">
              <WordOfDay />
            </div>
          </div>
        </div>
      </section>

      {/* Brush stroke divider */}
      <div className="bg-white">
        <BrushDivider className="mx-auto max-w-5xl px-4 py-2" />
      </div>

      {/* ================================================================
          SECTION 02 — THE JOURNEY (Thẻ học)
          Asymmetric split layout, ink wash sensibility
          ================================================================ */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] text-[#C62828] uppercase">Trải nghiệm học</p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl lg:text-5xl">
              Mỗi từ là<br />một tấm thẻ
            </h2>
            <div className="mt-2 h-[3px] w-16 bg-[#C62828]" aria-hidden />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#555]">
              Chữ Hán đủ lớn để nhận mặt chữ. Chọn nghĩa đúng, thẻ lật ra pinyin có dấu thanh,
              nghĩa tiếng Việt, Hán Việt và câu ví dụ có bản dịch.
            </p>
            <p className="mt-3 max-w-md text-[#777]">
              Thử lật tấm thẻ mẫu bên cạnh. Trên điện thoại, bạn chạm để lật và vuốt để sang thẻ kế tiếp.
            </p>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <DemoCard />
          </Reveal>
        </div>
      </section>

      <div className="bg-white">
        <BrushDivider flip className="mx-auto max-w-5xl px-4 py-2" />
      </div>

      {/* ================================================================
          SECTION 03 — LEARNING EXPERIENCE (Tính năng)
          Editorial index layout — NOT a card grid
          ================================================================ */}
      <section id="tinh-nang" className="scroll-mt-20 bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Section header — asymmetric */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-medium tracking-[0.2em] text-[#C62828] uppercase">Hệ thống học tập</p>
              <h2 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl lg:text-5xl">
                Mọi thứ cần để học tiếng Trung đều ở một nơi
              </h2>
              <div className="mt-3 h-[3px] w-16 bg-[#C62828]" aria-hidden />
            </div>
            <div className="flex items-end lg:col-span-4 lg:justify-end">
              <RedSeal char="学" size="xl" animate={false} className="hidden lg:inline-flex opacity-40" />
            </div>
          </div>

          {/* Feature list — editorial index */}
          <Anim as="ul" view each={70} y={16} className="mt-14 grid border-b-2 border-[#111]/15 md:grid-cols-2 md:gap-x-16">
            {FEATURES.map((f, i) => (
              <li key={f.title} className="flex items-start gap-6 border-t-2 border-[#111]/15 py-7">
                <span
                  lang="zh-Hans"
                  aria-hidden
                  className="hanzi flex h-16 w-[5rem] shrink-0 items-center justify-center text-4xl leading-none text-[#111]"
                >
                  {f.han}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-[#111]">{f.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-[#555]">{f.text}</p>
                </div>
              </li>
            ))}
          </Anim>
        </div>
      </section>

      {/* ================================================================
          SECTION 04 — PRACTICE & DISCOVER (Cách học)
          Three steps, overlapping composition with vertical accent
          ================================================================ */}
      <section id="cach-hoc" className="scroll-mt-20 relative overflow-hidden bg-[#111] text-white py-20 lg:py-32">
        {/* Subtle ink texture background */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .15 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] text-[#C62828] uppercase">Phương pháp</p>
            <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Ba bước,<br />mỗi ngày một chút
            </h2>
            <div className="mt-3 h-[3px] w-16 bg-[#C62828]" aria-hidden />
            <p className="mt-6 max-w-md text-lg text-white/70">
              Học tiếng Trung không phải chạy nhanh mà phải đi đều. Chỉ cần 15 phút mỗi ngày.
            </p>
          </div>

          <ol className="space-y-0 lg:col-span-6 lg:col-start-7">
            {STEPS.map((s, i) => (
              <Reveal key={s.han} delay={i * 100}>
                <li className="flex items-start gap-6 border-t border-white/15 py-8 first:border-t-0 first:pt-0">
                  <span
                    lang="zh-Hans"
                    aria-hidden
                    className="hanzi w-14 shrink-0 text-5xl font-black leading-none text-[#C62828]"
                  >
                    {s.han}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 max-w-lg leading-relaxed text-white/70">{s.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================================
          SECTION 05 — YOUR PROGRESS (Cấp độ HSK)
          White section, tabular editorial layout for levels
          ================================================================ */}
      <section id="cap-do" className="scroll-mt-20 bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="text-xs font-medium tracking-[0.2em] text-[#C62828] uppercase">Cấp độ HSK</p>
              <h2 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl lg:text-5xl">
                Từ nhập môn đến sơ trung cấp
              </h2>
              <div className="mt-3 h-[3px] w-16 bg-[#C62828]" aria-hidden />
              <p className="mt-5 max-w-xl text-lg text-[#555]">
                Ba cấp độ theo chuẩn HSK 3.0 với hơn 2.200 từ vựng. Bạn có thể xem từ vựng mà không cần đăng nhập.
              </p>
            </div>
          </div>

          <div className="mt-14 border-b-2 border-[#111]/15">
            {LEVELS.map((l, i) => (
              <Reveal key={l.level} delay={i * 100}>
                <div className="grid items-center gap-6 border-t-2 border-[#111]/15 py-8 md:grid-cols-[12rem_1fr_auto] md:gap-10">
                  <div className="flex items-baseline gap-4">
                    <span lang="zh-Hans" aria-hidden className="hanzi text-5xl font-black leading-none text-[#111]">{l.han}</span>
                    <span>
                      <span className="block text-xl font-bold text-[#111]">HSK {l.level}</span>
                      <span className="block text-sm text-[#777]">{l.words} từ vựng</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-[#555]">{l.desc}</p>
                    <p lang="zh-Hans" className="hanzi mt-2 flex flex-wrap gap-x-5 gap-y-1 text-2xl text-[#111]">
                      {l.sample.map((w) => <span key={w}>{w}</span>)}
                    </p>
                  </div>
                  <Link
                    href={`/words?level=${l.level}`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-none border-2 border-[#111] px-5 py-2 text-sm font-bold text-[#111] transition-all hover:bg-[#111] hover:text-white active:translate-y-px md:w-auto w-full"
                  >
                    Xem từ vựng HSK {l.level}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 06 — FINAL CTA
          Bold black section with ink brush background, vermilion seal,
          strong typography and clear call to action.
          ================================================================ */}
      <section className="relative overflow-hidden bg-[#111]">
        {/* Brush stroke background texture */}
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.15]">
          <img
            src="/images/landing/brush-strokes/cta-stroke.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            style={{
              filter: 'invert(1) contrast(1.4)',
              mixBlendMode: 'screen',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Anim view y={18} className="lg:col-span-8">
              <RedSeal char="始" size="lg" className="mb-6" />
              <p lang="zh-Hans" className="hanzi text-5xl font-black leading-none text-white/30 sm:text-7xl">
                开始学习
              </p>
              <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Bắt đầu học tiếng Trung<br className="hidden sm:block" /> ngay hôm nay
              </h2>
              <div className="mt-3 h-[3px] w-16 bg-[#C62828]" aria-hidden />
              <p className="mt-5 max-w-xl text-lg text-white/65">
                Vào học ngay, không cần chờ đợi. Tạo tài khoản khi bạn muốn lưu tiến độ và giữ chuỗi ngày học.
              </p>
            </Anim>

            <Anim view delay={160} y={18} className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-[#C62828] px-8 py-3 text-base font-bold text-white transition-all hover:bg-[#A52020] active:translate-y-px"
              >
                Học ngay
              </Link>
              <Link
                href="/login?mode=up"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 border-2 border-white/40 bg-transparent px-8 py-3 text-base font-bold text-white transition-all hover:bg-white/10 active:translate-y-px"
              >
                Tạo tài khoản
              </Link>
            </Anim>
          </div>
        </div>
      </section>
    </>
  );
}
