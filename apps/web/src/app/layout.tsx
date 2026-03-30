import type { Metadata } from "next";
import { Providers } from "./providers";
import "../themes/light.css";
import "../themes/dark.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Platform — SIMMTECH",
  description: "PCB Inspection AI 재학습 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
