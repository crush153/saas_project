'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Sản phẩm', icon: '📦' },
  { href: '/admin/orders', label: 'Đơn hàng', icon: '🧾' },
  { href: '/admin/revenue', label: 'Doanh thu', icon: '💰' },
  { href: '/admin/visits', label: 'Lượt truy cập', icon: '👁️' },
  { href: '/admin/users', label: 'Người dùng', icon: '👥' },
  { href: '/admin/reviews', label: 'Đánh giá', icon: '⭐' },
  { href: '/admin/info', label: 'Thông tin', icon: 'ℹ️' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, showToast, checkSessionExpiry } = useAppStore();

  // Kiểm tra thời hạn phiên đăng nhập mỗi phút — cảnh báo khi sắp hết hạn
  useEffect(() => {
    const check = () => {
      const result = checkSessionExpiry();
      if (result && result.expired) {
        router.push('/');
      } else if (result && result.warning) {
        showToast(result.message);
      }
    };
    check();
    const interval = setInterval(check, 180000);
    return () => clearInterval(interval);
  }, []);

  // Nếu chưa đăng nhập hoặc không phải staff → chặn
  if (!user || !user.is_staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h1>
          <p className="text-sm text-gray-500 mb-6">
            Bạn cần đăng nhập bằng tài khoản có quyền quản trị (Staff status) để truy cập trang này.
          </p>
          <button
            onClick={() => {
              logout();
              router.push('/');
              showToast('Vui lòng đăng nhập bằng tài khoản quản trị.');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">⚙️ Quản trị</h1>
          <p className="text-xs text-gray-500 mt-1">SaaSStore Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.username}</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 text-center text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1.5 rounded transition"
            >
              🏠 Về shop
            </Link>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded transition cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Nội dung */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}