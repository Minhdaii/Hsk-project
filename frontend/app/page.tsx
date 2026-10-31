import Link from 'next/link';
import DemoCard from '@/components/landing/DemoCard';
import WordOfDay from '@/components/landing/WordOfDay';
import Reveal from '@/components/Reveal';
import Anim from '@/components/motion/Anim';
import SplitWords from '@/components/motion/SplitWords';
import CountUp from '@/components/motion/CountUp';

// Mỗi tính năng gắn với một chữ Hán đúng nghĩa của nó (ghi nhớ, ngữ pháp, luyện tập, nghe-viết, lửa, lưu giữ)
const FEATURES = [
  { han: '记', title: 'Flashcard thông minh', text: 'Chọn nghĩa tiếng Việt đúng, hệ thống tự chấm và lên lịch ôn lại theo thuật toán lặp lại ngắt quãng SM-2.' },
  { han: '法', title: 'Ngữ pháp dễ hiểu', text: '39 điểm ngữ pháp HSK 1-3 giải thích bằng tiếng Việt, kèm ví dụ có pinyin và nút nghe.' },
  { han: '练', title: 'Bài tập đa dạng', text: 'Điền từ vào câu, sắp xếp câu, dịch Việt → Hán, gõ pinyin. Tự chọn số câu cho mỗi lần luyện.' },
  { han: '听写', title: 'Nghe và tập viết', text: 'Nghe phát âm từng từ, xem thứ tự nét và tự viết trực tiếp từng chữ Hán trên màn hình.' },
  { han: '火', title: 'Giữ lửa mỗi ngày', text: 'Chuỗi ngày học, điểm XP và bảng xếp hạng giúp bạn duy trì thói quen học đều đặn.' },
  { han: '收藏', title: 'Sổ tay riêng', text: 'Lưu những từ khó nhớ vào sổ tay để xem lại bất cứ lúc nào.' },
];

