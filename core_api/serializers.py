import re
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Order, Footer, UserProfile, Review, PageVisit

class ProductSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'category', 'category_display', 'name', 'price', 'image', 'description', 'specifications', 'is_active', 'stock', 'created_at']
        
class OrderSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    # User đã đăng nhập không gửi 2 field này — backend tự lấy từ userprofile
    customer_name = serializers.CharField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'customer_name', 'customer_phone', 'shipping_address', 'items', 'total_amount', 'status', 'created_at']
        read_only_fields = ['user', 'status', 'total_amount'] # Khách hàng đặt đơn không tự sửa đổi trạng thái và tổng tiền

    def validate_customer_phone(self, value):
        # Chống spam đơn ảo: chỉ cho phép đúng 10 chữ số, không chứa chữ cái và ký tự đặc biệt
        if not re.fullmatch(r'\d{10}', value):
            raise serializers.ValidationError('Số điện thoại phải gồm đúng 10 chữ số, không chứa chữ cái và ký tự đặc biệt.')
        return value

    def validate(self, attrs):
        # Khách vãng lai bắt buộc nhập Họ tên + SĐT; user đã đăng nhập thì backend tự lấy từ userprofile
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        is_authenticated = bool(user and user.is_authenticated)

        if not is_authenticated:
            if not attrs.get('customer_name'):
                raise serializers.ValidationError({'customer_name': 'Họ và tên là bắt buộc.'})
            if not attrs.get('customer_phone'):
                raise serializers.ValidationError({'customer_phone': 'Số điện thoại là bắt buộc.'})
        return attrs

class FooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Footer
        fields = '__all__'
        read_only_fields = ['is_active'] # Admin tự quản lý trạng thái

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone']

    def validate_phone(self, value):
        # Chỉ cho phép đúng 10 chữ số, không ký tự khác
        if not re.fullmatch(r'\d{10}', value):
            raise serializers.ValidationError('Số điện thoại phải gồm đúng 10 chữ số, không chứa ký tự khác.')
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        # Lưu số điện thoại vào UserProfile
        UserProfile.objects.update_or_create(
            user=user,
            defaults={'phone': phone},
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', read_only=True, default='')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'first_name', 'last_name', 'date_joined', 'is_staff', 'is_superuser']

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
