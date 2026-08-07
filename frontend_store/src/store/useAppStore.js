import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/config/api';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // --- 0. AUTH (JWT) ---
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthLoading: false,
      tokenIssuedAt: null, // Thời điểm đăng nhập — tính thời hạn phiên (refresh token 3 ngày)

      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken, tokenIssuedAt: Date.now() }),
      setUser: (user) => set({ user }),

      login: async (username, password) => {
        set({ isAuthLoading: true });
        try {
          const res = await fetch(`${API_URL}auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            const msg = data.detail || 'Đăng nhập thất bại.';
            return { ok: false, message: msg };
          }
          set({
            accessToken: data.access,
            refreshToken: data.refresh,
            isAuthLoading: false,
            tokenIssuedAt: Date.now(),
          });
          // Lấy thông tin user
          const meRes = await fetch(`${API_URL}auth/me/`, {
            headers: { Authorization: `Bearer ${data.access}` },
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            set({ user: meData });
          }
          return { ok: true };
        } catch {
          set({ isAuthLoading: false });
          return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
        }
      },

      register: async (username, email, password, phone, address) => {
        set({ isAuthLoading: true });
        try {
          const res = await fetch(`${API_URL}auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, phone, address }),
          });
          const data = await res.json();
          if (!res.ok) {
            const msg = data.username?.[0] || data.email?.[0] || data.password?.[0] || data.phone?.[0] || data.address?.[0] || 'Đăng ký thất bại.';
            return { ok: false, message: msg };
          }
          // KHÔNG lưu token — tài khoản phải chờ quản trị viên duyệt
          set({ isAuthLoading: false });
          return { ok: true, message: data.message || 'Đăng ký thành công! Tài khoản của bạn đang chờ quản trị viên duyệt.' };
        } catch {
          set({ isAuthLoading: false });
          return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return { ok: false };
        try {
          const res = await fetch(`${API_URL}auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          const data = await res.json();
          if (!res.ok) return { ok: false };
          set({
            accessToken: data.access,
            refreshToken: data.refresh || refreshToken, // ROTATE_REFRESH_TOKENS có thể trả refresh mới
          });
          return { ok: true, accessToken: data.access };
        } catch {
          return { ok: false };
        }
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      // --- 1. GIỎ HÀNG (CART) ---
      cart: [],
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingIndex = cart.findIndex((item) => item.product_id === product.id || item.product_id === product.product_id);
        
        if (existingIndex > -1) {
          const updatedCart = [...cart];
          updatedCart[existingIndex].quantity += quantity;
          set({ cart: updatedCart });
        } else {
          const newItem = {
            product_id: product.id || product.product_id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
          };
          set({ cart: [...cart, newItem] });
        }
      },

      increaseQuantity: (productId) => set((state) => ({
        cart: state.cart.map((item) =>
          item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      })),

      decreaseQuantity: (productId) => set((state) => ({
        cart: state.cart
          .map((item) => item.product_id === productId ? { ...item, quantity: item.quantity - 1 } : item)
          .filter((item) => item.quantity > 0),
      })),

      handleQuantityInput: (productId, value) => {
        const val = parseInt(value, 10);
        if (isNaN(val) || val <= 0) return;
        set((state) => ({
          cart: state.cart.map((item) => item.product_id === productId ? { ...item, quantity: val } : item),
        }));
      },

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter((item) => item.product_id !== productId),
      })),

      clearCart: () => set({ cart: [] }),

      // --- 2. BỘ LỌC TÌM KIẾM & DANH MỤC ---
      searchQuery: '',
      selectedCategory: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // --- 3. MODAL ĐĂNG NHẬP (MỚI) ---
      isAuthModalOpen: false,
      setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

      // --- 3.1 MODAL THÔNG TIN & ĐƠN HÀNG USER ---
      isProfileModalOpen: false,
      setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open }),

      // --- 4. TOAST TOÀN CỤC ---
      toast: { show: false, message: '' },
      showToast: (message) => {
        set({ toast: { show: true, message } });
        setTimeout(() => set({ toast: { show: false, message: '' } }), 2500);
      },

      // --- 5. XỬ LÝ 401 TOÀN CỤC + KIỂM TRA HẾT HẠN PHIÊN ---
      authFetch: async (url, options = {}) => {
        const state = get();
        const headers = { ...options.headers };
        if (state.accessToken) {
          headers.Authorization = `Bearer ${state.accessToken}`;
        }
        let res = await fetch(url, { ...options, headers });

        // Nếu gặp 401, tự động refresh token một lần
        if (res.status === 401 && state.refreshToken) {
          const refreshResult = await get().refreshAccessToken();
          if (refreshResult.ok) {
            // Gửi lại request với token mới
            headers.Authorization = `Bearer ${refreshResult.accessToken}`;
            res = await fetch(url, { ...options, headers });
          } else {
            // Refresh thất bại → logout
            get().logout();
            get().showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return res;
          }
        }
        return res;
      },

      checkSessionExpiry: () => {
        const state = get();
        if (!state.tokenIssuedAt || !state.user) return null;

        const elapsedMs = Date.now() - state.tokenIssuedAt;
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        const refreshTokenLifetimeHours = 3 * 24; // 3 ngày

        const remainingHours = refreshTokenLifetimeHours - elapsedHours;

        // Cảnh báo khi còn dưới 12 giờ
        if (remainingHours <= 12 && remainingHours > 0) {
          const hours = Math.floor(remainingHours);
          const mins = Math.floor((remainingHours - hours) * 60);
          return {
            expired: false,
            warning: true,
            message: `Phiên đăng nhập ${hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`} sẽ hết hạn. Vui lòng đăng nhập để tiếp tục.`,
          };
        }
        // Đã hết hạn
        if (remainingHours <= 0) {
          get().logout();
          return { expired: true, message: 'Phiên đăng nhập đã hết hạn.' };
        }
        return null;
      },
    }),
    {
      name: 'saas-store-storage',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenIssuedAt: state.tokenIssuedAt,
      }),
    }
  )
);