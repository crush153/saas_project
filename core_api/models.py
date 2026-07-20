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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.get_category_display()}] {self.name} - {self.price}đ"


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