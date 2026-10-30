/** Văn bản lẫn chữ Hán và tiếng Việt (ví dụ công thức "因为 + nguyên nhân"): chữ Hán dùng font serif chữ Hán, phần còn lại giữ font chữ thường để dấu tiếng Việt hiển thị đúng */
export default function ZhMix({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/([\u3400-\u9fff\u3000-\u303f\uff00-\uffef…]+)/g).filter((p) => p !== '');
  return (
    <span className={className}>
      {parts.map((p, i) => (/^[\u3400-\u9fff\u3000-\u303f\uff00-\uffef…]+$/.test(p)
        ? <span key={i} lang="zh-Hans" className="hanzi">{p}</span>
        : <span key={i}>{p}</span>))}
    </span>
  );
}
