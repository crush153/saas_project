'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartModal from '@/components/CartModal';
import AuthModal from '@/components/AuthModal';
import UserProfileModal from '@/components/UserProfileModal';
import Toast from '@/components/Toast';
import CATEGORIES from '@/config/categories';
import { API_URL } from '@/config/api';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // Ghi nhận lượt truy cập khi đổi trang (trừ trang admin)
  useEffect(() => {
    if (!pathname || isAdminPage) return;

    // Trích xuất product_id nếu là trang sản phẩm /products/[id]
    let productId = null;
    const productMatch = pathname.match(/^\/products\/(\d+)/);
    if (productMatch) productId = productMatch[1];

    fetch(`${API_URL}analytics/track/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_path: pathname, product_id: productId }),
    }).catch(() => {});
  }, [pathname, isAdminPage]);

  return (
    <html lang="vi">
      <body className="bg-gray-50 min-h-screen text-gray-900 flex flex-col">
        {/* Ẩn Header/Footer shop khi ở trang quản trị */}
        {!isAdminPage && <Header categories={CATEGORIES} />}

        {/* Nội dung trang */}
        <main className="flex-1">
          {children}
        </main>

        {!isAdminPage && <Footer />}

        {/* Các Modal dùng chung — chỉ hiển thị ngoài trang admin */}
        {!isAdminPage && (
          <>
            <CartModal />
            <AuthModal />
            <UserProfileModal />
          </>
        )}
        <Toast />
      </body>
    </html>
  );
}