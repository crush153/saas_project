from django.contrib import admin
from .models import Product, Order, Footer

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'created_at')
    search_fields = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('customer_name', 'customer_phone')

@admin.register(Footer)
class FooterAdmin(admin.ModelAdmin):
    list_display = ('address', 'phone', 'email', 'is_active')
    list_editable = ('is_active',)
    fieldsets = (
        ('Thông tin chung', {
            'fields': ('about_us', 'address', 'phone', 'email', 'working_hours', 'logo')
        }),
        ('Mạng xã hội', {
            'fields': ('social_links',),
            'description': 'Định dạng JSON: [{"name": "Facebook", "url": "https://...", "icon": "facebook"}]'
        }),
        ('Đối tác', {
            'fields': ('partners',),
            'description': 'Định dạng JSON: [{"name": "Đối tác A", "logo": "logo_a.jpg"}]'
        }),
        ('Liên kết Footer', {
            'fields': ('footer_links',),
            'description': 'Định dạng JSON: [{"title": "Chính sách bảo hành", "url": "/chinh-sach-bao-hanh"}]'
        }),
        ('Bản quyền', {
            'fields': ('copyright_text',)
        }),
        ('Trạng thái', {
            'fields': ('is_active',)
        }),
    )
