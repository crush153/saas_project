'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, showToast } = useAppStore();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Tự quản lý trạng thái loading riêng tại component để tránh bị kẹt
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPhone('');
    setAddress('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setIsLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true); // Bật trạng thái đang xử lý

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp.');
          return;
        }
        if (!/^\d{10}$/.test(phone)) {
          setError('Số điện thoại phải gồm đúng 10 chữ số, không chứa ký tự khác.');
          return;
        }
        const result = await register(username, email, password, phone, address);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setSuccessMessage(result.message);
        return;
      }

      // mode === 'login'
      const result = await login(username, password);
      if (!result.ok) {
        // Sử dụng thông báo lỗi tùy chỉnh nếu muốn
        setError('Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }
      showToast('Đăng nhập thành công!');
      handleClose();
    } catch (err) {
      setError('Đã có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      // LUÔN LUÔN tắt trạng thái loading dù thành công hay thất bại
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Nút đóng Modal */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
            👤
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </h3>
        </div>

        {/* Tab chuyển đổi */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition cursor-pointer ${
              mode === 'login' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition cursor-pointer ${
              mode === 'register' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Nhập email (tùy chọn)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  required
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Nhập 10 chữ số"
                />
                <p className="text-xs text-gray-400 mt-1">Số điện thoại gồm đúng 10 chữ số, không chứa ký tự khác.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-16 focus:outline-none focus:border-blue-500"
                  placeholder="Nhập địa chỉ nhận hàng"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Nhập mật khẩu"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {successMessage}
            </p>
          )}

          <button
            type="submit"tải
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition cursor-pointer"
          >
            {isLoading
              ? 'Đang xử lý...'
              : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

      </div>
    </div>
  );
}