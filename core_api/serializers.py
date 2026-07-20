from rest_framework import serializers
from .models import Product, Order

class ProductSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'category', 'category_display', 'name', 'price', 'image', 'description', 'created_at']
        
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'customer_phone', 'shipping_address', 'items', 'total_amount', 'status', 'created_at']
        read_only_fields = ['status', 'total_amount'] # Khách hàng đặt đơn không tự sửa đổi trạng thái và tổng tiền