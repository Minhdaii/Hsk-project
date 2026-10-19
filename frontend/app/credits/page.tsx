export default function Credits() {
  return (
    <div className="prose max-w-none space-y-4">
      <h1 className="text-2xl font-bold">Nguồn dữ liệu</h1>
      <ul className="list-disc space-y-2 pl-6">
        <li><b>Danh sách từ HSK</b>: <a className="underline" href="https://github.com/drkameleon/complete-hsk-vocabulary">complete-hsk-vocabulary</a> (giấy phép MIT).</li>
        <li><b>Nghĩa tiếng Việt</b>: <a className="underline" href="https://github.com/ph0ngp/CVDICT">CVDICT</a> của Phong Phan, giấy phép CC BY-SA 4.0, dựa trên CC-CEDICT.</li>
        <li><b>CC-CEDICT</b>: <a className="underline" href="https://cc-cedict.org">cc-cedict.org</a>, giấy phép CC BY-SA 3.0.</li>
        <li><b>Thứ tự nét</b>: thư viện <a className="underline" href="https://hanziwriter.org">Hanzi Writer</a> (MIT).</li>
        <li><b>Câu ví dụ</b> (nếu có): <a className="underline" href="https://tatoeba.org">Tatoeba</a>, giấy phép CC BY 2.0 FR.</li>
      </ul>
    </div>
  );
}
