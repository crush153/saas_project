import re
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Order, Footer, UserProfile, Review, PageVisit, Category
import json

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # Frontend gửi category dưới dạng slug (vd 'thoi-trang'), không phải id
    category = serializers.SlugRelatedField(slug_field='slug', queryset=Category.objects.all())
    category_display = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'category', 'category_display', 'name', 'price', 'image', 'image2', 'image3', 'image4', 'image5', 'description', 'specifications', 'is_active', 'stock', 'created_at']

    def to_internal_value(self, data):
    # Nếu specifications là text "key: value" (không phải JSON hợp lệ),
    # chuyển thành chuỗi JSON hợp lệ TRƯỚC KHI JSONField của DRF tự parse
        specs = data.get('specifications') if hasattr(data, 'get') else None
        if isinstance(specs, str) and specs.strip():
            try:
                json.loads(specs)  # đã là JSON hợp lệ -> để nguyên
            except (json.JSONDecodeError, ValueError):
                data = data.copy()
                new_specs = []
                for line in specs.strip().split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    if ':' in line:
                        key, val = line.split(':', 1)
                        new_specs.append({'key': key.strip(), 'value': val.strip()})
                    else:
                        new_specs.append({'key': line, 'value': ''})
                data['specifications'] = json.dumps(new_specs)
        return super().to_internal_value(data)

    def validate_specifications(self, value):
        """Tự động convert text dạng 'key: value' (mỗi dòng) sang JSON array.
        User chỉ cần nhập: Dung tích: 500 lít — không cần dấu ngoặc hay JSON."""
        if not value:
            return []
        if isinstance(value, str):
            import json
            text = value.strip()
            # Thử parse JSON trước (nếu user nhập JSON array)
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return parsed
                return [{'key': str(parsed), 'value': ''}]
            except (json.JSONDecodeError, ValueError):
                pass
            # Parse text dạng "key: value" mỗi dòng
            new_specs = []
            for line in text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                if ':' in line:
                    key, val = line.split(':', 1)
                    new_specs.append({'key': key.strip(), 'value': val.strip()})
                else:
                    new_specs.append({'key': line, 'value': ''})
            return new_specs
        if isinstance(value, list):
            return value
        return []

    def validate_description(self, value):
        """Tự động thêm bullet (- ) cho mỗi dòng mô tả chưa có bullet."""
        if not value:
            return value
        lines = value.split('\n')
        new_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            # Nếu dòng đã là markdown (bullet, heading, quote, code, số.) thì giữ nguyên
            if stripped.startswith(('- ', '* ', '#', '>', '```', '1.', '2.', '3.')) or stripped.startswith('![') or stripped.startswith('['):
                new_lines.append(stripped)
            else:
                new_lines.append(f'- {stripped}')
        return '\n'.join(new_lines)

class OrderSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    # User đã đăng nhập không gửi 2 field này — backend tự lấy từ userprofile
    customer_name = serializers.CharField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'customer_name', 'customer_phone', 'shipping_address', 'items', 'total_amount', 'status', 'note', 'created_at', 'cancelled_by']
        read_only_fields = ['user', 'total_amount', 'cancelled_by'] # Khách hàng đặt đơn không tự sửa đổi trạng thái và tổng tiền

    def validate_customer_phone(self, value):
        # Chống spam đơn ảo: chỉ cho phép đúng 10 chữ số, không chứa chữ cái và ký tự đặc biệt
        if not re.fullmatch(r'\d{10}', value):
            raise serializers.ValidationError('Số điện thoại phải gồm đúng 10 chữ số, không chứa chữ cái và ký tự đặc biệt.')
        return value

    def validate(self, attrs):
        if self.instance is None:
            attrs.pop('status', None)  # Tạo đơn mới: luôn mặc định PENDING, không cho client set status
        # Khách vãng lai bắt buộc nhập Họ tên + SĐT; user đã đăng nhập thì backend tự lấy từ userprofile
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        is_authenticated = bool(user and user.is_authenticated)

        if not is_authenticated:
            if not attrs.get('customer_name'):
                raise serializers.ValidationError({'customer_name': 'Họ và tên là bắt buộc.'})
            if not attrs.get('customer_phone'):
                raise serializers.ValidationError({'customer_phone': 'Số điện thoại là bắt buộc.'})
            if not attrs.get('shipping_address'):
                raise serializers.ValidationError({'shipping_address': 'Địa chỉ giao hàng là bắt buộc.'})
        return attrs

class FooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Footer
        fields = '__all__'
        read_only_fields = ['is_active'] # Admin tự quản lý trạng thái

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone', 'address']

    def validate_address(self, value):
        if not value.strip():
            raise serializers.ValidationError('Địa chỉ giao hàng không được để trống.')
        return value.strip()

    def validate_phone(self, value):
        # Chỉ cho phép đúng 10 chữ số, không ký tự khác
        if not re.fullmatch(r'\d{10}', value):
            raise serializers.ValidationError('Số điện thoại phải gồm đúng 10 chữ số, không chứa ký tự khác.')
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        address = validated_data.pop('address')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        # Lưu số điện thoại vào UserProfile
        UserProfile.objects.update_or_create(
            user=user,
            defaults={'phone': phone, 'address': address},
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', read_only=True, default='')
    address = serializers.CharField(source='profile.address', read_only=True, default='')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'address', 'first_name', 'last_name', 'date_joined', 'is_staff', 'is_superuser']

class PageVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageVisit
        fields = ['id', 'page_path', 'user', 'visitor_ip', 'product', 'viewed_at']
        read_only_fields = ['viewed_at']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Điểm đánh giá phải từ 1 đến 5 sao.')
        return value

    def validate_comment(self, value):
        if len(value) > 3000:
            raise serializers.ValidationError('Nội dung bình luận tối đa 3000 ký tự.')
        return value
