# Generated by Django 4.0.5 on 2022-06-27 13:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Chat', '0006_message_isrecalled'),
    ]

    operations = [
        migrations.RenameField(
            model_name='message',
            old_name='isRecalled',
            new_name='is_recalled',
        ),
    ]
