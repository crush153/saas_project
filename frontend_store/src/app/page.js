'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  // Đọc/ghi trực tiếp vào Zustand store — đây là nơi Header.jsx và CartModal.jsx đang dùng chung
  const { searchQuery, selectedCategory, addToCart: addToStoreCart, showToast } = useAppStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //state hiệu ứng thêm vào giỏ hàng
  const [addedProductId, setAddedProductId] = useState(null);

  // Tự động gọi lại API mỗi khi searchQuery hoặc selectedCategory thay đổi (do Header cập nhật)
  const prevSearchRef = useRef(searchQuery);

  useEffect(() => {
    const isSearchTrigger = searchQuery !== prevSearchRef.current;
    prevSearchRef.current = searchQuery;

    // Khi đổi danh mục (hoặc lần tải đầu tiên) mới hiện "Đang tải..."
    // Khi chỉ là 1 lần search, giữ nguyên giao diện cho tới khi có kết quả
    if (!isSearchTrigger) setLoading(true);

    let url = `${API_URL}products/?`;
    const params = [];
    if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
    url += params.join('&');

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0 && searchQuery) {
          // Không tìm thấy: giữ nguyên danh sách sản phẩm đang hiển thị, chỉ báo popup nhỏ
          showToast('Không tìm thấy sản phẩm phù hợp!');
        } else {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, selectedCategory]);

  // Thêm vào giỏ hàng thật sự (store dùng chung với Header/CartModal) + hiệu ứng nút bấm/toast
  const addToCart = (product) => {
    addToStoreCart(product, 1);

    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);

    showToast(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <>
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Sản phẩm có sẵn</h2>
        {loading ? (
          <p>Đang tải sản phẩm...</p>
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

                {/* Nút thêm vào giỏ hàng với hiệu ứng */}
                <button 
                  onClick={() => addToCart(p)}
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
    </>
  );
}