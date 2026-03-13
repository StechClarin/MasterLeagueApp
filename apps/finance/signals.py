from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.students.models import Enrollment
from apps.finance.services.finance_service import FinanceService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Enrollment)
def create_invoices_on_enrollment(sender, instance, created, **kwargs):
    """
    Signal déclenché après la création d'une inscription pour générer les factures.
    """
    if created:
        try:
            FinanceService.generate_invoices_for_enrollment(instance)
        except Exception as e:
            logger.error(f"Erreur lors de la génération automatique de facture pour {instance} : {str(e)}")
