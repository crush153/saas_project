'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import { FaFacebook } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { SiZalo } from "react-icons/si";
import { FaTiktok } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

const SOCIALS = [
  { key: 'facebook_url', label: 'Facebook', icon: <FaFacebook /> },
  { key: 'youtube_url', label: 'YouTube', icon: <FaYoutube /> },
  { key: 'zalo_url', label: 'Zalo', icon: <SiZalo /> },
  { key: 'tiktok_url', label: 'TikTok', icon: <FaTiktok /> },
  { key: 'instagram_url', label: 'Instagram', icon: <FaInstagram /> },
];

// Các mục chính sách — mở modal với nội dung từ backend
const FOOTER_MODALS = [
  { id: 'gioi-thieu', title: 'Giới thiệu', contentKey: 'intro_content' },
  { id: 'chinh-sach-bao-hanh', title: 'Chính sách bảo hành', contentKey: 'warranty_content' },
  { id: 'chinh-sach-doi-tra', title: 'Chính sách đổi trả', contentKey: 'return_content' },
  { id: 'chinh-sach-van-chuyen', title: 'Chính sách vận chuyển', contentKey: 'shipping_content' },
  { id: 'chinh-sach-bao-mat', title: 'Chính sách bảo mật', contentKey: 'privacy_content' },
  { id: 'lien-he', title: 'Liên hệ', contentKey: 'contact_content' },
];

export default function Footer() {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await fetch(`${API_URL}footer/`);
        const data = await res.json();
        setFooterData(data);
      } catch (err) {
        console.error('Không thể tải dữ liệu footer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFooter();
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm">
          Đang tải...
        </div>
      </footer>
    );
  }

  if (!footerData || Object.keys(footerData).length === 0) {
    return null;
  }

  const activeSocials = SOCIALS.filter((s) => footerData[s.key]);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Cột 1: Giới thiệu */}
          <div>
            {footerData.logo ? (
              <img
                src={`${API_URL.replace('/api/', '')}${footerData.logo}`}
                alt="Logo"
                className="h-10 mb-4"
              />
            ) : (
              <h3 className="text-xl font-bold text-white mb-4">SaaSStore</h3>
            )}
            <p className="text-sm leading-relaxed text-gray-400">
              {footerData.about_us || 'Chào mừng bạn đến với cửa hàng của chúng tôi!'}
            </p>
          </div>

          {/* Cột 2: Liên hệ */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              {footerData.address && (
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>{footerData.address}</span>
                </li>
              )}
              {footerData.phone && (
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a href={`tel:${footerData.phone}`} className="hover:text-blue-400 transition">
                    {footerData.phone}
                  </a>
                </li>
              )}
              {footerData.email && (
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <a href={`mailto:${footerData.email}`} className="hover:text-blue-400 transition">
                    {footerData.email}
                  </a>
                </li>
              )}
              {footerData.working_hours && (
                <li className="flex items-start gap-2">
                  <span>🕐</span>
                  <span>{footerData.working_hours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Cột 3: Liên kết (mở modal) */}
          <div>
            <h4 className="text-white font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_MODALS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setOpenModal(item)}
                    className="hover:text-blue-400 transition cursor-pointer"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Mạng xã hội */}
          <div>
            {activeSocials.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-4">Kết nối với chúng tôi</h4>
                <div className="flex flex-wrap gap-3">
                  {activeSocials.map((social) => (
                    <a
                      key={social.key}
                      href={footerData[social.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                      title={social.label}
                    >
                      <span>{social.icon}</span>
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Copyright */}
        {footerData.copyright_text && (
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
            {footerData.copyright_text}
          </div>
        )}
      </div>

      {/* Modal hiển thị nội dung chính sách từ backend */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 shadow-xl relative">
            <button
              onClick={() => setOpenModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{openModal.title}</h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {footerData[openModal.contentKey] || 'Nội dung chưa được cập nhật.'}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}