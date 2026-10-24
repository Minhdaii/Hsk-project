'use client';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { useUser } from '@/lib/useUser';
import { useStats } from '@/lib/useStats';

type Stage = {
  id: number;
  hanzi: string;
  title: string;
  desc: string;
  wordsCount: number;
  level: number;
  status: 'completed' | 'current' | 'available' | 'locked';
  lessons: { title: string; desc: string; done?: boolean }[];
};

const STAGES: Stage[] = [
  {
    id: 1,
    hanzi: '一',
    title: 'Làm quen với tiếng Trung',
    desc: 'Hệ thống ngữ âm pinyin, 4 thanh điệu, quy tắc biến điệu và các nét bút thuận cơ bản.',
    wordsCount: 25,
    level: 1,
    status: 'completed',
    lessons: [
      { title: 'Bảng phiên âm pinyin & Thanh mẫu', desc: 'Nhận diện nguyên âm và phụ âm chuẩn', done: true },
      { title: '4 thanh điệu & Thanh nhẹ', desc: 'Quy tắc cao độ và cách phát âm không dấu', done: true },
      { title: '8 nét chữ Hán cơ bản & Bút thuận', desc: 'Thứ tự từ trên xuống dưới, từ trái sang phải', done: true },
    ],
  },
  {
    id: 2,
    hanzi: '二',
    title: 'Chào hỏi và giới thiệu bản thân',
    desc: 'Chào hỏi lịch sự, cảm ơn, xin lỗi, tự giới thiệu tên tuổi, quốc tịch và nghề nghiệp.',
    wordsCount: 45,
    level: 1,
    status: 'current',
    lessons: [
      { title: 'Chào hỏi căn bản (你好, 您好, 再见)', desc: 'Giao tiếp lịch sự khi gặp mặt và tạm biệt', done: true },
      { title: 'Giới thiệu tên họ (我叫..., 姓...)', desc: 'Hỏi tên và giới thiệu bản thân', done: false },
      { title: 'Quốc tịch & Ngôn ngữ (中国人, 越南人)', desc: 'Tôi là người Việt Nam, học tiếng Trung', done: false },
    ],
  },
  {
    id: 3,
    hanzi: '三',
    title: 'Số đếm, thời gian và lịch ngày',
    desc: 'Đếm số từ 1 đến 100, nói giờ giấc, ngày tháng năm và các thứ trong tuần.',
    wordsCount: 50,
    level: 1,
    status: 'available',
    lessons: [
      { title: 'Số đếm 1–100 & Tiền tệ', desc: 'Quy tắc ghép số và các đơn vị đếm thông dụng' },
      { title: 'Hỏi & Xem giờ (几点, 半, 刻)', desc: 'Bây giờ là mấy giờ? Mấy giờ bạn đi học?' },
      { title: 'Ngày tháng & Thứ trong tuần', desc: 'Hôm nay ngày mấy? Thứ mấy trong tuần?' },
    ],
  },
  {
    id: 4,
    hanzi: '四',
    title: 'Gia đình và các mối quan hệ',
    desc: 'Xưng hô trong gia đình, giới thiệu bạn bè, đồng nghiệp và hỏi thăm người thân.',
    wordsCount: 55,
    level: 1,
    status: 'available',
    lessons: [
      { title: 'Các thành viên gia đình (爸爸, 妈妈...)', desc: 'Ba mẹ, anh chị em và số lượng người trong nhà' },
      { title: 'Bạn bè & Đồng nghiệp (朋友, 同学, 同事)', desc: 'Mối quan hệ trường học và công sở' },
      { title: 'Hỏi thăm tuổi tác & Tình trạng', desc: 'Năm nay bạn bao nhiêu tuổi?' },
    ],
  },
  {
    id: 5,
    hanzi: '五',
    title: 'Ăn uống và mua sắm',
    desc: 'Gọi món tại nhà hàng, hỏi giá cả, mặc cả đơn giản và đi siêu thị.',
    wordsCount: 65,
    level: 2,
    status: 'available',
    lessons: [
      { title: 'Món ăn & Đồ uống phổ biến', desc: 'Cơm, mì, nước lọc, trà, cà phê' },
      { title: 'Hỏi giá tiền (多少钱, 块, 元)', desc: 'Cái này bao nhiêu tiền? Đắt quá, bớt chút nhé!' },
      { title: 'Thanh toán & Đơn vị lượng từ', desc: 'Thanh toán tiền mặt, quét mã, số lượng cái/cốc' },
    ],
  },
  {
    id: 6,
    hanzi: '六',
    title: 'Địa điểm và phương hướng',
    desc: 'Hỏi đường, chỉ hướng rẽ, đi các phương tiện công cộng như xe buýt, tàu điện.',
    wordsCount: 60,
    level: 2,
    status: 'available',
    lessons: [
      { title: 'Các địa điểm thông dụng (学校, 医院, 银行)', desc: 'Trường học, bệnh viện, ngân hàng, ga tàu' },
      { title: 'Phương hướng & Vị trí (左, 右, 前, 后)', desc: 'Bên trái, bên phải, phía trước, đằng sau' },
      { title: 'Phương tiện đi lại (出租车, 地铁, 公共汽车)', desc: 'Đi taxi, tàu điện ngầm, xe buýt' },
    ],
  },
  {
    id: 7,
    hanzi: '七',
    title: 'Sinh hoạt hằng ngày & Sở thích',
    desc: 'Kể về lịch trình trong ngày, các hoạt động giải trí, thể thao và sở thích cá nhân.',
    wordsCount: 70,
    level: 2,
    status: 'available',
    lessons: [
      { title: 'Lịch trình một ngày (起床, 睡觉, 上班)', desc: 'Thức dậy, ăn sáng, đi làm, đi ngủ' },
      { title: 'Thể thao & Giải trí (看电影, 听音乐, 游泳)', desc: 'Xem phim, nghe nhạc, chơi bóng rổ' },
      { title: 'Diễn đạt sở thích & Thói quen', desc: 'Bạn thích làm gì vào cuối tuần?' },
    ],
  },
  {
    id: 8,
    hanzi: '八',
    title: 'Sức khỏe, cảm xúc và thời tiết',
    desc: 'Bày tỏ cảm xúc vui buồn, miêu tả triệu chứng ốm sốt và diễn đạt thời tiết.',
    wordsCount: 80,
    level: 3,
    status: 'available',
    lessons: [
      { title: 'Cảm xúc & Tâm trạng (高兴, 难过, 生气)', desc: 'Hôm nay tâm trạng tôi rất tốt' },
      { title: 'Sức khỏe & Đi khám bác sĩ (头疼, 感冒, 发烧)', desc: 'Bị đau đầu, cảm cúm, sốt nhẹ' },
      { title: 'Thời tiết 4 mùa (晴天, 下雨, 冷, 热)', desc: 'Hôm nay trời nắng hay mưa? Nóng hay lạnh?' },
    ],
  },
  {
    id: 9,
    hanzi: '九',
    title: 'Giao tiếp trong các tình huống thực tế',
    desc: 'Đặt phòng khách sạn, làm thủ tục sân bay, phỏng vấn xin việc và đàm thoại đời sống.',
    wordsCount: 90,
    level: 3,
    status: 'available',
    lessons: [
      { title: 'Khách sạn & Du lịch (预订, 入住, 退房)', desc: 'Đặt phòng, nhận phòng và trả phòng' },
      { title: 'Sân bay & Nhập cảnh (护照, 机票, 登机)', desc: 'Hộ chiếu, vé máy bay và làm thủ tục' },
      { title: 'Phỏng vấn & Bày tỏ quan điểm cá nhân', desc: 'Giới thiệu kinh nghiệm và mong muốn' },
    ],
  },
];

