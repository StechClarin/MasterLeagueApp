from django.urls import path
from .views.provisioning import ProvisionTenantView
from .views.sync import InitialSyncView, SyncInView, SyncDeltaView
from .views.ping import PingView

urlpatterns = [
    path('external/provision-tenant/', ProvisionTenantView.as_view(), name='provision_tenant'),
    path('external/sync-tenant/', InitialSyncView.as_view(), name='sync_tenant'),
    path('external/sync-in/', SyncInView.as_view(), name='sync_in'),
    path('external/sync-delta/', SyncDeltaView.as_view(), name='sync_delta'),
    path('external/ping/', PingView.as_view(), name='ping'),
]
