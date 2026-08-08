from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Category(models.Model):
    """Danh mục sản phẩm — quản lý qua Django admin, không có API CRUD cho frontend"""
    name = models.CharField(max_length=100, verbose_name="Tên danh mục")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug (dùng cho URL)")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Category"
        ordering = ['name']

    def __str__(self):
        return self.name


def get_default_category():
    """Trả về Category 'Chưa phân loại' — dùng làm default cho Product.category.
    Tra cứu động theo slug thay vì hard-code id, tránh phụ thuộc thứ tự tạo record."""
    try:
        return Category.objects.get(slug='chua-phan-loai').id
    except Category.DoesNotExist:
        # Fallback: nếu chưa có (lúc migration chưa seed), trả về None
        return None


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_DEFAULT,
        default=get_default_category,
        related_name='products',
        verbose_name="Danh mục"
    )

    name = models.CharField(max_length=255, verbose_name="Tên sản phẩm")
    sku = models.CharField(max_length=100, unique=True, null=True, blank=True, verbose_name="Mã sản phẩm (SKU)")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Giá bán")
    image = models.ImageField(upload_to="products/", blank=True, null=True, verbose_name="Ảnh sản phẩm")
    image2 = models.ImageField(upload_to="products/", blank=True, null=True, verbose_name="Ảnh 2")
    image3 = models.ImageField(upload_to="products/", blank=True, null=True, verbose_name="Ảnh 3")
    image4 = models.ImageField(upload_to="products/", blank=True, null=True, verbose_name="Ảnh 4")
    image5 = models.ImageField(upload_to="products/", blank=True, null=True, verbose_name="Ảnh 5")
    description = models.TextField(blank=True, verbose_name="Mô tả sản phẩm (hỗ trợ Markdown)")
    specifications = models.JSONField(default=list, blank=True, verbose_name="Thông số kỹ thuật (JSON key-value)")
    is_active = models.BooleanField(default=True, verbose_name="Hiển thị trên website")
    stock = models.PositiveIntegerField(default=0, verbose_name="Số lượng tồn kho")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Chuẩn hóa SKU: strip khoảng trắng + uppercase để tránh trùng do khác hoa/thường
        if self.sku:
            self.sku = self.sku.strip().upper()
            if not self.sku:
                self.sku = None
        else:
            self.sku = None
        # Tự động chuyển đổi text sang JSON nếu specifications là string
        if isinstance(self.specifications, str):
            text = self.specifications.strip()
            if text:
                new_specs = []
                for line in text.split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    if ':' in line:
                        key, value = line.split(':', 1)
                        new_specs.append({'key': key.strip(), 'value': value.strip()})
                    else:
                        new_specs.append({'key': line, 'value': ''})
                self.specifications = new_specs
            else:
                self.specifications = []
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.category.name if self.category else 'Chưa phân loại'}] {self.name} - {self.price}đ"


class SiteConfig(models.Model):
    key = models.CharField(max_length=100, unique=True, verbose_name="Khóa cấu hình")
    data = models.JSONField(default=dict, blank=True, verbose_name="Dữ liệu")

    class Meta:
        verbose_name = "Cấu hình trang"
        verbose_name_plural = "Cấu hình trang"

    def __str__(self):
        return self.key


