from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'

    def ready(self):
        import apps.core.checks # Enregistre les checks
        import apps.core.signals.sync_handlers # Enregistre les logs de synchro
