'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

export default function AdminDashboard() {
  const { accessToken } = useAppStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}admin/analytics/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error('Không thể tải dữ liệu');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchData();
  }, [accessToken]);

  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

  const statCards = data ? [
    { label: 'Doanh thu hôm nay', value: `${fmt(data.revenue.today)}đ`, icon: '💰', color: 'bg-green-100 text-green-700' },
    { label: 'Doanh thu tuần', value: `${fmt(data.revenue.week)}đ`, icon: '📈', color: 'bg-blue-100 text-blue-700' },
    { label: 'Doanh thu tháng', value: `${fmt(data.revenue.month)}đ`, icon: '📊', color: 'bg-purple-100 text-purple-700' },
    { label: 'Tổng doanh thu', value: `${fmt(data.revenue.total)}đ`, icon: '🏆', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Đơn chờ xử lý', value: data.orders.PENDING, icon: '⏳', color: 'bg-orange-100 text-orange-700' },
    { label: 'Đơn đang xử lý', value: data.orders.PROCESSING, icon: '🚚', color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Đơn hoàn thành', value: data.orders.COMPLETED, icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lượt truy cập hôm nay', value: data.visits.today, icon: '👁️', color: 'bg-indigo-100 text-indigo-700' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">Tổng quan hoạt động của website</p>
      </div>

      {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <>
          {/* Thẻ thống kê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${card.color}`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doanh thu 7 ngày */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Doanh thu 7 ngày gần nhất</h2>
              <div className="flex items-end gap-2 h-40">
                {data.revenue_by_day.map((d) => {
                  const max = Math.max(...data.revenue_by_day.map((x) => x.revenue), 1);
                  const h = Math.max((d.revenue / max) * 100, 2);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500">{fmt(d.revenue)}</span>
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${h}%` }}
                        title={`${d.date}: ${fmt(d.revenue)}đ`}
                      />
                      <span className="text-[10px] text-gray-400">{d.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top sản phẩm xem nhiều */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Top sản phẩm xem nhiều (7 ngày)</h2>
              {data.top_products.length === 0 ? (
                <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
              ) : (
                <ul className="space-y-3">
                  {data.top_products.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 truncate">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.views} lượt</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/admin/products" className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-300 transition">
              <div className="text-2xl mb-2">📦</div>
              <p className="font-semibold text-gray-800 text-sm">Quản lý sản phẩm</p>
            </Link>
            <Link href="/admin/orders" className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-300 transition">
              <div className="text-2xl mb-2">🧾</div>
              <p className="font-semibold text-gray-800 text-sm">Quản lý đơn hàng</p>
            </Link>
            <Link href="/admin/users" className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-300 transition">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-semibold text-gray-800 text-sm">
                Duyệt người dùng
                {data.pending_users > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{data.pending_users}</span>
                )}
              </p>
            </Link>
            <Link href="/admin/revenue" className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:border-blue-300 transition">
              <div className="text-2xl mb-2">💰</div>
              <p className="font-semibold text-gray-800 text-sm">Xem doanh thu</p>
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}