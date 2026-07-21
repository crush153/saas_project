'use client';

import Header from '@/components/Header';
import CartModal from '@/components/CartModal'; // Hoặc Modal Giỏ hàng tách riêng nếu có
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        {/* Header chung cho toàn bộ trang */}
        <Header />

        {/* Nội dung trang (Trang chủ, Chi tiết sản phẩm, Chính sách, v.v.) */}
        {children}

        {/* Các Modal dùng chung toàn hệ thống */}
        <CartModal />
        <AuthModal />
        <Toast />
      </body>
    </html>
  );
}