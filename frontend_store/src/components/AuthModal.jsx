'use client';

import { useAppStore } from '@/store/useAppStore';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAppStore();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Nút đóng Modal */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
        >
          ✕
        </button>

        {/* Nội dung khung rỗng chuẩn bị cho tính năng Đăng nhập */}
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            👤
          </div>
          <h3 className="text-xl font-bold text-gray-900">Đăng Nhập / Đăng Ký</h3>
          <p className="text-sm text-gray-500">
            Tính năng đăng nhập đang được cập nhật...
          </p>
        </div>

      </div>
    </div>
  );
}