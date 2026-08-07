'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-orange-100 text-orange-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function UserProfileModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, user, authFetch, showToast, setUser } = useAppStore();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Đồng bộ dữ liệu user khi mở modal
  useEffect(() => {
    if (isProfileModalOpen && user) {
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setError('');
      setSuccess('');
      fetchOrders();
    }
  }, [isProfileModalOpen, user]);

  if (!isProfileModalOpen) return null;

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await authFetch(`${API_URL}orders/my/`);
      if (res.ok) {
        setOrders(await res.json());
      } else {
        showToast('Không thể tải danh sách đơn hàng.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!/^\d{10}$/.test(phone)) {
      setError('Số điện thoại phải gồm đúng 10 chữ số.');
      setSaving(false);
      return;
    }
    if (!address.trim()) {
      setError('Địa chỉ giao hàng không được để trống.');
      setSaving(false);
      return;
    }

    try {
      const res = await authFetch(`${API_URL}auth/me/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, address }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setSuccess('Đã cập nhật thông tin thành công.');
        showToast('Đã cập nhật thông tin.');
      } else {
        const data = await res.json();
        setError(data.phone?.[0] || data.address?.[0] || data.phone || data.address || 'Không thể cập nhật thông tin.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      const res = await authFetch(`${API_URL}orders/${orderId}/cancel/`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Đã hủy đơn hàng.');
        fetchOrders();
      } else {
        const data = await res.json();
        showToast(data.error || 'Không thể hủy đơn hàng.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  const fmtDateTime = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtPrice = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Nút đóng Modal */}
        <button 
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
            👤
          </div>
          <h3 className="text-xl font-bold text-gray-900">Thông tin và đơn hàng của bạn</h3>
          <p className="text-sm text-gray-500 mt-1">{user?.username} {user?.email ? `• ${user.email}` : ''}</p>
        </div>

        {/* Phần 1: Thông tin cá nhân */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Thông tin cá nhân</h4>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  required
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Nhập 10 chữ số"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Nhập địa chỉ nhận hàng"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Phần 2: Danh sách đơn hàng */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2">Đơn hàng của bạn</h4>
          
          {loadingOrders ? (
            <p className="text-gray-500 text-sm py-4">Đang tải đơn hàng...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
                const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING';
                return (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800">Đơn hàng #{order.id}</span>
                        <span className="text-xs text-gray-500 ml-2">{fmtDateTime(order.created_at)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.product_name} × {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-sm font-semibold text-gray-800">
                        Tổng tiền: <span className="text-blue-600">{fmtPrice(order.total_amount)}</span>
                      </span>
                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}