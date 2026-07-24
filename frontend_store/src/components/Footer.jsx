'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/config/api';

export default function Footer() {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const socialIcons = {
    facebook: '📘',
    youtube: '▶️',
    zalo: '💬',
    tiktok: '🎵',
    instagram: '📷',
  };

  // Kiểm tra xem icon có phải là đường dẫn ảnh không
  const isImagePath = (value) => {
    return value && (value.startsWith('media/') || value.startsWith('http') || /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(value));
  };

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

          {/* Cột 3: Liên kết */}
          {footerData.footer_links && footerData.footer_links.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-4">Chính sách</h4>
              <ul className="space-y-2 text-sm">
                {footerData.footer_links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.url || '#'} 
                      className="hover:text-blue-400 transition"
                    >
                      {link.title || link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cột 4: Mạng xã hội & Đối tác */}
          <div>
            {/* Mạng xã hội */}
            {footerData.social_links && footerData.social_links.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-4">Kết nối với chúng tôi</h4>
                <div className="flex flex-wrap gap-3">
                  {footerData.social_links.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                      title={social.name}
                    >
                      {isImagePath(social.icon) ? (
                        <img 
                          src={`${API_URL.replace('/api/', '')}${social.icon}`}
                          alt={social.name}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <span>{socialIcons[social.icon?.toLowerCase()] || '🔗'}</span>
                      )}
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Đối tác */}
            {footerData.partners && footerData.partners.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-4">Đối tác</h4>
                <div className="flex flex-wrap gap-3">
                  {footerData.partners.map((partner, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      {partner.logo ? (
                        <img 
                          src={`${API_URL.replace('/api/', '')}${partner.logo}`}
                          alt={partner.name}
                          className="h-8 object-contain"
                        />
                      ) : (
                        <span className="text-gray-400">{partner.name}</span>
                      )}
                    </div>
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
    </footer>
  );
}