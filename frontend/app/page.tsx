import Link from 'next/link';
import DemoCard from '@/components/landing/DemoCard';
import Reveal from '@/components/Reveal';
import Icon, { type IconName } from '@/components/Icon';
import Flame from '@/components/Flame';
import WeekFlames from '@/components/WeekFlames';

const FEATURES: { icon: IconName; title: string; text: string; grad: string }[] = [
  { icon: 'cards', title: 'Flashcard thông minh', text: 'Chọn nghĩa tiếng Việt đúng, hệ thống tự chấm và lên lịch ôn lại theo thuật toán lặp lại ngắt quãng SM-2.', grad: 'from-rose-500 to-rose-700' },
  { icon: 'grammar', title: 'Ngữ pháp dễ hiểu', text: '39 điểm ngữ pháp HSK 1-3 giải thích bằng tiếng Việt, kèm ví dụ có pinyin và nút nghe.', grad: 'from-amber-500 to-orange-600' },
  { icon: 'pencil', title: 'Bài tập đa dạng', text: 'Điền từ vào câu, sắp xếp câu, dịch Việt → Hán, gõ pinyin. Tự chọn số câu cho mỗi lần luyện.', grad: 'from-sky-500 to-sky-700' },
  { icon: 'speaker', title: 'Nghe và tập viết', text: 'Nghe phát âm từng từ, xem thứ tự nét và tự viết trực tiếp từng chữ Hán trên màn hình.', grad: 'from-violet-500 to-violet-700' },
  { icon: 'trophy', title: 'Giữ lửa mỗi ngày', text: 'Chuỗi ngày học, điểm XP và bảng xếp hạng giúp bạn duy trì thói quen học đều đặn.', grad: 'from-emerald-500 to-emerald-700' },
  { icon: 'star', title: 'Sổ tay riêng', text: 'Lưu những từ khó nhớ vào sổ tay để xem lại bất cứ lúc nào.', grad: 'from-yellow-500 to-amber-600' },
];

const STEPS = [
  { n: 1, title: 'Học từ mới mỗi ngày', text: 'Mỗi lượt có 10 từ mới theo tần suất sử dụng, từ thông dụng nhất đến ít gặp hơn.' },
  { n: 2, title: 'Ôn đúng lúc sắp quên', text: 'Từ bạn trả lời đúng sẽ được hẹn ôn lại sau 1, 6 ngày rồi xa dần. Trả lời sai thì quay lại ngay trong buổi học.' },
  { n: 3, title: 'Luyện tập và giữ lửa', text: 'Làm bài tập, học ngữ pháp và giữ chuỗi ngày học để biến kiến thức thành phản xạ.' },
];

const LEVELS = [
  { level: 1, words: 506, grad: 'from-emerald-500 to-emerald-700', glyph: '你', desc: 'Chào hỏi, số đếm, gia đình, đồ ăn thức uống.', sample: ['我', '你好', '谢谢', '学生', '朋友'] },
  { level: 2, words: 750, grad: 'from-sky-500 to-sky-700', glyph: '学', desc: 'Giao tiếp hằng ngày, mua sắm, thời gian, sức khỏe.', sample: ['已经', '因为', '旅游', '准备', '希望'] },
  { level: 3, words: 953, grad: 'from-rose-500 to-rose-700', glyph: '说', desc: 'Công việc, du lịch, học tập, bày tỏ ý kiến.', sample: ['经验', '环境', '机会', '解决', '同意'] },
];

const DEMO_WEEK = ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09', '2026-01-10', '2026-01-11']
  .map((date, i) => ({ date, reviews: i === 3 ? 0 : 12 + i }));

