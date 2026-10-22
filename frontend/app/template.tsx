// Giữ file này ở dạng "trong suốt": hiệu ứng chuyển trang nằm trong AppShell để thanh bên không bị nhấp nháy
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
