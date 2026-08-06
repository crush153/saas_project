from django.contrib import admin
from django import forms
from django.utils.safestring import mark_safe
from django.utils import timezone
from .models import Product, Order, Footer, UserProfile, Review, PageVisit

class ProductAdminForm(forms.ModelForm):
    """Custom form cho Product: cho phép nhập specifications dạng text, tự động parse sang JSON"""
    specifications = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'rows': 8, 'class': 'vLargeTextField', 'style': 'font-family: monospace;'}),
        help_text=mark_safe(
            'Nhập mỗi dòng theo định dạng <b>key: value</b> (ví dụ: "Dung tích: 500 lít"). '
            'Mỗi dòng là một thông số kỹ thuật. <br>Hoặc nhập trực tiếp JSON array: '
            '<code>[{"key": "Dung tích", "value": "500 lít"}]</code>'
        )
    )
    class Meta:
        model = Product
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Nếu đã có dữ liệu JSON, hiển thị dưới dạng text để dễ chỉnh sửa
        if self.instance and self.instance.pk and self.instance.specifications:
            specs = self.instance.specifications
            if isinstance(specs, list) and len(specs) > 0:
                # Chuyển JSON array → text (mỗi dòng "key: value")
                text_lines = []
                for item in specs:
                    if isinstance(item, dict) and 'key' in item:
                        text_lines.append(f"{item['key']}: {item.get('value', '')}")
                if text_lines:
                    self.fields['specifications'].initial = '\n'.join(text_lines)

    def clean_specifications(self):
        data = self.cleaned_data['specifications']
        if not data or not data.strip():
            return []
        
        text = data.strip()
        
        # Thử parse JSON trước
        import json
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return parsed
            return [{'key': str(parsed), 'value': ''}]
        except (json.JSONDecodeError, ValueError):
            pass
        
        # Nếu không phải JSON, parse text dạng "key: value" mỗi dòng
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
        
        return new_specs

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'price', 'stock', 'is_active', 'created_at')
    list_filter = ('is_active', 'category')
    list_editable = ('is_active', 'stock')
    search_fields = ('name',)
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('category', 'name', 'price', 'is_active', 'stock')
        }),
        ('Hình ảnh sản phẩm', {
            'fields': ('image', 'image2', 'image3', 'image4', 'image5'),
            'description': 'Ảnh đầu tiên (image) là ảnh đại diện. Có thể upload tối đa 5 ảnh.'
        }),
        ('Mô tả (hỗ trợ Markdown)', {
            'fields': ('description',),
            'description': 'Hỗ trợ Markdown: **bold**, *italic*, `code`, [link](url), - bullet, ## heading, > quote'
        }),
        ('Thông số kỹ thuật', {
            'fields': ('specifications',),
        }),
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'customer_name', 'customer_phone', 'total_amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('customer_name', 'customer_phone', 'user__username')

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

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'is_approved', 'approved_at', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('user__username', 'user__email', 'phone')
    list_editable = ('is_approved',)
    readonly_fields = ('created_at',)
    actions = ['approve_selected']

    @admin.action(description="Duyệt tài khoản đã chọn")
    def approve_selected(self, request, queryset):
        updated = queryset.filter(is_approved=False).update(
            is_approved=True,
            approved_at=timezone.now(),
        )
        self.message_user(request, f"Đã duyệt {updated} tài khoản.")

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('user__username', 'product__name', 'comment')
    readonly_fields = ('created_at',)

@admin.register(PageVisit)
class PageVisitAdmin(admin.ModelAdmin):
    list_display = ('page_path', 'user', 'product', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('page_path', 'user__username')
    readonly_fields = ('viewed_at',)