export default function LandingPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-20 h-[26rem] w-[26rem] rounded-full bg-amber-300/30 blur-3xl" />
        <span aria-hidden className="hanzi pointer-events-none absolute right-[8%] top-10 hidden animate-float select-none text-[14rem] leading-none text-brand/[0.06] lg:block">学</span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
          <div>
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3.5 py-1.5 text-sm font-semibold text-brand">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />Chuẩn HSK 3.0 · Miễn phí 100%
            </span>
            <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.12] tracking-tight [animation-delay:80ms] sm:text-5xl lg:text-[3.4rem]">
              Chinh phục{' '}<span className="whitespace-nowrap bg-gradient-to-r from-brand to-orange-500 bg-clip-text text-transparent">HSK 1-3</span>{' '}mỗi ngày, nhẹ nhàng mà nhớ lâu
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-lg text-stone-600 [animation-delay:160ms]">
              Học hơn 2.200 từ vựng và 39 điểm ngữ pháp bằng flashcard lặp lại ngắt quãng, bài tập đa dạng, nghe phát âm và tập viết chữ Hán, tất cả bằng tiếng Việt.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/dashboard" className="btn-primary !px-8 !py-4 text-lg">Học ngay <Icon name="arrow" className="h-5 w-5" /></Link>
              <Link href="/words" className="btn-ghost !px-7 !py-4 text-lg">Xem từ vựng</Link>
            </div>
            <dl className="mt-10 grid max-w-md animate-fade-up grid-cols-3 gap-4 [animation-delay:320ms]">
              {[['2.200+', 'từ vựng'], ['39', 'điểm ngữ pháp'], ['4', 'dạng bài tập']].map(([n, l]) => (
                <div key={l}><dt className="text-3xl font-extrabold text-brand">{n}</dt><dd className="text-sm text-stone-500">{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className="animate-fade-up [animation-delay:200ms]"><DemoCard /></div>
        </div>
      </section>

      {/* ---------- Tính năng ---------- */}
      <section id="tinh-nang" className="scroll-mt-20 border-y border-stone-200/70 bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Tính năng</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Mọi thứ bạn cần để học tiếng Trung hiệu quả</h2>
            <p className="mt-3 text-stone-600">Từ ghi nhớ từ vựng đến luyện ngữ pháp và giữ động lực, gói gọn trong một ứng dụng.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="card group h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${f.grad}`}><Icon name={f.icon} className="h-6 w-6" /></span>
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-stone-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Cách học ---------- */}
      <section id="cach-hoc" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Cách học</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Ba bước đơn giản, mỗi ngày một chút</h2>
          </Reveal>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div aria-hidden className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 bg-gradient-to-r from-brand/10 via-brand/40 to-brand/10 md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[#7a1f16] text-2xl font-extrabold text-white shadow-[0_12px_24px_-10px_rgba(192,57,43,0.9)]">{s.n}</span>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-stone-600">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Chuỗi ngày học ---------- */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-600">Duy trì động lực</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Giữ ngọn lửa học tập cháy mỗi ngày</h2>
            <p className="mt-4 text-lg text-stone-600">Hoàn thành một bài học để thắp sáng ngọn lửa của ngày hôm nay. Bỏ lỡ một ngày, lửa sẽ tắt, nhưng bạn luôn có thể quay lại và thắp lại.</p>
            <ul className="mt-6 space-y-3">
              {['Chuỗi ngày học cập nhật ngay sau từng thẻ', 'Điểm XP mỗi lượt ôn và bảng xếp hạng', 'Mục tiêu hằng ngày và biểu đồ 7 ngày gần nhất'].map((t) => (
                <li key={t} className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600"><Icon name="check" className="h-4 w-4" /></span><span className="text-stone-700">{t}</span></li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="card mx-auto w-full max-w-md space-y-5 border-orange-200 bg-gradient-to-br from-orange-50/80 to-white shadow-soft">
              <div className="flex items-center gap-4">
                <Flame size={84} state="lit" />
                <div>
                  <div className="flex items-baseline gap-1.5"><span className="text-6xl font-extrabold leading-none text-orange-500">7</span><span className="font-medium text-stone-500">ngày</span></div>
                  <div className="mt-1 font-bold">Bạn đã giữ lửa hôm nay!</div>
                  <p className="text-sm text-stone-600">Ngày mai quay lại để nối dài chuỗi.</p>
                </div>
              </div>
              <WeekFlames days={DEMO_WEEK} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Cấp độ ---------- */}
      <section id="cap-do" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand">Cấp độ</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Từ nhập môn đến sơ trung cấp</h2>
            <p className="mt-3 text-stone-600">Ba cấp độ theo chuẩn HSK 3.0 với hơn 2.200 từ vựng. Bạn có thể xem từ vựng mà không cần đăng nhập.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {LEVELS.map((l, i) => (
              <Reveal key={l.level} delay={i * 100}>
                <div className="card group flex h-full flex-col overflow-hidden !p-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft">
                  <div className={`relative h-28 bg-gradient-to-br ${l.grad}`}>
                    <span aria-hidden className="hanzi absolute -bottom-4 right-4 select-none text-9xl leading-none text-white/25 transition-transform duration-500 group-hover:scale-110">{l.glyph}</span>
                    <div className="absolute bottom-3 left-5"><div className="text-3xl font-extrabold text-white">HSK {l.level}</div><div className="text-sm text-white/85">{l.words} từ vựng</div></div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-stone-600">{l.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{l.sample.map((w) => <span key={w} className="hanzi rounded-lg bg-stone-100 px-2.5 py-1 text-lg">{w}</span>)}</div>
                    <Link href={`/words?level=${l.level}`} className="btn-ghost mt-auto !mt-6 w-full">Xem từ vựng HSK {l.level}</Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Kêu gọi hành động ---------- */}
      <section className="px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-[#a8301f] to-[#6d1b13] px-6 py-14 text-center text-white shadow-soft sm:px-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
            <span aria-hidden className="hanzi pointer-events-none absolute -left-4 -top-10 select-none text-[12rem] leading-none text-white/10">汉</span>
            <span aria-hidden className="hanzi pointer-events-none absolute -bottom-12 -right-4 animate-float select-none text-[13rem] leading-none text-white/10">语</span>
            <div className="relative">
              <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">Bắt đầu học tiếng Trung ngay hôm nay</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Vào học ngay, không cần chờ đợi. Tạo tài khoản khi bạn muốn lưu tiến độ và giữ chuỗi ngày học.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/dashboard" className="btn bg-white !px-8 !py-4 text-lg text-brand shadow-sm hover:-translate-y-px hover:bg-brand-soft">Học ngay</Link>
                <Link href="/login?mode=up" className="btn border border-white/40 !px-7 !py-4 text-lg text-white hover:bg-white/10">Tạo tài khoản</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
