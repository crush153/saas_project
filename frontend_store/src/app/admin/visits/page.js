'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

export default function AdminVisits() {
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

  const cards = data ? [
    { label: 'Hôm nay', value: data.visits.today, color: 'bg-indigo-100 text-indigo-700' },
    { label: '7 ngày', value: data.visits.week, color: 'bg-blue-100 text-blue-700' },
    { label: '30 ngày', value: data.visits.month, color: 'bg-purple-100 text-purple-700' },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lượt truy cập</h1>
        <p className="text-sm text-gray-500">Theo dõi lượt truy cập website</p>
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <>
          {/* Thẻ thống kê */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">{c.label}</p>
                <p className="text-3xl font-bold text-gray-800">{c.value}</p>
                <p className="text-xs text-gray-400 mt-1">lượt truy cập</p>
              </div>
            ))}
          </div>

          {/* Biểu đồ lượt truy cập 7 ngày */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">Lượt truy cập 7 ngày gần nhất</h2>
            <div className="flex items-end gap-2 h-64">
              {data.visits_by_day.map((d) => {
                const max = Math.max(...data.visits_by_day.map((x) => x.visits), 1);
                const h = Math.max((d.visits / max) * 100, 2);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-600 font-semibold">{d.visits}</span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t"
                      style={{ height: `${h}%` }}
                      title={`${d.date}: ${d.visits} lượt`}
                    />
                    <span className="text-xs text-gray-400">{d.date}</span>
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
              <div className="space-y-3">
                {data.top_products.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700 truncate">{p.name}</span>
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${(p.views / data.top_products[0].views) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{p.views} lượt</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}