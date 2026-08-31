"""
Commande de vérification des échéances de maintenance des équipements.

Usage : ./snake check_maintenance        (ou via cron / scheduler)

Pour chaque utilisateur actif membre d'un établissement, crée les notifications
polymorphiques d'échéance de maintenance (si le modèle Notification est
disponible). Dégradation gracieuse si le module notifications est absent.
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Vérifie les échéances de maintenance des équipements et crée les notifications."

    def handle(self, *args, **options):
        from apps.logistics.services.asset_service import AssetService

        # Seuls les utilisateurs actifs ayant un membership sont notifiés
        users = User.objects.filter(
            is_active=True,
            memberships__status='active'
        ).distinct()

        total_created = 0
        processed = 0
        for user in users:
            processed += 1
            try:
                created = AssetService().check_maintenance_alerts(user)
                total_created += created
            except ImportError:
                self.stdout.write(self.style.WARNING(
                    "Module 'Notification' indisponible (WIP non commité) : alertes ignorées."
                ))
                break
            except Exception as e:  # pragma: no cover - garde de robustesse
                self.stdout.write(self.style.WARNING(
                    f"Erreur pour l'utilisateur '{user}': {e}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"Terminé : {total_created} notification(s) créée(s) pour {processed} utilisateur(s) traité(s)."
        ))
