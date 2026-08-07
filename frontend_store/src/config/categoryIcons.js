// Icon mapping tĩnh theo slug — admin không tự tạo category mới nên không phát sinh slug lạ
const CATEGORY_ICONS = {
  'thoi-trang': '👕',
  'dien-tu': '💻',
  'gia-dung': '🏠',
  'sach-truyen': '📚',
};

// Helper: lấy icon từ slug, fallback về 📦 cho slug lạ
export function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] || '📦';
}

export default CATEGORY_ICONS;