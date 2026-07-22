'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { useAppStore } from '@/store/useAppStore';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const { addToCart, showToast, setSelectedCategory, setSearchQuery } = useAppStore();
  // Giải mã params theo chuẩn Next.js App Router
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState(null);
  const [categorySlug, setCategorySlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'
  const [quantity, setQuantity] = useState(1);

  // State quản lý hiệu ứng nút bấm
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    // Tải thông tin chi tiết sản phẩm
    fetch(`${API_URL}products/${productId}/`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setCategorySlug(data.category || '');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        showToast('Không tìm thấy sản phẩm!');
        setTimeout(() => router.push('/'), 1500);
      });
  }, [productId]);

  const handleAddToCart = () => {
    addToCart(product, quantity);

    // Trigger đổi trạng thái nút bấm (1.5s)
    setIsAdded(true);
    setTimeout(() => {
        setIsAdded(false);
    }, 1500);

    showToast(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Chuyển hướng ngay tới trang thanh toán hoặc mở Modal giỏ hàng
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Đang chuyển hướng...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb đường dẫn */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <button 
            onClick={() => { setSelectedCategory(''); setSearchQuery(''); router.push('/'); }} 
            className="hover:text-blue-600 bg-transparent border-none p-0 text-sm cursor-pointer"
          >
            Trang chủ
          </button>
          {categorySlug && (
            <>
              <span>/</span>
              <Link 
                href={`/categories/${categorySlug}`}
                onClick={() => setSelectedCategory(categorySlug)}
                className="hover:text-blue-600"
              >
                {product.category_display || categorySlug}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        {/* Khung chính: Ảnh & Thao tác mua hàng */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Cột trái: Ảnh sản phẩm */}
          <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-4 border border-gray-100">
            <img 
              src={product.image || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Cột phải: Thông tin & Nút mua hàng */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-3xl font-extrabold text-blue-600 mb-4">
                {parseFloat(product.price).toLocaleString()}đ
              </p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description || 'Chưa có mô tả ngắn cho sản phẩm này.'}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4">
              {/* Chọn số lượng */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bộ cụm Nút bấm */}
            <div className="grid grid-cols-2 gap-4 pt-2">
                <button 
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                        isAdded 
                        ? 'bg-emerald-600 text-white scale-95' 
                        : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 active:scale-95'
                    }`}
                    >
                    {isAdded ? (
                        <>
                        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        Đã thêm vào giỏ!
                        </>
                    ) : (
                        'Thêm vào giỏ hàng'
                    )}
                </button>     
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-sm cursor-pointer"
                >
                  Mua ngay
                </button>         
            </div>
          </div>
        </div>
        </div>

        {/* Khung Tabs: Thông số chi tiết & Đánh giá */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Thanh điều hướng Tab */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button 
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-4 text-sm font-semibold transition cursor-pointer border-b-2 ${
                activeTab === 'specs' 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Thông số chi tiết
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-semibold transition cursor-pointer border-b-2 ${
                activeTab === 'reviews' 
                  ? 'border-blue-600 text-blue-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Đánh giá từ khách hàng
            </button>
          </div>

          {/* Nội dung Tab */}
          <div className="p-6">
            {activeTab === 'specs' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Thông tin kỹ thuật</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Thương hiệu</span>
                    <span className="font-medium text-gray-800">{product.brand || 'Đang cập nhật'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Xuất xứ</span>
                    <span className="font-medium text-gray-800">{product.origin || 'Chính hãng'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Bảo hành</span>
                    <span className="font-medium text-gray-800">12 Tháng</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Đánh giá sản phẩm</h3>
                <p className="text-gray-500 text-sm">Chưa có đánh giá nào cho sản phẩm này.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}