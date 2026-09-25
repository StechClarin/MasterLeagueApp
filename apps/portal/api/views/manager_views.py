"""
Module de compatibilité pour les vues Manager.
Découpé en sous-modules thématiques modulaires dans apps/portal/api/views/manager/
"""
from apps.portal.api.views.manager import (
    ManagerDashboardView,
    ManagerStudentsView,
    ManagerFinanceView,
    ManagerStaffView,
    ManagerGradesView,
)

__all__ = [
    "ManagerDashboardView",
    "ManagerStudentsView",
    "ManagerFinanceView",
    "ManagerStaffView",
    "ManagerGradesView",
]
