from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ProductViewSet, OrderViewSet, ReviewViewSet, get_footer, register, me,
    ApproveTokenObtainPairView, track_visit, admin_users, admin_approve_user, admin_analytics,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('footer/', get_footer, name='get-footer'),
    # --- AUTH (JWT) ---
    path('auth/register/', register, name='auth-register'),
    path('auth/login/', ApproveTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/', me, name='auth-me'),
    # --- ANALYTICS & ADMIN ---
    path('analytics/track/', track_visit, name='track-visit'),
    path('admin/users/', admin_users, name='admin-users'),
    path('admin/users/<int:user_id>/approve/', admin_approve_user, name='admin-approve-user'),
    path('admin/analytics/', admin_analytics, name='admin-analytics'),
]
