import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import Module, Page

print("--- Modules and Pages ---")
modules = Module.objects.prefetch_related('pages').all()
for module in modules:
    print(f"Module: {module.name} (Order: {module.order})")
    for page in module.pages.all():
        print(f"  - Page: {page.title} | Link: {page.link}")

print("\n--- All Pages ---")
for page in Page.objects.all():
    print(f"Page: {page.title} | Link: {page.link} | Module: {page.module}")
