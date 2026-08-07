# Generated manually — tách Category thành model riêng
# Bước 1: tạo bảng Category → xóa dữ liệu cũ → seed dữ liệu
# Bước 2 (migration 0025): chuyển Product.category sang FK (tách riêng vì PostgreSQL không cho ALTER sau DELETE trong cùng transaction)

from django.db import migrations, models


def delete_old_data(apps, schema_editor):
    """Xóa sạch dữ liệu cũ (đang giai đoạn phát triển) — theo thứ tự tránh vi phạm FK"""
    Review = apps.get_model('core_api', 'Review')
    PageVisit = apps.get_model('core_api', 'PageVisit')
    Order = apps.get_model('core_api', 'Order')
    Product = apps.get_model('core_api', 'Product')

    Review.objects.all().delete()
    PageVisit.objects.all().delete()
    Order.objects.all().delete()
    Product.objects.all().delete()


def seed_categories(apps, schema_editor):
    """Tạo các Category ban đầu (đồng bộ với categories.js cũ) + row 'Chưa phân loại'"""
    Category = apps.get_model('core_api', 'Category')

    categories = [
        {'slug': 'thoi-trang', 'name': 'Thời trang'},
        {'slug': 'dien-tu', 'name': 'Điện tử'},
        {'slug': 'gia-dung', 'name': 'Gia dụng'},
        {'slug': 'sach-truyen', 'name': 'Sách & Truyện'},
        {'slug': 'chua-phan-loai', 'name': 'Chưa phân loại'},
    ]

    for cat in categories:
        Category.objects.get_or_create(slug=cat['slug'], defaults={'name': cat['name']})


class Migration(migrations.Migration):

    dependencies = [
        ('core_api', '0023_order_cancelled_by'),
    ]

    operations = [
        # 1. Tạo bảng Category
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Tên danh mục')),
                ('slug', models.SlugField(max_length=100, unique=True, verbose_name='Slug (dùng cho URL)')),
            ],
            options={
                'verbose_name': 'Danh mục',
                'verbose_name_plural': 'Danh mục',
                'ordering': ['name'],
            },
        ),

        # 2. Xóa sạch dữ liệu cũ
        migrations.RunPython(delete_old_data, migrations.RunPython.noop),

        # 3. Seed dữ liệu Category ban đầu
        migrations.RunPython(seed_categories, migrations.RunPython.noop),

    ]
