import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrossRoutine — 루틴 기반 운동 기록",
  description: "편리하게 기록하고 효율적으로 관리하기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-100 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
