'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

export default function AdminReviews() {
  const { accessToken, showToast } = useAppStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}reviews/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setReviews(await res.json());
    } catch {
      showToast('Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchReviews();
  }, [accessToken]);

  const deleteReview = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      const res = await fetch(`${API_URL}reviews/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        showToast('Đã xóa đánh giá.');
        fetchReviews();
      } else {
        showToast('Không thể xóa đánh giá.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleString('vi-VN');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h1>
        <p className="text-sm text-gray-500">Xem và xóa đánh giá spam</p>
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Chưa có đánh giá nào.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {r.user_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{r.user_name}</p>
                      <p className="text-xs text-gray-500">{fmtDate(r.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-500 text-sm">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 mt-3 bg-gray-50 rounded-lg p-3">{r.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
}