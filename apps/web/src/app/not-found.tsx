import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2>페이지를 찾을 수 없습니다</h2>
      <Link href="/dashboard" className="text-primary underline">
        대시보드로 이동
      </Link>
    </div>
  );
}
