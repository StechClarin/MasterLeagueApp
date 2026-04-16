from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profilmanagement', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='hub_id',
            field=models.CharField(blank=True, db_index=True, max_length=100, null=True, verbose_name='Hub ID'),
        ),
    ]
