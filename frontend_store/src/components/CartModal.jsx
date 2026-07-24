'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';
import SuccessAnimation from './SuccessAnimation';

export default function CartModal() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    increaseQuantity, 
    decreaseQuantity, 
    removeFromCart,
    clearCart,
  } = useAppStore();

  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCartOpen) return null;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorMessage('Giỏ hàng của bạn đang trống!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const orderData = {
      customer_name: customer.name,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      items: cart.map(({ product_id, quantity }) => ({ product_id, quantity })),
    };

    try {
      const response = await fetch(`${API_URL}orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        setErrorMessage('Có lỗi xảy ra khi gửi đơn hàng.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Không thể kết nối đến máy chủ.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    clearCart();
    setCustomer({ name: '', phone: '', address: '' });
    setIsCartOpen(false);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity, 
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Khung Backdrop bọc ngoài để click ra ngoài đóng Modal */}
      <div 
        className="fixed inset-0" 
        onClick={() => setIsCartOpen(false)} 
      />

      {/* Slide-over Drawer Giỏ hàng */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header Giỏ hàng */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🛒 Giỏ hàng của bạn
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <span className="text-4xl">🛍️</span>
              <p className="text-sm font-medium">Giỏ hàng đang trống!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.product_id} 
                className="flex items-center gap-3 border-b border-gray-100 pb-4"
              >
                <img 
                  src={item.image || 'https://via.placeholder.com/80'} 
                  alt={item.name} 
                  className="w-16 h-16 object-contain rounded-md bg-gray-50 p-1 border border-gray-200"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
                  <p className="text-xs text-blue-600 font-bold mt-0.5">
                    {parseFloat(item.price).toLocaleString()}đ
                  </p>
                  
                  {/* Cụm Tăng / Giảm số lượng */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button 
                        onClick={() => decreaseQuantity(item.product_id)}
                        className="w-6 h-6 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => increaseQuantity(item.product_id)}
                        className="w-6 h-6 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nút Xóa */}
                <button 
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-gray-400 hover:text-red-500 text-sm p-1 transition"
                  title="Xóa sản phẩm"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: Tổng tiền + Form đặt hàng (COD) */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Tổng tiền tạm tính:</span>
              <span className="text-lg font-extrabold text-blue-600">
                {totalAmount.toLocaleString()}đ
              </span>
            </div>

            <form onSubmit={handleOrder} className="space-y-2">
              <input
                type="text"
                placeholder="Họ và tên"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                required
                className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                required
                className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Địa chỉ nhận hàng chi tiết"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                required
                className="w-full border border-gray-300 p-2 rounded-md bg-white text-sm text-gray-900 h-16 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition shadow-sm cursor-pointer"
              >
                Xác nhận đặt hàng (COD)
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {errorMessage}
        </div>
      )}

      {/* Success animation overlay */}
      {showSuccess && (
        <SuccessAnimation 
          message="Đặt hàng thành công! Cảm ơn bạn đã mua sắm!"
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
}
