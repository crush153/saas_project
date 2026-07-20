import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SaaS Store",
  description: "Hệ thống bán hàng single-store gọn nhẹ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased bg-gray-50">
        {children} {/* Chỉ render children, không để Header ở đây nữa */}
      </body>
    </html>
  );
}