export default function LearningPathPage() {
  const { user } = useUser();
  const { stats } = useStats(!!user);

  const completedStages = STAGES.filter((s) => s.status === 'completed').length;
  const totalStages = STAGES.length;
  const progressPercent = Math.round((completedStages / totalStages) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        glyph="程"
        title="Lộ trình học tiếng Trung từ con số 0"
        subtitle="9 chặng học tập được thiết kế lũy tiến từ nhập môn đến giao tiếp thực tế"
        actions={
          <Link href="/study" className="btn-editorial-primary text-xs">
            Tiếp tục bài học hiện tại →
          </Link>
        }
      />

      {/* Thẻ tóm tắt tiến độ toàn lộ trình */}
      <section className="editorial-card p-5 sm:p-6" aria-labelledby="tong-quan-lo-trinh">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="editorial-badge">TIẾN ĐỘ LỘ TRÌNH</span>
            <h2 id="tong-quan-lo-trinh" className="mt-1 text-base font-bold text-[#302B3D] sm:text-lg">
              Đã hoàn thành {completedStages} / {totalStages} chặng kiến thức
            </h2>
            <p className="mt-0.5 text-xs text-[#777184]">
              {user ? `Chuỗi học tập: ${stats?.streak ?? 0} ngày liên tiếp` : 'Đăng nhập để lưu tiến độ hoàn thành các bài học'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[#55449E]">{progressPercent}%</span>
              <span className="block text-[10px] text-[#777184]">Hoàn thành</span>
            </div>
            <div className="h-10 w-24 overflow-hidden rounded-full bg-[#EEE9FC] p-1">
              <div
                className="h-full rounded-full bg-[#A99AE8] transition-all duration-700"
                style={{ width: `${Math.max(10, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách 9 chặng học tập */}
      <div className="space-y-4">
        {STAGES.map((s) => {
          const isCurrent = s.status === 'current';
          const isDone = s.status === 'completed';

          return (
            <div
              key={s.id}
              className={`editorial-card transition-all ${
                isCurrent
                  ? 'border-2 border-[#A99AE8] bg-white shadow-sm ring-2 ring-[#EEE9FC]'
                  : 'hover:border-[#D5CEF3]'
              }`}
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Số Hán đại tự */}
                  <span
                    lang="zh-Hans"
                    aria-hidden
                    className={`hanzi flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-bold shadow-xs ${
                      isDone
                        ? 'border border-[#D8CFF2] bg-[#EEE9FC] text-[#55449E]'
                        : isCurrent
                        ? 'bg-[#A99AE8] text-[#241D45]'
                        : 'border border-[#E7E2F0] bg-[#FAF8F5] text-[#777184]'
                    }`}
                  >
                    {s.hanzi}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="editorial-badge">CHẶNG {s.id}</span>
                      <span className="editorial-badge-stone">HSK Cấp {s.level}</span>
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          ✓ Đã hoàn thành
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded bg-[#EEE9FC] px-2 py-0.5 text-xs font-bold text-[#55449E]">
                          ● Đang học chặng này
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1.5 text-base font-bold text-[#302B3D] sm:text-lg">
                      {s.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#777184]">
                      {s.desc}
                    </p>

                    {/* Danh sách bài học nhỏ trong chặng */}
                    <div className="mt-3.5 divide-y divide-[#F0ECF6] rounded-lg border border-[#E7E2F0] bg-[#FAF9FD] px-3">
                      {s.lessons.map((lesson, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                lesson.done ? 'bg-emerald-500' : isCurrent && idx === 1 ? 'bg-[#A99AE8]' : 'bg-stone-300'
                              }`}
                            />
                            <span className={`font-medium ${lesson.done ? 'text-stone-500 line-through' : 'text-[#302B3D]'}`}>
                              {lesson.title}
                            </span>
                          </div>
                          <span className="hidden text-[11px] text-[#777184] sm:inline">
                            {lesson.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end pt-2 sm:pt-0">
                  <Link
                    href={`/study?level=${s.level}`}
                    className={`w-full sm:w-auto text-center text-xs ${
                      isCurrent
                        ? 'btn-editorial-primary !min-h-[40px] !px-5'
                        : isDone
                        ? 'btn-editorial-ghost !min-h-[40px] !px-4'
                        : 'btn-editorial-soft !min-h-[40px] !px-4'
                    }`}
                  >
                    {isCurrent ? 'Học tiếp bài này' : isDone ? 'Ôn lại chặng' : 'Bắt đầu học'}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
