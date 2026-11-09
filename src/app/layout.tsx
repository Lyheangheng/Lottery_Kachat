import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ประกาศผลการออกรางวัลสลากกาชาด ประจำปี พ.ศ. 2570 | เหล่ากาชาดจังหวัดศรีสะเกษ",
  description: "ระบบแสดงผลการออกรางวัลสลากกาชาด งานเทศกาลปีใหม่สี่เผ่าไทยศรีสะเกษ ประจำปี พ.ศ. 2570",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-[#f4f5f7] select-none text-slate-800">
        {children}
      </body>
    </html>
  );
}

