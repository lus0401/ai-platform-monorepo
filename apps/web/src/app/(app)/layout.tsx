import { Shell } from "@/layouts/Shell/Shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
