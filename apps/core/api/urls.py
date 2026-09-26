from django.urls import path
from .views.provisioning import ProvisionTenantView
from .views.unlockedmod import UnlockModuleView
from .views.quota import UpdateQuotaView
from .views.sync import InitialSyncView, SyncInView, SyncDeltaView, PushDeltaView
from .views.sync_assets import AssetManifestView, AssetTransferView
from .views.ping import PingView
from .views.health import HealthView

urlpatterns = [
    path('external/provision-tenant/', ProvisionTenantView.as_view(), name='provision_tenant'),
    path('external/unlock-module/', UnlockModuleView.as_view(), name='unlock_module'),
    path('external/update-quota/', UpdateQuotaView.as_view(), name='update_quota'),
    path('external/sync-tenant/', InitialSyncView.as_view(), name='sync_tenant'),
    path('external/sync-in/', SyncInView.as_view(), name='sync_in'),
    path('external/sync-delta/', SyncDeltaView.as_view(), name='sync_delta'),
    path('external/push-delta/', PushDeltaView.as_view(), name='push_delta'),
    path('external/sync-assets/manifest/', AssetManifestView.as_view(), name='sync_assets_manifest'),
    path('external/sync-assets/transfer/', AssetTransferView.as_view(), name='sync_assets_transfer'),
    path('external/ping/', PingView.as_view(), name='ping'),
    path('core/health/', HealthView.as_view(), name='health'),
]
