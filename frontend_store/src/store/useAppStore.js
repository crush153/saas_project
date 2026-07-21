import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
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

      // --- 4. TOAST TOÀN CỤC ---
      toast: { show: false, message: '' },
      showToast: (message) => {
        set({ toast: { show: true, message } });
        setTimeout(() => set({ toast: { show: false, message: '' } }), 2500);
      },
    }),
    {
      name: 'saas-store-storage',
      partialize: (state) => ({ cart: state.cart }), // Chỉ lưu persistent cho Cart
    }
  )
);