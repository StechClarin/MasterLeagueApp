"""
Garde-fou du socle : la pagination utilitaire utilisée par toutes les Query GraphQL.
"""
import pytest

from apps.core.utils.pagination import paginate_queryset


@pytest.mark.django_db
def test_paginate_out_of_range_returns_first_page():
    from django.contrib.auth.models import Permission

    total = Permission.objects.count()
    assert total > 0, "Le modèle Permission doit être peuplé (permissions par défaut)"

    result = paginate_queryset(Permission.objects.all(), page=99999, page_size=10)
    assert result["current_page"] == 1
    assert result["total_count"] == total
    assert result["num_pages"] >= 1


@pytest.mark.django_db
def test_paginate_metadata():
    from django.contrib.auth.models import Permission

    result = paginate_queryset(Permission.objects.all(), page=1, page_size=10)
    assert result["total_count"] >= 1
    assert result["page_size"] == 10
    assert len(result["items"]) <= 10
    assert result["current_page"] == 1
