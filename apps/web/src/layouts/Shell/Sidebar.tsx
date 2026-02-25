import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-56 border-r bg-muted/30 p-4">
      <nav className="flex flex-col gap-1">
        <Link href="/dashboard" className="rounded px-3 py-2 hover:bg-muted">
          대시보드
        </Link>
        <Link href="/master/customers" className="rounded px-3 py-2 hover:bg-muted">
          고객사
        </Link>
        <Link href="/master/products" className="rounded px-3 py-2 hover:bg-muted">
          제품
        </Link>
        <Link href="/inference/jobs" className="rounded px-3 py-2 hover:bg-muted">
          추론 작업
        </Link>
        <Link href="/training/datasets" className="rounded px-3 py-2 hover:bg-muted">
          데이터셋
        </Link>
        <Link href="/settings/user" className="rounded px-3 py-2 hover:bg-muted">
          설정
        </Link>
      </nav>
    </aside>
  );
}
