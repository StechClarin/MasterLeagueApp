from django.urls import path

from .views.auth_views import PortalAuthRequestView, PortalAuthVerifyView
from .views.session_views import PortalSessionView

urlpatterns = [
    path("auth/request/", PortalAuthRequestView.as_view(), name="portal_auth_request"),
    path("auth/verify/", PortalAuthVerifyView.as_view(), name="portal_auth_verify"),
    path("session/", PortalSessionView.as_view(), name="portal_session"),
]
