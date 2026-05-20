import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "akari（灯）",
  description: "高齢者施設で暮らす方の毎日を、もう少しだけあたたかく、もう少しだけ自由にする。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