// Đây là một chuỗi bước thật nên dùng số Hán 一 二 三
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
      {/* ---------- Hero: bất đối xứng, chữ Hán trong ô tập viết là điểm nhớ duy nhất ---------- */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="lg:col-span-7">
          <Anim as="p" className="text-sm font-medium text-stone-600">Học tiếng Trung và ôn luyện HSK 1-3, hoàn toàn bằng tiếng Việt</Anim>
          <SplitWords as="h1" delay={120} text="Mỗi ngày một chữ, nhớ lâu hơn." className="mt-4 text-balance text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.5rem]" />
          <Anim as="p" delay={560} className="mt-5 max-w-xl text-lg text-stone-700">
            Hơn 2.200 từ vựng và 39 điểm ngữ pháp, học bằng flashcard lặp lại ngắt quãng, bài tập, nghe phát âm và tập viết từng nét.
          </Anim>
          <Anim delay={680} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="btn-primary !min-h-[52px] !px-8 text-base">Bắt đầu học</Link>
            <Link href="/words" className="btn-ghost !min-h-[52px] !px-7 text-base">Khám phá kho từ vựng</Link>
          </Anim>
          <Anim as="dl" delay={800} className="mt-10 hidden max-w-lg divide-x divide-ink/15 border-y border-ink/15 sm:flex">
            {([[2200, '+', 'từ vựng'], [39, '', 'điểm ngữ pháp'], [4, '', 'dạng bài tập']] as const).map(([n, suf, l], i) => (
              <div key={l} className={`flex-1 py-3 ${i ? 'pl-4' : 'pr-4'}`}><dt className="text-2xl font-bold"><CountUp to={n} suffix={suf} /></dt><dd className="text-sm text-stone-600">{l}</dd></div>
            ))}
          </Anim>
        </div>

        <WordOfDay />
      </section>

      {/* ---------- Thẻ học thật trông thế nào ---------- */}
      <section className="border-t border-ink/15 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Mỗi từ là một tấm thẻ</h2>
            <p className="mt-4 max-w-md text-lg text-stone-700">Chữ Hán đủ lớn để nhận mặt chữ. Chọn nghĩa đúng, thẻ lật ra pinyin có dấu thanh, nghĩa tiếng Việt, Hán Việt và câu ví dụ có bản dịch.</p>
            <p className="mt-3 max-w-md text-stone-600">Thử lật tấm thẻ mẫu bên cạnh. Trên điện thoại, bạn chạm để lật và vuốt để sang thẻ kế tiếp.</p>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7"><DemoCard /></Reveal>
        </div>
      </section>

      {/* ---------- Tính năng: mục lục biên tập, không phải lưới thẻ ---------- */}
      <section id="tinh-nang" className="scroll-mt-20 border-t border-ink/15 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Mọi thứ cần để học tiếng Trung đều ở một nơi</h2>
          <Anim as="ul" view each={70} y={16} className="mt-10 grid border-b border-ink/15 md:grid-cols-2 md:gap-x-12">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-5 border-t border-ink/15 py-6">
                <span lang="zh-Hans" aria-hidden className="hanzi flex h-14 w-[4.25rem] shrink-0 items-center justify-center text-4xl leading-none">{f.han}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-stone-700">{f.text}</p>
                </div>
              </li>
            ))}
          </Anim>
        </div>
      </section>

      {/* ---------- Cách học ---------- */}
      <section id="cach-hoc" className="scroll-mt-20 border-t border-ink/15 py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:col-span-4">Ba bước, mỗi ngày một chút</h2>
          <ol className="lg:col-span-7 lg:col-start-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.han} delay={i * 80}>
                <li className="flex items-start gap-6 border-t border-ink/15 py-7 first:border-t-0 first:pt-0">
                  <span lang="zh-Hans" aria-hidden className="hanzi w-12 shrink-0 text-5xl leading-none text-brand-ink">{s.han}</span>
                  <div>
                    <h3 className="text-xl font-bold">{s.title}</h3>
                    <p className="mt-1.5 max-w-lg text-stone-700">{s.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Cấp độ ---------- */}
      <section id="cap-do" className="scroll-mt-20 border-t border-ink/15 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Từ nhập môn đến sơ trung cấp</h2>
          <p className="mt-3 max-w-xl text-stone-700">Ba cấp độ theo chuẩn HSK 3.0 với hơn 2.200 từ vựng. Bạn có thể xem từ vựng mà không cần đăng nhập.</p>
          <div className="mt-10 border-b border-ink/15">
            {LEVELS.map((l, i) => (
              <Reveal key={l.level} delay={i * 80}>
                <div className="grid items-center gap-4 border-t border-ink/15 py-7 md:grid-cols-[11rem_1fr_auto] md:gap-8">
                  <div className="flex items-baseline gap-3">
                    <span lang="zh-Hans" aria-hidden className="hanzi text-4xl leading-none">{l.han}</span>
                    <span><span className="block text-xl font-bold">HSK {l.level}</span><span className="block text-sm text-stone-600">{l.words} từ vựng</span></span>
                  </div>
                  <div>
                    <p className="text-stone-700">{l.desc}</p>
                    <p lang="zh-Hans" className="hanzi mt-2 flex flex-wrap gap-x-5 gap-y-1 text-2xl">{l.sample.map((w) => <span key={w}>{w}</span>)}</p>
                  </div>
                  <Link href={`/words?level=${l.level}`} className="btn-ghost w-full md:w-auto">Xem từ vựng HSK {l.level}</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Kêu gọi hành động ---------- */}
      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:py-20">
          <Anim view y={18} className="lg:col-span-8">
            <p lang="zh-Hans" className="hanzi text-5xl leading-none text-ivory/90 sm:text-6xl">开始</p>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">Bắt đầu học tiếng Trung ngay hôm nay</h2>
            <p className="mt-3 max-w-xl text-ivory/80">Vào học ngay, không cần chờ đợi. Tạo tài khoản khi bạn muốn lưu tiến độ và giữ chuỗi ngày học.</p>
          </Anim>
          <Anim view delay={140} y={18} className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col">
            <Link href="/dashboard" className="btn-primary !min-h-[52px] text-base">Học ngay</Link>
            <Link href="/login?mode=up" className="btn !min-h-[52px] border border-ivory/40 text-base text-ivory hover:bg-white/10">Tạo tài khoản</Link>
          </Anim>
        </div>
      </section>
    </>
  );
}
