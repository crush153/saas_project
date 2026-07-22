'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

export default function Header({ categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();

  const { 
    cart, 
    setIsCartOpen, 
    setIsAuthModalOpen,
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    showToast,
  } = useAppStore();

  // Ô input gõ nháp — chỉ đẩy vào store (và trigger fetch) khi bấm Enter
  const [draftSearch, setDraftSearch] = useState(searchQuery);

  // Đồng bộ lại nếu searchQuery bị xóa từ nơi khác (vd: bấm về Trang chủ)
  useEffect(() => {
    setDraftSearch(searchQuery);
  }, [searchQuery]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Hàm chuyển hướng về Trang chủ nếu không đứng ở Trang chủ
  const navigateToHomeIfNeeded = () => {
    if (pathname !== '/') {
      router.push('/');
    }
  };

  // Bấm Logo về Trang chủ: luôn xóa ô tìm kiếm và reset danh mục
  const handleGoHome = () => {
    setSearchQuery('');
    setDraftSearch('');
    setSelectedCategory('');
    navigateToHomeIfNeeded();
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value) {
      router.push(`/categories/${value}`);
    } else {
      router.push('/');
    }
  };

  // Chỉ commit search khi Enter/submit form.
  // Nếu đang ở trang khác (vd trang sản phẩm), kiểm tra có kết quả trước khi rời trang —
  // không tìm thấy thì giữ nguyên trang hiện tại, chỉ báo popup.
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = draftSearch.trim();

    // Nếu đang ở trang danh mục, search trong danh mục đó
    const isCategoryPage = pathname.startsWith('/categories/');

    if (pathname === '/' || isCategoryPage) {
      setSearchQuery(query);
      return;
    }

    if (!query) {
      setSearchQuery('');
      return;
    }

    try {
      const params = [];
      if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
      params.push(`search=${encodeURIComponent(query)}`);
      const res = await fetch(`${API_URL}products/?${params.join('&')}`);
      const data = await res.json();

      if (data.length === 0) {
        showToast('Không tìm thấy sản phẩm phù hợp!'); // giữ nguyên trang hiện tại
        return;
      }

      setSearchQuery(query);
      router.push('/');
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  // Nút "x" xóa nhanh ô tìm kiếm
  const handleClearSearch = () => {
    setDraftSearch('');
    setSearchQuery('');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" onClick={handleGoHome} className="text-xl font-bold text-blue-600 tracking-wider shrink-0 cursor-pointer">
          SaaSStore
        </Link>

        {/* Cụm Tìm kiếm & Danh mục */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl flex items-center gap-2">
          <select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 text-gray-700"
          >
            {categories.map((cat) => (
              <option key={cat.slug || cat.id || cat} value={cat.slug || cat}>
                {cat.name || cat}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm... (nhấn Enter)"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {draftSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Cụm Nút Giỏ hàng & Đăng nhập */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Nút Giỏ hàng */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-700 hover:text-blue-600 transition cursor-pointer"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Nút Đăng nhập (Mở AuthModal) */}
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
          >
            Đăng nhập
          </button>

        </div>
      </div>
    </header>
  );
}