class Footer(models.Model):
    """Thông tin footer - Singleton (chỉ 1 bản ghi duy nhất)"""
    about_us = models.TextField(blank=True, verbose_name="Giới thiệu đơn vị")
    address = models.CharField(max_length=500, blank=True, verbose_name="Địa chỉ")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Số điện thoại")
    email = models.EmailField(blank=True, verbose_name="Email")
    working_hours = models.CharField(max_length=200, blank=True, verbose_name="Giờ làm việc")

    # Mạng xã hội: [{"name": "Facebook", "url": "https://...", "icon": "facebook"}]
    social_links = models.JSONField(default=list, blank=True, verbose_name="Mạng xã hội")

    # Đối tác: [{"name": "Đối tác A", "logo": "uploaded_logo.jpg"}]
    partners = models.JSONField(default=list, blank=True, verbose_name="Đối tác")

    # Liên kết footer: [{"title": "Chính sách bảo hành", "url": "/chinh-sach-bao-hanh"}]
    footer_links = models.JSONField(default=list, blank=True, verbose_name="Liên kết footer")

    copyright_text = models.CharField(max_length=500, blank=True, verbose_name="Copyright")

    # Logo footer (tùy chọn)
    logo = models.ImageField(upload_to="footer/", blank=True, null=True, verbose_name="Logo footer")

    is_active = models.BooleanField(default=True, verbose_name="Kích hoạt")

    class Meta:
        verbose_name = "Footer"
        verbose_name_plural = "Footer"

    def save(self, *args, **kwargs):
        # Singleton: chỉ cho phép 1 bản ghi
        if not self.pk and Footer.objects.exists():
            existing = Footer.objects.first()
            self.pk = existing.pk
            self.id = existing.id
        super().save(*args, **kwargs)

    def __str__(self):
        return "Cấu hình Footer"


class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Chờ xử lý'),
        ('PROCESSING', 'Đang xử lý'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('CANCELLED', 'Đã hủy'),
    ]

    CANCELLED_BY_CHOICES = [
        ('CUSTOMER', 'Khách hàng'),
        ('STAFF', 'Nhân viên/Admin'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        null=True,
        blank=True,
        verbose_name="Người dùng"
    )
    customer_name = models.CharField(max_length=255, verbose_name="Tên khách hàng")
    customer_phone = models.CharField(max_length=20, verbose_name="Số điện thoại")
    shipping_address = models.TextField(verbose_name="Địa chỉ giao hàng")
    items = models.JSONField(default=list, verbose_name="Danh sách sản phẩm mua")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Tổng tiền")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="Trạng thái")
    note = models.TextField(blank=True, verbose_name="Ghi chú đơn hàng")
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_by = models.CharField(max_length=20, choices=CANCELLED_BY_CHOICES, null=True, blank=True, verbose_name="Hủy bởi")

    def __str__(self):
        return f"Đơn hàng #{self.id} - {self.customer_name}"


class UserProfile(models.Model):
    """Hồ sơ người dùng - quản lý trạng thái duyệt tài khoản"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="Người dùng")
    address =models.CharField(max_length=500, blank=True, verbose_name="Địa chỉ giao hàng")
    phone = models.CharField(max_length=10, blank=True, verbose_name="Số điện thoại")
    is_approved = models.BooleanField(default=False, verbose_name="Đã duyệt")
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='approved_profiles',
        null=True,
        blank=True,
        verbose_name="Người duyệt"
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian duyệt")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đăng ký")

    class Meta:
        verbose_name = "UserProfile"
        verbose_name_plural = "UserProfile"

    def __str__(self):
        status = "Đã duyệt" if self.is_approved else "Chờ duyệt"
        return f"{self.user.username} - {status}"


class Review(models.Model):
    """Đánh giá sản phẩm của người dùng"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', verbose_name="Sản phẩm")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', verbose_name="Người dùng")
    rating = models.PositiveSmallIntegerField(verbose_name="Điểm đánh giá (1-5)")
    comment = models.TextField(blank=True, verbose_name="Nội dung bình luận")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đánh giá")

    class Meta:
        verbose_name = "Review"
        verbose_name_plural = "Review"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating}★"


class PageVisit(models.Model):
    """Theo dõi lượt truy cập website"""
    page_path = models.CharField(max_length=500, verbose_name="Đường dẫn trang")
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='visits',
        null=True,
        blank=True,
        verbose_name="Người dùng"
    )
    visitor_ip = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP khách truy cập")
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        related_name='visits',
        null=True,
        blank=True,
        verbose_name="Sản phẩm"
    )
    viewed_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian truy cập")

    class Meta:
        verbose_name = "PageVisit"
        verbose_name_plural = "PageVisit"
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.page_path} - {self.viewed_at}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Tự động tạo UserProfile khi User được tạo mới"""
    if created:
        UserProfile.objects.get_or_create(user=instance)