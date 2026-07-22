'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';
import { useAppStore } from '@/store/useAppStore';
import { getCategoryName } from '@/config/categories';

export default function CategoryPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { searchQuery, addToCart: addToStoreCart, showToast, setSelectedCategory, setSearchQuery } = useAppStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedProductId, setAddedProductId] = useState(null);

  const categoryName = getCategoryName(slug);

  // Cập nhật store để Header dropdown hiển thị đúng danh mục
  useEffect(() => {
    setSelectedCategory(slug);
  }, [slug, setSelectedCategory]);

  useEffect(() => {
    setLoading(true);

    const params = [];
    params.push(`category=${encodeURIComponent(slug)}`);
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);

    const url = `${API_URL}products/?${params.join('&')}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, searchQuery]);

  // Thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    addToStoreCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
    showToast(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <button 
          onClick={() => { setSelectedCategory(''); setSearchQuery(''); router.push('/'); }} 
          className="hover:text-blue-600 bg-transparent border-none p-0 text-sm cursor-pointer"
        >
          Trang chủ
        </button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{categoryName}</span>
      </nav>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Danh mục: {categoryName}
      </h2>

      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Không có sản phẩm nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between shadow-sm bg-white">
              <Link href={`/products/${p.id}`} className="block group">
                <div className="w-full h-48 bg-gray-50 rounded-md mb-4 flex items-center justify-center overflow-hidden p-2">
                  <img 
                    src={p.image || 'https://via.placeholder.com/150'} 
                    alt={p.name} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">{p.name}</h3>
              </Link>
              <div>
                <p className="text-gray-500 text-sm my-1 line-clamp-2">{p.description}</p>
                <p className="text-green-600 font-bold my-2">{parseFloat(p.price).toLocaleString()}đ</p>
              </div>

              <button 
                onClick={() => handleAddToCart(p)}
                disabled={addedProductId === p.id}
                className={`w-full py-2 rounded-md transition-all duration-200 mt-2 flex items-center justify-center gap-2 font-medium cursor-pointer ${
                    addedProductId === p.id
                      ? 'bg-emerald-600 text-white scale-95' 
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white'
                }`}
              >                  
                {addedProductId === p.id ? (
                  <>
                    <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Đã thêm vào giỏ!
                  </>
                ) : (
                  'Thêm vào giỏ hàng'
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}