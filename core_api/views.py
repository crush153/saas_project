import re
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Product, Order, Footer, UserProfile, Review, PageVisit
from .serializers import ProductSerializer, OrderSerializer, FooterSerializer, RegisterSerializer, UserSerializer, ReviewSerializer, PageVisitSerializer
from decimal import Decimal
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Khách hàng chỉ xem được sản phẩm đang hiển thị; admin mới được ghi (tạo/sửa/xóa)
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

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

        # Khách hàng chỉ thấy sản phẩm đang hiển thị; admin thấy tất cả
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

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

    def get_permissions(self):
        # Khách hàng chỉ được tạo đơn; admin mới được xem danh sách/sửa/xóa
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

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

        # Nếu user đã đăng nhập: lấy thông tin từ userprofile, KHÔNG tin dữ liệu client gửi lên
        if self.request.user.is_authenticated:
            profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
            if not profile.phone or not re.fullmatch(r'\d{10}', profile.phone):
                raise serializers.ValidationError({
                    'customer_phone': 'Tài khoản của bạn chưa có số điện thoại hợp lệ (10 chữ số). Vui lòng cập nhật số điện thoại trong hồ sơ trước khi đặt hàng.'
                })
            # Ưu tiên họ tên đầy đủ nếu có, fallback về username
            full_name = (self.request.user.first_name + ' ' + self.request.user.last_name).strip()
            customer_name = full_name or self.request.user.username
            serializer.save(
                user=self.request.user,
                customer_name=customer_name,
                customer_phone=profile.phone,
                total_amount=total,
                items=enriched_items,
            )
        else:
            serializer.save(total_amount=total, items=enriched_items)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Đăng ký tài khoản mới — KHÔNG trả token, phải chờ quản trị viên duyệt"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Signal post_save đã tự tạo UserProfile (is_approved=False)
        return Response({
            'message': 'Đăng ký thành công! Tài khoản của bạn đang chờ quản trị viên duyệt.',
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Lấy thông tin user hiện tại (cần access token)"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class ApproveTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom login: chặn tài khoản chưa được quản trị viên duyệt"""
    def validate(self, attrs):
        data = super().validate(attrs)

        # Lấy hoặc tạo profile (user cũ có thể chưa có profile)
        profile, _ = UserProfile.objects.get_or_create(user=self.user)

        if not profile.is_approved:
            raise PermissionDenied('Tài khoản của bạn đang chờ quản trị viên duyệt.')

        return data


class ApproveTokenObtainPairView(TokenObtainPairView):
    serializer_class = ApproveTokenObtainPairSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """Đánh giá sản phẩm — mọi người xem được, chỉ user đã đăng nhập mới gửi được"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all()
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(product=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ============================================================
#  ADMIN API — chỉ user có is_staff mới truy cập được
# ============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def track_visit(request):
    """Ghi nhận lượt truy cập trang (gọi từ frontend khi đổi trang)"""
    page_path = request.data.get('page_path', '')
    if not page_path:
        return Response({'error': 'page_path là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

    product_id = request.data.get('product_id')
    product = None
    if product_id:
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            product = None

    PageVisit.objects.create(
        page_path=page_path,
        user=request.user if request.user.is_authenticated else None,
        visitor_ip=request.META.get('REMOTE_ADDR'),
        product=product,
    )
    return Response({'ok': True}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    """Danh sách người dùng đã đăng ký (admin)"""
    status_filter = request.query_params.get('status', 'all')  # all | pending | approved
    users = User.objects.all().order_by('-date_joined')

    if status_filter == 'pending':
        users = users.filter(profile__is_approved=False)
    elif status_filter == 'approved':
        users = users.filter(profile__is_approved=True)

    data = []
    for u in users:
        profile = getattr(u, 'profile', None)
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'phone': profile.phone if profile else '',
            'is_approved': profile.is_approved if profile else False,
            'is_staff': u.is_staff,
            'date_joined': u.date_joined,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_approve_user(request, user_id):
    """Duyệt / từ chối tài khoản người dùng (admin)"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Không tìm thấy người dùng.'}, status=status.HTTP_404_NOT_FOUND)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    action = request.data.get('action', 'approve')  # approve | reject

    if action == 'approve':
        profile.is_approved = True
        profile.approved_at = timezone.now()
        profile.save()
        return Response({'ok': True, 'message': f'Đã duyệt tài khoản {user.username}.'})
    elif action == 'reject':
        profile.is_approved = False
        profile.approved_at = None
        profile.save()
        return Response({'ok': True, 'message': f'Đã từ chối tài khoản {user.username}.'})
    return Response({'error': 'action không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics(request):
    """Thống kê doanh thu + lượt truy cập (admin)"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # --- Doanh thu ---
    revenue_orders = Order.objects.filter(status__in=['PROCESSING', 'COMPLETED'])
    revenue_today = revenue_orders.filter(created_at__date=today).aggregate(s=Sum('total_amount'))['s'] or 0
    revenue_week = revenue_orders.filter(created_at__date__gte=week_ago).aggregate(s=Sum('total_amount'))['s'] or 0
    revenue_month = revenue_orders.filter(created_at__date__gte=month_ago).aggregate(s=Sum('total_amount'))['s'] or 0
    revenue_total = revenue_orders.aggregate(s=Sum('total_amount'))['s'] or 0

    # --- Đơn hàng ---
    order_counts = {
        'PENDING': Order.objects.filter(status='PENDING').count(),
        'PROCESSING': Order.objects.filter(status='PROCESSING').count(),
        'COMPLETED': Order.objects.filter(status='COMPLETED').count(),
        'CANCELLED': Order.objects.filter(status='CANCELLED').count(),
    }

    # --- Lượt truy cập ---
    visits_today = PageVisit.objects.filter(viewed_at__date=today).count()
    visits_week = PageVisit.objects.filter(viewed_at__date__gte=week_ago).count()
    visits_month = PageVisit.objects.filter(viewed_at__date__gte=month_ago).count()

    # --- Top sản phẩm xem nhiều (7 ngày) ---
    top_products = (
        PageVisit.objects
        .filter(viewed_at__date__gte=week_ago, product__isnull=False)
        .values('product__id', 'product__name')
        .annotate(views=Count('id'))
        .order_by('-views')[:5]
    )

    # --- Doanh thu 7 ngày gần nhất (cho biểu đồ) ---
    revenue_by_day = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        total = revenue_orders.filter(created_at__date=day).aggregate(s=Sum('total_amount'))['s'] or 0
        revenue_by_day.append({'date': day.strftime('%d/%m'), 'revenue': float(total)})

    # --- Lượt truy cập 7 ngày gần nhất (cho biểu đồ) ---
    visits_by_day = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = PageVisit.objects.filter(viewed_at__date=day).count()
        visits_by_day.append({'date': day.strftime('%d/%m'), 'visits': count})

    # --- User chờ duyệt ---
    pending_users = UserProfile.objects.filter(is_approved=False).count()

    return Response({
        'revenue': {
            'today': float(revenue_today),
            'week': float(revenue_week),
            'month': float(revenue_month),
            'total': float(revenue_total),
        },
        'orders': order_counts,
        'visits': {
            'today': visits_today,
            'week': visits_week,
            'month': visits_month,
        },
        'top_products': [
            {'id': p['product__id'], 'name': p['product__name'], 'views': p['views']}
            for p in top_products
        ],
        'revenue_by_day': revenue_by_day,
        'visits_by_day': visits_by_day,
        'pending_users': pending_users,
    })
