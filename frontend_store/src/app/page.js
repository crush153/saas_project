'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_URL } from '@/config/api';
import Header from '@/components/Header';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // Quản lý giỏ hàng thực tế dạng: [{product_id, name, price, quantity}]
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

// Tải danh sách sản phẩm ban đầu
  useEffect(() => {
    fetchProducts('');
  }, []);

  const fetchProducts = (query, isCategory = false) => {
    setLoading(true);
    let url = `${API_URL}products/?`;
    if (query) {
      url += isCategory ? `category=${query}` : `search=${encodeURIComponent(query)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Logic xử lý tìm kiếm không đổi giao diện khi trống kết quả
  const handleSearch = async (keyword, isCategory = false) => {
    if (!keyword) {
      fetchProducts(''); // Nếu rỗng thì reset về danh sách mặc định
      return;
    }

    let url = `${API_URL}products/?`;
    url += isCategory ? `category=${keyword}` : `search=${encodeURIComponent(keyword)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.length === 0) {
        // Hiện popup thông báo và ĐỨNG IM giao diện (không setProducts)
        alert('Không tìm thấy sản phẩm, vui lòng kiểm tra lại từ khóa');
      } else {
        // Có sản phẩm mới tiến hành cập nhật UI
        setProducts(data);
      }
    } catch (error) {
      console.error('Lỗi kết nối API tìm kiếm');
    }
  };

  // 2. Logic xử lý giỏ hàng
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // 3. Gửi đơn hàng lên Backend
  const handleOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    const orderData = {
      customer_name: customer.name,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      items: cart.map(({ product_id, quantity }) => ({ product_id, quantity }))
    };

    try {
      const response = await fetch(`${API_URL}orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Đặt hàng thành công! Đơn hàng đã được lưu và tính tiền tự động.');
        setCart([]);
        setCustomer({ name: '', phone: '', address: '' });
        setIsCartOpen(false);
      } else {
        alert('Có lỗi xảy ra khi gửi đơn hàng.');
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <>
      <Header 
        onSearch={handleSearch} 
        onCartToggle={() => setIsCartOpen(!isCartOpen)} 
        cartCount={getCartCount()} 
      />

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Sản phẩm có sẵn</h2>
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between shadow-sm bg-white">
                <img src={p.image || 'https://via.placeholder.com/150'} alt={p.name} className="w-full h-48 object-cover rounded-md mb-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                  <p className="text-gray-500 text-sm my-1 line-clamp-2">{p.description}</p>
                  <p className="text-green-600 font-bold my-2">{parseFloat(p.price).toLocaleString()}đ</p>
                </div>
                <button onClick={() => addToCart(p)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition mt-2 cursor-pointer">
                  Thêm vào giỏ hàng
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* COMPONENT MODAL GIỎ HÀNG */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Giỏ hàng của bạn</h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nội dung Modal (Scrollable nếu quá dài) */}
            <div className="p-6 overflow-y-auto flex-1">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Chưa có sản phẩm nào trong giỏ hàng.</p>
              ) : (
                <div className="mb-6 space-y-3">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm text-gray-700 border-b border-gray-50 pb-2">
                      <span>{item.name} <strong className="text-gray-400">x{item.quantity}</strong></span>
                      <span className="font-medium">{(parseFloat(item.price) * item.quantity).toLocaleString()}đ</span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-bold text-gray-900 text-base">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{calculateTotal().toLocaleString()}đ</span>
                  </div>
                </div>
              )}

              {/* Form đặt hàng */}
              <h3 className="text-lg font-bold mb-3 text-gray-800 border-t pt-4">Thông tin giao hàng (COD)</h3>
              <form onSubmit={handleOrder} className="space-y-4">
                <input type="text" placeholder="Họ và tên" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required className="w-full border p-2 rounded-md bg-white text-gray-900 focus:outline-blue-500" />
                <input type="text" placeholder="Số điện thoại" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} required className="w-full border p-2 rounded-md bg-white text-gray-900 focus:outline-blue-500" />
                <textarea placeholder="Địa chỉ nhận hàng chi tiết" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} required className="w-full border p-2 rounded-md bg-white text-gray-900 h-20 focus:outline-blue-500" />
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition shadow cursor-pointer">
                  Xác nhận đặt hàng
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}