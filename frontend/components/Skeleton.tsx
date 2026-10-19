/** Khung chờ có vệt sáng chạy, thay cho chữ "Đang tải…" */
export default function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-shimmer rounded-xl bg-[linear-gradient(90deg,#ece8e2_25%,#f8f5f0_50%,#ece8e2_75%)] bg-[length:200%_100%] ${className}`} />;
}

export function RowSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="space-y-2.5" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="card flex items-center gap-4 !p-3">
          <Skeleton className="h-16 w-16 shrink-0" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-3.5 w-3/4" /></div>
          <Skeleton className="h-10 w-10 !rounded-full" />
        </li>
      ))}
    </ul>
  );
}
