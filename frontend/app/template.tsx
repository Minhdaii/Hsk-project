// template.tsx được dựng lại mỗi lần chuyển trang, nên mỗi trang đều có hiệu ứng hiện dần mượt mà
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
