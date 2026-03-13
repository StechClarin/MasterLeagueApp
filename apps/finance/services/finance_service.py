from apps.core.services.BaseService import BaseService
from apps.finance.models import FeeDefinition, Invoice, InvoiceStatus, Payment
import logging
from datetime import datetime, date
from django.db.models import Sum, Q

logger = logging.getLogger(__name__)

class FinanceService(BaseService):
    """
    Service pour la gestion financière (Tarification, Facturation).
    """
    model = Invoice

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)
        
        # Génération de la référence de facture si nouvelle
        if not instance and not data.get('reference'):
            data['reference'] = self.generate_invoice_reference()
            
        return data

    def generate_invoice_reference(self):
        from datetime import date
        year = date.today().year
        prefix = f"FAC-{year}-"
        
        last_invoice = Invoice.objects.filter(
            reference__startswith=prefix,
            establishment_id=self.establishment_id
        ).order_by('-reference').first()
        
        seq = 1
        if last_invoice and last_invoice.reference:
            try:
                seq = int(last_invoice.reference.split('-')[-1]) + 1
            except (ValueError, IndexError):
                pass
                
        return f"{prefix}{seq:04d}"
    
    @staticmethod
    def generate_invoices_for_enrollment(enrollment):
        """
        Génère automatiquement les factures en fonction du niveau de l'inscription.
        """
        from django.db.models import Q
        fees = FeeDefinition.objects.filter(
            Q(level=enrollment.classroom.level, students__isnull=True, classroom__isnull=True) |
            Q(students=enrollment.student) |
            Q(classroom=enrollment.classroom),
            academic_year=enrollment.academic_year,
            establishment=enrollment.establishment,
            is_active=True,
            is_required=True
        ).distinct()
        
        if not fees.exists():
            logger.warning(f"Aucun frais défini pour le niveau {enrollment.classroom.level} ({enrollment.academic_year})")
            return []

        # Instance du service pour utiliser la logique de référence
        service = FinanceService()
        service.set_context(None, enrollment.establishment_id)

        created_invoices = []
        for fee in fees:
            # Vérifier si une facture identique existe déjà pour cet élève/inscription
            exists = Invoice.objects.filter(
                student=enrollment.student,
                enrollment=enrollment,
                category=fee.category,
                establishment=enrollment.establishment
            ).exists()
            
            if not exists:
                # On utilise create avec la référence générée
                invoice = Invoice.objects.create(
                    student=enrollment.student,
                    enrollment=enrollment,
                    establishment=enrollment.establishment,
                    title=f"{fee.name} - {enrollment.academic_year.name}",
                    total_amount=fee.amount,
                    category=fee.category,
                    installment_count=fee.installment_count or 1,
                    status=InvoiceStatus.UNPAID,
                    reference=service.generate_invoice_reference()
                )
                created_invoices.append(invoice)
                logger.info(f"Facture générée : {invoice.title} ({invoice.reference}) pour {enrollment.student}")
        
        return created_invoices

    def get_student_financial_status(self, student_id):
        """
        Calcule la situation financière globale d'un élève.
        """
        invoices = Invoice.objects.filter(
            student_id=student_id, 
            establishment_id=self.establishment_id
        )
        
        total_due = sum(i.total_amount for i in invoices)
        total_paid = sum(i.paid_amount for i in invoices)
        remaining = total_due - total_paid
        
        return {
            'total_due': total_due,
            'total_paid': total_paid,
            'remaining_total': remaining,
            'invoices_count': invoices.count()
        }

    def get_collection_report(self, classroom_id, report_date_str):
        """
        Génère un état de recouvrement pour une classe à une date donnée.
        """
        from apps.students.models import Enrollment
        from django.utils.dateparse import parse_date
        
        report_date = parse_date(report_date_str) if isinstance(report_date_str, str) else report_date_str
        if not report_date:
            report_date = date.today()

        enrollments = Enrollment.objects.filter(
            classroom_id=classroom_id,
            establishment_id=self.establishment_id,
            status='ACTIVE'
        ).select_related('student', 'classroom', 'academic_year', 'classroom__level')

        report_data = []
        total_class_expected = 0
        total_class_paid = 0
        total_class_due = 0

        for enrollment in enrollments:
            # 1. Identifier tous les frais applicables à cet élève
            fee_defs = FeeDefinition.objects.filter(
                Q(level=enrollment.classroom.level, students__isnull=True, classroom__isnull=True) |
                Q(students=enrollment.student) |
                Q(classroom=enrollment.classroom),
                academic_year=enrollment.academic_year,
                establishment=enrollment.establishment,
                is_active=True,
                is_required=True
            ).distinct()

            student_expected = 0
            student_paid = 0
            
            # Calcul du théorique attendu à la date du rapport
            start_date = enrollment.academic_year.start_date
            # Calcul simpliste du nombre de mois écoulés (incluant le mois de début)
            months_elapsed = (report_date.year - start_date.year) * 12 + (report_date.month - start_date.month) + 1
            months_elapsed = max(1, months_elapsed)

            for fee in fee_defs:
                if fee.payment_modality == 'UNIQUE':
                    # On considère que les frais uniques sont dus dès le premier mois
                    student_expected += fee.amount
                else:
                    # Pour les tranches, on calcule le prorata
                    count = fee.installment_count or 1
                    monthly_amount = fee.amount / count
                    # On ne peut pas demander plus que le montant total
                    periods_to_pay = min(months_elapsed, count)
                    student_expected += (monthly_amount * periods_to_pay)

            # 2. Récupérer le perçu total pour cet élève (sur cette année/inscription)
            actual_invoices = Invoice.objects.filter(
                student=enrollment.student,
                enrollment=enrollment,
                establishment_id=self.establishment_id
            )
            student_paid = actual_invoices.aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0
            
            # 3. Calcul du reste à payer à date
            student_due = student_expected - student_paid
            if student_due < 0: student_due = 0 # Trop-perçu ou avance

            report_data.append({
                'student': {
                    'id': enrollment.student.id,
                    'firstName': enrollment.student.first_name,
                    'lastName': enrollment.student.last_name,
                    'matricule': enrollment.student.matricule,
                },
                'expected_amount': float(student_expected),
                'paid_amount': float(student_paid),
                'due_amount': float(student_due),
            })

            total_class_expected += student_expected
            total_class_paid += student_paid
            total_class_due += student_due

        # Calcul du taux de recouvrement
        recovery_rate = (total_class_paid / total_class_expected * 100) if total_class_expected > 0 else 0

        return {
            'period': report_date.strftime('%B %Y'),
            'classroom_name': enrollments.first().classroom.name if enrollments.exists() else 'N/A',
            'items': report_data,
            'totals': {
                'total_expected': float(total_class_expected),
                'total_paid': float(total_class_paid),
                'total_due': float(total_class_due),
                'recovery_rate': round(float(recovery_rate), 2)
            }
        }
