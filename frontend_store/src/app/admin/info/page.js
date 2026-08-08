'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAppStore } from '@/store/useAppStore';
import { API_URL } from '@/config/api';

const EMPTY_FORM = {
  about_us: '',
  address: '',
  phone: '',
  email: '',
  working_hours: '',
  facebook_url: '',
  youtube_url: '',
  zalo_url: '',
  tiktok_url: '',
  instagram_url: '',
  intro_content: '',
  warranty_content: '',
  return_content: '',
  shipping_content: '',
  privacy_content: '',
  contact_content: '',
  copyright_text: '',
  logo: null,
  existingLogo: '',
};

const SOCIAL_FIELDS = [
  { key: 'facebook_url', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/...' },
  { key: 'youtube_url', label: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/...' },
  { key: 'zalo_url', label: 'Zalo', icon: '💬', placeholder: 'https://zalo.me/...' },
  { key: 'tiktok_url', label: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/...' },
  { key: 'instagram_url', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/...' },
];

const POLICY_FIELDS = [
  { key: 'intro_content', label: 'Giới thiệu' },
  { key: 'warranty_content', label: 'Chính sách bảo hành' },
  { key: 'return_content', label: 'Chính sách đổi trả' },
  { key: 'shipping_content', label: 'Chính sách vận chuyển' },
  { key: 'privacy_content', label: 'Chính sách bảo mật' },
  { key: 'contact_content', label: 'Liên hệ' },
];

export default function AdminInfo() {
  const { authFetch, showToast } = useAppStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await authFetch(`${API_URL}admin/footer-info/`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            about_us: data.about_us || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            working_hours: data.working_hours || '',
            facebook_url: data.facebook_url || '',
            youtube_url: data.youtube_url || '',
            zalo_url: data.zalo_url || '',
            tiktok_url: data.tiktok_url || '',
            instagram_url: data.instagram_url || '',
            intro_content: data.intro_content || '',
            warranty_content: data.warranty_content || '',
            return_content: data.return_content || '',
            shipping_content: data.shipping_content || '',
            privacy_content: data.privacy_content || '',
            contact_content: data.contact_content || '',
            copyright_text: data.copyright_text || '',
            logo: null,
            existingLogo: data.logo || '',
          });
        }
      } catch {
        showToast('Không thể tải thông tin.');
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [authFetch, showToast]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setForm((prev) => ({ ...prev, logo: files?.[0] || null }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append('about_us', form.about_us);
    fd.append('address', form.address);
    fd.append('phone', form.phone);
    fd.append('email', form.email);
    fd.append('working_hours', form.working_hours);
    fd.append('facebook_url', form.facebook_url);
    fd.append('youtube_url', form.youtube_url);
    fd.append('zalo_url', form.zalo_url);
    fd.append('tiktok_url', form.tiktok_url);
    fd.append('instagram_url', form.instagram_url);
    fd.append('intro_content', form.intro_content);
    fd.append('warranty_content', form.warranty_content);
    fd.append('return_content', form.return_content);
    fd.append('shipping_content', form.shipping_content);
    fd.append('privacy_content', form.privacy_content);
    fd.append('contact_content', form.contact_content);
    fd.append('copyright_text', form.copyright_text);
    if (form.logo) fd.append('logo', form.logo);

    try {
      const res = await authFetch(`${API_URL}admin/footer-info/`, {
        method: 'PUT',
        body: fd,
      });
      if (res.ok) {
        showToast('Đã lưu thông tin.');
        const data = await res.json();
        setForm((prev) => ({ ...prev, existingLogo: data.logo || '', logo: null }));
      } else {
        showToast('Không thể lưu thông tin.');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500';

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thông tin</h1>
        <p className="text-sm text-gray-500">Quản lý thông tin hiển thị trên footer website</p>
      </div>

      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* Thông tin chung */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Thông tin chung</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu đơn vị</label>
                <textarea
                  name="about_us"
                  value={form.about_us}
                  onChange={handleChange}
                  rows={3}
                  className={inputCls}
                  placeholder="Mô tả ngắn về cửa hàng..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ làm việc</label>
                <input
                  type="text"
                  name="working_hours"
                  value={form.working_hours}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Thứ 2 - Chủ nhật: 8:00 - 21:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo footer</label>
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  onChange={handleChange}
                  className={inputCls}
                />
                {form.existingLogo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Logo hiện tại: <span className="font-medium">{form.existingLogo.split('/').pop()}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mạng xã hội */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Mạng xã hội</h2>
            <p className="text-xs text-gray-500 mb-4">Nhập đường dẫn URL. Để trống nếu không muốn hiển thị.</p>
            <div className="space-y-4">
              {SOCIAL_FIELDS.map((s) => (
                <div key={s.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="mr-1">{s.icon}</span> {s.label}
                  </label>
                  <input
                    type="url"
                    name={s.key}
                    value={form[s.key]}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder={s.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nội dung chính sách */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Nội dung chính sách</h2>
            <p className="text-xs text-gray-500 mb-4">Nội dung hiển thị trong modal khi khách click vào từng mục ở footer.</p>
            <div className="space-y-4">
              {POLICY_FIELDS.map((p) => (
                <div key={p.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{p.label}</label>
                  <textarea
                    name={p.key}
                    value={form[p.key]}
                    onChange={handleChange}
                    rows={4}
                    className={inputCls}
                    placeholder={`Nhập nội dung ${p.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bản quyền */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Bản quyền</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Copyright</label>
              <input
                type="text"
                name="copyright_text"
                value={form.copyright_text}
                onChange={handleChange}
                className={inputCls}
                placeholder="© 2026 SaaSStore. Bảo lưu mọi quyền."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}