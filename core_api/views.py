from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product, Order, Footer
from .serializers import ProductSerializer, OrderSerializer, FooterSerializer
from decimal import Decimal
from django.db.models import Q

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        #lọc theo danh mục
        queryset = Product.objects.all().order_by('-created_at')
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        #lọc theo tìm kiếm không dấu
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__unaccent__icontains=search_query) |
                Q(description__unaccent__icontains=search_query)
            )

        return queryset

@api_view(['GET'])
def get_footer(request):
    """API trả về thông tin footer (chỉ 1 bản ghi duy nhất)"""
    footer = Footer.objects.filter(is_active=True).first()
    if not footer:
        return Response({}, status=status.HTTP_200_OK)
    serializer = FooterSerializer(footer)
    return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        items = self.request.data.get('items', []) 
        total = Decimal('0.00')
        enriched_items = []

        for item in items:
            try:
                product = Product.objects.get(id=item.get('product_id'))
                quantity = int(item.get('quantity', 1))
                total += product.price * quantity
                # Lưu thêm tên sản phẩm vào item để admin dễ đọc
                enriched_items.append({
                    'product_id': item.get('product_id'),
                    'product_name': product.name,
                    'quantity': quantity,
                })
            except Product.DoesNotExist:
                continue
        
        serializer.save(total_amount=total, items=enriched_items)
