'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

export default function AdminUsers() {
  const { accessToken, showToast } = useAppStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchUsers = async (status = filter) => {
    try {
      const res = await fetch(`${API_URL}admin/users/?status=${status}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch {
      showToast('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchUsers();
  }, [accessToken]);

  const handleFilter = (s) => {
    setFilter(s);
    setLoading(true);
    fetchUsers(s);
  };

  const approveUser = async (id, action) => {
    try {
      const res = await fetch(`${API_URL}admin/users/${id}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Đã cập nhật.');
        fetchUsers();
      } else {
        showToast('Không thể cập nhật.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN');

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <p className="text-sm text-gray-500">Phê duyệt tài khoản đăng ký</p>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ duyệt' },
          { key: 'approved', label: 'Đã duyệt' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              filter === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Người dùng</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">SĐT</th>
                <th className="text-center px-4 py-3">Ngày đăng ký</th>
                <th className="text-center px-4 py-3">Trạng thái</th>
                <th className="text-center px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {u.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-800">{u.username}</p>
                          {u.is_staff && <p className="text-xs text-blue-600">Quản trị viên</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{fmtDate(u.date_joined)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.is_approved ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {u.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!u.is_approved ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => approveUser(u.id, 'approve')}
                            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold cursor-pointer"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => approveUser(u.id, 'reject')}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => approveUser(u.id, 'reject')}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                        >
                          Hủy duyệt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}