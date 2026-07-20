'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Header({ onSearch, onCartToggle, cartCount }) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [search, setSearch] = useState('');

  const categories = [
    { slug: 'thoi-trang', name: 'Thời trang' },
    { slug: 'dien-tu', name: 'Điện tử' },
    { slug: 'gia-dung', name: 'Gia dụng' },
    { slug: 'sach-truyen', name: 'Sách & Truyện' },
  ];

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(search.trim());
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-wider shrink-0 cursor-pointer">
          SaaSStore
        </Link>

        {/* Nút Danh mục */}
        <div className="relative shrink-0">
          <button 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Danh mục
            <svg className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-50">
              <button 
                onClick={() => { setIsCategoryOpen(false); if(onSearch) onSearch(''); }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Tất cả sản phẩm
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.slug} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => { setIsCategoryOpen(false); if(onSearch) onSearch(cat.slug, true); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ô Tìm kiếm */}
        <div className="flex-1 max-w-md relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm (nhấn Enter)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Cụm chức năng phải */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition cursor-pointer">Đăng nhập</Link>
          
          {/* Nút Giỏ hàng kích hoạt Modal */}
          <button 
            onClick={onCartToggle}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
            Giỏ hàng ({cartCount})
          </button>
        </div>

      </div>
    </header>
  );
}