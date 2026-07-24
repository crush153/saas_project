'use client';

import { useEffect } from 'react';

export default function SuccessAnimation({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-bounce-in max-w-sm mx-4">
        {/* Vòng tròn xanh với icon check */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Vòng tròn animation */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-circle-check"
              style={{
                strokeDasharray: 283,
                strokeDashoffset: 283,
                animation: 'circle-draw 0.6s ease-out forwards',
              }}
            />
          </svg>
          {/* Icon check */}
          <svg className="w-10 h-10 text-green-500 animate-check-pop" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Text thành công */}
        <h3 className="text-xl font-bold text-gray-800 animate-fade-in-up">
          🎉 Đặt hàng thành công!
        </h3>
        <p className="text-sm text-gray-500 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {message || 'Đơn hàng đã được lưu và tính tiền tự động.'}
        </p>

        {/* Thanh progress tự động đóng */}
        <div className="w-full bg-gray-100 rounded-full h-1 mt-2 overflow-hidden">
          <div 
            className="bg-green-500 h-full rounded-full animate-progress-bar"
            style={{
              animation: 'progress-bar 2.5s linear forwards',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes circle-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}