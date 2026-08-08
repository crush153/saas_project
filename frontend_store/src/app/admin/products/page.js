'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: '',
  price: '',
  stock: 0,
  is_active: true,
  description: '',
  specifications: '',
  image: null,
  image2: null,
  image3: null,
  image4: null,
  image5: null,
  // URL ảnh hiện có (để hiển thị tên file khi edit)
  existingImage: '',
  existingImage2: '',
  existingImage3: '',
  existingImage4: '',
  existingImage5: '',
};

// Lấy tên file từ URL ảnh (để hiển thị tên ảnh đã up)
const getFileName = (url) => {
  if (!url) return '';
  try {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return url;
  }
};

export default function AdminProducts() {
  const { authFetch, showToast } = useAppStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Lấy danh sách category từ API
  useEffect(() => {
    fetch(`${API_URL}categories/`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  const fetchProducts = async (search = '') => {
    try {
      const url = search ? `${API_URL}products/?search=${encodeURIComponent(search)}` : `${API_URL}products/`;
      const res = await authFetch(url);
      if (res.ok) setProducts(await res.json());
    } catch {
      showToast('Không thể tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Tải danh sách sản phẩm khi vào trang
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    setLoading(true);
    fetchProducts(searchQuery);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category,
      price: p.price,
      stock: p.stock,
      is_active: p.is_active,
      description: p.description || '',
      specifications: Array.isArray(p.specifications)
        ? p.specifications.map((s) => `${s.key}: ${s.value}`).join('\n')
        : '',
      image: null,
      image2: null,
      image3: null,
      image4: null,
      image5: null,
      existingImage: p.image || '',
      existingImage2: p.image2 || '',
      existingImage3: p.image3 || '',
      existingImage4: p.image4 || '',
      existingImage5: p.image5 || '',
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (['image', 'image2', 'image3', 'image4', 'image5'].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: files?.[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRemoveImage = (name) => {
  setForm((f) => ({ ...f, [name]: '__REMOVE__' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('sku', form.sku);
    fd.append('category', form.category);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    fd.append('is_active', form.is_active);
    fd.append('description', form.description);
    fd.append('specifications', form.specifications);

    ['image', 'image2', 'image3', 'image4', 'image5'].forEach((key) => {
      if (form[key] === '__REMOVE__') fd.append(key, '');
      else if (form[key]) fd.append(key, form[key]);
    });

    try {
      const url = editingId ? `${API_URL}products/${editingId}/` : `${API_URL}products/`;
      const res = await authFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: fd,
      });

      if (res.ok) {
        showToast(editingId ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm mới.');
        setShowForm(false);
        fetchProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(Object.values(data).flat()[0] || 'Có lỗi xảy ra.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      const res = await authFetch(`${API_URL}products/${id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Đã xóa sản phẩm.');
        fetchProducts();
      } else {
        showToast('Không thể xóa sản phẩm.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('vi-VN');

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500">Thêm, sửa, xóa hàng hóa</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Ô tìm kiếm */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc mã sản phẩm..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            {searching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setLoading(true); fetchProducts(''); }}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-2 cursor-pointer"
            >
              Xóa lọc
            </button>
          )}
        </form>
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Sản phẩm</th>
                <th className="text-left px-4 py-3">Mã SKU</th>
                <th className="text-left px-4 py-3">Danh mục</th>
                <th className="text-right px-4 py-3">Giá</th>
                <th className="text-center px-4 py-3">Tồn kho</th>
                <th className="text-center px-4 py-3">Hiển thị</th>
                <th className="text-center px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || 'https://via.placeholder.com/40'}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded bg-gray-50 border border-gray-200"
                        />
                        <span className="font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {p.sku || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category_display}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(p.price)}đ</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold cursor-pointer"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã sản phẩm (SKU) * <span className="text-gray-400 font-normal"></span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      name="category"
                      value={form.category || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Chọn danh mục --</option>

                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (đ) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    Hiển thị trên website
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                {form.existingImage && form.image !== '__REMOVE__' && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    Ảnh hiện tại: <span className="font-medium">{getFileName(form.existingImage)}</span>
                    <button type="button" onClick={() => handleRemoveImage('image')}
                      className="text-red-500 hover:text-red-700 font-bold px-1">×</button>
                  </p>
                )}
              </div>

              {/* Ảnh 2-5 (tùy chọn) */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'image2', label: 'Ảnh 2', existing: form.existingImage2 },
                  { name: 'image3', label: 'Ảnh 3', existing: form.existingImage3 },
                  { name: 'image4', label: 'Ảnh 4', existing: form.existingImage4 },
                  { name: 'image5', label: 'Ảnh 5', existing: form.existingImage5 },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type="file"
                      name={f.name}
                      accept="image/*"
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                    {f.existing && form[f.name] !== '__REMOVE__' && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        Hiện tại: <span className="font-medium">{getFileName(f.existing)}</span>
                        <button type="button" onClick={() => handleRemoveImage(f.name)}
                          className="text-red-500 hover:text-red-700 font-bold px-1">×</button>
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông số kỹ thuật
                </label>
                <textarea
                  name="specifications"
                  value={form.specifications}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}