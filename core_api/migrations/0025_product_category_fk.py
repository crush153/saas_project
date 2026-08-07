# Generated manually — Bước 2: chuyển Product.category từ CharField sang ForeignKey
# Tách riêng khỏi 0024 vì PostgreSQL không cho ALTER TABLE sau DELETE trong cùng transaction

from django.db import migrations, models
import core_api.models


class Migration(migrations.Migration):

    dependencies = [
        ('core_api', '0024_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='category',
            field=models.ForeignKey(
                default=core_api.models.get_default_category,
                on_delete=models.SET_DEFAULT,
                related_name='products',
                to='core_api.category',
                verbose_name='Danh mục',
            ),
        ),
    ]