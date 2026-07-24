from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('thoi-trang', 'Thời trang'),
        ('dien-tu', 'Điện tử'),
        ('gia-dung', 'Gia dụng'),
        ('sach-truyen', 'Sách & Truyện'),
    ]

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='thoi-trang',
        verbose_name="Danh mục"
    )

    name = models.CharField(max_length=255, verbose_name="Tên sản phẩm")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Giá bán")
    image = models.ImageField(upload_to="products/", blank=True, null=True, verbose_name="Ảnh sản phẩm")
    description = models.TextField(blank=True, verbose_name="Mô tả sản phẩm")
    specifications = models.TextField(blank=True, verbose_name="Thông số kỹ thuật")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.get_category_display()}] {self.name} - {self.price}đ"


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
    customer_name = models.CharField(max_length=255, verbose_name="Tên khách hàng")
    customer_phone = models.CharField(max_length=20, verbose_name="Số điện thoại")
    shipping_address = models.TextField(verbose_name="Địa chỉ giao hàng")
    items = models.JSONField(default=list, verbose_name="Danh sách sản phẩm mua")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name="Tổng tiền")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="Trạng thái")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Đơn hàng #{self.id} - {self.customer_name}"