'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-orange-100 text-orange-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-cyan-100 text-cyan-700' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function AdminOrders() {
  const { accessToken, showToast } = useAppStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}orders/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch {
      showToast('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchOrders();
  }, [accessToken]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}orders/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast('Đã cập nhật trạng thái đơn hàng.');
        fetchOrders();
      } else {
        showToast('Không thể cập nhật trạng thái.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    try {
      const res = await fetch(`${API_URL}orders/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        showToast('Đã xóa đơn hàng.');
        fetchOrders();
      } else {
        showToast('Không thể xóa đơn hàng.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');
  const fmtDate = (d) => new Date(d).toLocaleString('vi-VN');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <p className="text-sm text-gray-500">Theo dõi và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Tất cả' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Không có đơn hàng nào.</p>
          ) : (
            filtered.map((o) => (
              <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Đơn #{o.id} — {o.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {o.customer_phone} • {fmtDate(o.created_at)}
                    </p>
                    {o.user && <p className="text-xs text-blue-600 mt-0.5">👤 User ID: {o.user}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[o.status].color}`}>
                      {STATUS_MAP[o.status].label}
                    </span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                    >
                      {Object.entries(STATUS_MAP).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer"
                    >
                      {expandedId === o.id ? 'Thu gọn' : 'Chi tiết'}
                    </button>
                    <button
                      onClick={() => deleteOrder(o.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {expandedId === o.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Địa chỉ:</span> {o.shipping_address}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Sản phẩm:</p>
                      <ul className="space-y-1">
                        {(o.items || []).map((item, i) => (
                          <li key={i} className="text-sm text-gray-700 flex justify-between">
                            <span>{item.product_name} × {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm font-bold text-gray-800 mt-2">
                        Tổng: {fmt(o.total_amount)}đ
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
}