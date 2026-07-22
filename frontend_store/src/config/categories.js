// Đồng bộ với CATEGORY_CHOICES trong core_api/models.py
const CATEGORIES = [
  { slug: '', name: 'Tất cả danh mục' },
  { slug: 'thoi-trang', name: 'Thời trang' },
  { slug: 'dien-tu', name: 'Điện tử' },
  { slug: 'gia-dung', name: 'Gia dụng' },
  { slug: 'sach-truyen', name: 'Sách & Truyện' },
];

// Helper: lấy category name từ slug
export function getCategoryName(slug) {
  const cat = CATEGORIES.find(c => c.slug === slug);
  return cat ? cat.name : '';
}

// Helper: lấy các category không bao gồm "Tất cả danh mục"
export function getCategoryList() {
  return CATEGORIES.filter(c => c.slug !== '');
}

export default CATEGORIES;
