from django.urls import path

from .views.auth_views import (
    PortalAuthRequestView,
    PortalAuthVerifyView,
    PortalManagerLoginView,
    PortalEstablishmentsListView,
)
from .views.session_views import PortalSessionView
from .views.manager import (
    ManagerDashboardView,
    ManagerStudentsView,
    ManagerFinanceView,
    ManagerStaffView,
    ManagerGradesView,
)

urlpatterns = [
    path("auth/request/", PortalAuthRequestView.as_view(), name="portal_auth_request"),
    path("auth/verify/", PortalAuthVerifyView.as_view(), name="portal_auth_verify"),
    path("auth/manager-login/", PortalManagerLoginView.as_view(), name="portal_manager_login"),
    path("auth/establishments/", PortalEstablishmentsListView.as_view(), name="portal_establishments_list"),
    path("session/", PortalSessionView.as_view(), name="portal_session"),
    # Endpoints Espace Gestionnaire / Directeur (Mobile)
    path("manager/dashboard/", ManagerDashboardView.as_view(), name="portal_manager_dashboard"),
    path("manager/students/", ManagerStudentsView.as_view(), name="portal_manager_students"),
    path("manager/finance/", ManagerFinanceView.as_view(), name="portal_manager_finance"),
    path("manager/staff/", ManagerStaffView.as_view(), name="portal_manager_staff"),
    path("manager/grades/", ManagerGradesView.as_view(), name="portal_manager_grades"),
]


