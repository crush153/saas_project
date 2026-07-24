'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartModal from '@/components/CartModal'; // Hoặc Modal Giỏ hàng tách riêng nếu có
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import CATEGORIES from '@/config/categories';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen text-gray-900 flex flex-col">
        {/* Header chung cho toàn bộ trang */}
        <Header categories={CATEGORIES} />

        {/* Nội dung trang (Trang chủ, Chi tiết sản phẩm, Chính sách, v.v.) */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer chung cho toàn bộ trang */}
        <Footer />

        {/* Các Modal dùng chung toàn hệ thống */}
        <CartModal />
        <AuthModal />
        <Toast />
      </body>
    </html>
  );
}
