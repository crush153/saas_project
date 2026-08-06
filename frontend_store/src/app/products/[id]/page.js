'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { useAppStore } from '@/store/useAppStore';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const { addToCart, showToast, setSelectedCategory, setSearchQuery, user, accessToken, setIsAuthModalOpen, refreshAccessToken, logout } = useAppStore();
  // Giải mã params theo chuẩn Next.js App Router
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState(null);
  const [categorySlug, setCategorySlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'
  const [quantity, setQuantity] = useState(1);
  // Ảnh chính đang hiển thị (mặc định là ảnh đầu tiên)
  const [activeImage, setActiveImage] = useState('');

  // Danh sách tất cả ảnh sản phẩm (tối đa 5) — gom từ image, image2..image5
  const productImages = product
    ? [product.image, product.image2, product.image3, product.image4, product.image5]
        .filter(Boolean)
    : [];

  // Đồng bộ activeImage khi product tải xong
  useEffect(() => {
    if (product && productImages.length > 0) {
      setActiveImage(productImages[0]);
    }
  }, [product]);

  // State quản lý hiệu ứng nút bấm
  const [isAdded, setIsAdded] = useState(false);

  // State quản lý đánh giá (reviews)
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

  // Tải danh sách đánh giá khi chuyển sang tab reviews
  useEffect(() => {
    if (activeTab === 'reviews' && productId) {
      setReviewsLoading(true);
      fetch(`${API_URL}reviews/?product=${productId}`)
        .then((res) => res.json())
        .then((data) => {
          setReviews(Array.isArray(data) ? data : []);
          setReviewsLoading(false);
        })
        .catch(() => {
          setReviews([]);
          setReviewsLoading(false);
        });
    }
  }, [activeTab, productId]);

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

  // Gửi đánh giá
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewError('Vui lòng chọn số sao đánh giá (1-5).');
      return;
    }

    if (comment.length > 3000) {
      setReviewError('Nội dung bình luận tối đa 3000 ký tự.');
      return;
    }

    // Hàm gửi review (tái sử dụng khi refresh token)
    const postReview = async (token) => {
      const res = await fetch(`${API_URL}reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: productId,
          rating,
          comment,
        }),
      });
      return res;
    };

    setReviewSubmitting(true);
    try {
      let res = await postReview(accessToken);

      // Token hết hạn → refresh và gửi lại
      if (res.status === 401) {
        const refreshResult = await refreshAccessToken();
        if (refreshResult.ok) {
          res = await postReview(refreshResult.accessToken);
        } else {
          // Refresh thất bại → đăng xuất, yêu cầu đăng nhập lại
          logout();
          setIsAuthModalOpen(true);
          setReviewSubmitting(false);
          setReviewError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          return;
        }
      }

      const data = await res.json();
      if (!res.ok) {
        const msg = data.rating?.[0] || data.comment?.[0] || data.detail || 'Gửi đánh giá thất bại.';
        setReviewError(msg);
        setReviewSubmitting(false);
        return;
      }
      // Thêm review mới vào đầu danh sách
      setReviews((prev) => [data, ...prev]);
      setRating(0);
      setComment('');
      setReviewSubmitting(false);
      showToast('Đã gửi đánh giá thành công!');
    } catch {
      setReviewSubmitting(false);
      setReviewError('Không thể kết nối đến máy chủ.');
    }
  };

  // Format ngày tháng
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Render sao
  const renderStars = (value) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg leading-none ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
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
          
          {/* Cột trái: Ảnh sản phẩm + Thumb container */}
          <div>
            {/* Ảnh chính */}
            <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-4 border border-gray-100">
              <img 
                src={activeImage || product.image || 'https://via.placeholder.com/400'} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain transition-opacity duration-200"
              />
            </div>

            {/* Thumb container — hiển thị khi có từ 2 ảnh trở lên (tối đa 5) */}
            {productImages.length > 1 && (
              <div className="flex gap-2 mt-3">
                {productImages.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden bg-gray-50 flex items-center justify-center transition cursor-pointer ${
                      activeImage === img
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    title={`Ảnh ${idx + 1}`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - ảnh ${idx + 1}`} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin & Nút mua hàng */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-3xl font-extrabold text-blue-600 mb-4">
                {parseFloat(product.price).toLocaleString()}đ
              </p>
              <div className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description ? (
                  <MarkdownRenderer content={product.description} />
                ) : (
                  <p>Chưa có mô tả ngắn cho sản phẩm này.</p>
                )}
              </div>
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
                {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3 font-semibold text-gray-700 w-1/3 border-b border-gray-100">
                            {spec.key}
                          </td>
                          <td className="px-4 py-3 text-gray-600 border-b border-gray-100">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-sm text-gray-500">Chưa có thông tin kỹ thuật cho sản phẩm này.</div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Đánh giá sản phẩm</h3>

                {/* Khung gửi đánh giá — chỉ user đã đăng nhập */}
                {user ? (
                  <form onSubmit={handleSubmitReview} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                      {/* Chọn sao */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-3xl leading-none transition cursor-pointer"
                            aria-label={`${star} sao`}
                          >
                            <span className={(star <= (hoverRating || rating)) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          {rating > 0 ? `${rating}/5 sao` : 'Chọn số sao'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung bình luận</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={3000}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/3000 ký tự</p>
                    </div>

                    {reviewError && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {reviewError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-3">Bạn cần đăng nhập để gửi đánh giá.</p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      Đăng nhập
                    </button>
                  </div>
                )}

                {/* Danh sách bình luận */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-base font-semibold text-gray-800 mb-4">
                    Bình luận ({reviews.length})
                  </h4>

                  {reviewsLoading ? (
                    <p className="text-sm text-gray-500">Đang tải bình luận...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có bình luận nào cho sản phẩm này.</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {review.user_name?.[0]?.toUpperCase() || 'U'}
                              </span>
                              <span className="text-sm font-semibold text-gray-800">{review.user_name}</span>
                            </div>
                            <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                          </div>
                          <div className="mb-2">
                            {renderStars(review.rating)}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}