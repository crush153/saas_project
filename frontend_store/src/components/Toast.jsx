'use client';

import { useAppStore } from '@/store/useAppStore';

export default function Toast() {
  const { toast } = useAppStore();

  return (
    <div
      className={`fixed top-20 right-6 z-50 transform transition-all duration-300 ease-in-out ${
        toast.show ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gray-900/90 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-gray-700/50">
        <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}