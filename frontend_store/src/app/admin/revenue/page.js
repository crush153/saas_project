'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

export default function AdminRevenue() {
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
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchData();
  }, [accessToken]);

  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

  const cards = data ? [
    { label: 'Hôm nay', value: data.revenue.today, color: 'bg-green-100 text-green-700' },
    { label: '7 ngày', value: data.revenue.week, color: 'bg-blue-100 text-blue-700' },
    { label: '30 ngày', value: data.revenue.month, color: 'bg-purple-100 text-purple-700' },
    { label: 'Tổng cộng', value: data.revenue.total, color: 'bg-yellow-100 text-yellow-700' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doanh thu bán hàng</h1>
        <p className="text-sm text-gray-500">Theo dõi doanh thu theo thời gian</p>
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <>
          {/* Thẻ doanh thu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">{c.label}</p>
                <p className="text-2xl font-bold text-gray-800">{fmt(c.value)}đ</p>
              </div>
            ))}
          </div>

          {/* Biểu đồ doanh thu 7 ngày */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Doanh thu 7 ngày gần nhất</h2>
            <div className="flex items-end gap-2 h-64">
              {data.revenue_by_day.map((d) => {
                const max = Math.max(...data.revenue_by_day.map((x) => x.revenue), 1);
                const h = Math.max((d.revenue / max) * 100, 2);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-600 font-semibold">{fmt(d.revenue)}đ</span>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${h}%` }}
                      title={`${d.date}: ${fmt(d.revenue)}đ`}
                    />
                    <span className="text-xs text-gray-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thống kê đơn hàng */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Thống kê đơn hàng</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(data.orders).map(([key, val]) => {
                const labels = {
                  PENDING: 'Chờ xử lý',
                  PROCESSING: 'Đang xử lý',
                  COMPLETED: 'Hoàn thành',
                  CANCELLED: 'Đã hủy',
                };
                const colors = {
                  PENDING: 'bg-orange-100 text-orange-700',
                  PROCESSING: 'bg-cyan-100 text-cyan-700',
                  COMPLETED: 'bg-emerald-100 text-emerald-700',
                  CANCELLED: 'bg-red-100 text-red-700',
                };
                return (
                  <div key={key} className="text-center p-4 rounded-lg bg-gray-50">
                    <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${colors[key]}`}>
                      {labels[key]}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}