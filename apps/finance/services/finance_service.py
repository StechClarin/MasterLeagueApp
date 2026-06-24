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
        from apps.core.models import Establishment
        
        year = date.today().year
        # Récupération du code établissement pour garantir l'unicité du préfixe
        est = Establishment.objects.get(id=self.establishment_id)
        # On utilise le code, sinon les 3 premières lettres du nom (nettoyé)
        est_code = (est.code or est.name[:3]).upper().replace(' ', '')
        
        prefix = f"FAC-{est_code}-{year}-"
        
        last_invoice = Invoice.objects.filter(
            reference__startswith=prefix,
            establishment_id=self.establishment_id
        ).order_by('-reference').first()
        
        seq = 1
        if last_invoice and last_invoice.reference:
            try:
                # On prend la dernière partie numérique
                parts = last_invoice.reference.split('-')
                seq = int(parts[-1]) + 1
            except (ValueError, IndexError):
                pass
                
        return f"{prefix}{seq:04d}"
    
    @staticmethod
    def generate_invoices_for_enrollment(enrollment):
        """
        Génère automatiquement les factures en fonction du niveau et de l'option de l'inscription.
        Logique de priorité (Surgical) : Étudiant > Classe > Option > Niveau (Par catégorie).
        """
        from django.db.models import Q
        
        # 1. Récupérer TOUS les candidats potentiels
        potential_fees = FeeDefinition.objects.filter(
            Q(level=enrollment.classroom.level, students__isnull=True, classrooms__isnull=True, option__isnull=True) | # Global Niveau
            Q(level=enrollment.classroom.level, option=enrollment.classroom.option) | # Par Filière/Option
            Q(classrooms=enrollment.classroom) | # Par Classe
            Q(students=enrollment.student), # Par Élève (Dérogation)
            academic_year=enrollment.academic_year,
            establishment=enrollment.establishment,
            is_active=True,
            is_required=True
        ).order_by('id')

        # 2. Arbitrage des priorités par catégorie ( Substitution )
        final_fees = FinanceService.resolve_fees_priority(potential_fees)

        if not final_fees:
            logger.warning(f"Aucun frais défini pour le niveau {enrollment.classroom.level} ({enrollment.academic_year})")
            return []

        # Instance du service pour utiliser la logique de référence
        service = FinanceService()
        service.set_context(None, enrollment.establishment_id)

        created_invoices = []
        for fee in final_fees:
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
                    custom_installments=fee.custom_installments,
                    status=InvoiceStatus.UNPAID,
                    reference=service.generate_invoice_reference()
                )
                created_invoices.append(invoice)
                logger.info(f"Facture générée : {invoice.title} ({invoice.reference}) pour {enrollment.student}")
        
        return created_invoices

    @staticmethod
    def recalculate_invoices_on_class_change(enrollment):
        """
        Supprime les anciennes factures (si non payées) et régénère les nouvelles
        suite à un changement de classe.
        """
        from apps.finance.models import Invoice, Payment
        
        invoices = Invoice.objects.filter(enrollment=enrollment)
        
        if Payment.objects.filter(invoice__in=invoices).exists():
            logger.error(f"Impossible de recalculer les factures de {enrollment.student} : Des paiements existent.")
            return False
            
        # Suppression des anciennes factures
        invoices.delete()
        
        # Régénération
        FinanceService.generate_invoices_for_enrollment(enrollment)
        return True

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

    def get_collection_report(self, classroom_id, start_date_str, end_date_str):
        """
        Génère un état de recouvrement périodique pour une classe.
        """
        from apps.students.models import Enrollment
        from django.utils.dateparse import parse_date
        
        start_date = parse_date(start_date_str) if isinstance(start_date_str, str) else start_date_str
        end_date = parse_date(end_date_str) if isinstance(end_date_str, str) else end_date_str
        
        if not start_date: start_date = date.today().replace(day=1)
        if not end_date: end_date = date.today()

        query = {
            'establishment_id': self.establishment_id,
            'status': 'REGISTERED'
        }
        if classroom_id:
            query['classroom_id'] = classroom_id
            
        enrollments = Enrollment.objects.filter(**query).select_related('student', 'classroom', 'academic_year', 'classroom__level')

        report_data = []
        total_class_expected_period = 0
        total_class_paid_period = 0
        total_class_due_final = 0

        for enrollment in enrollments:
            # 1. Identifier tous les frais applicables (obligatoires et optionnels)
            potential_fees = FeeDefinition.objects.filter(
                Q(level=enrollment.classroom.level, students__isnull=True, classrooms__isnull=True, option__isnull=True) |
                Q(level=enrollment.classroom.level, option=enrollment.classroom.option) |
                Q(students=enrollment.student) |
                Q(classrooms=enrollment.classroom),
                academic_year=enrollment.academic_year,
                establishment=enrollment.establishment,
                is_active=True
            ).order_by('id')
            
            fee_defs = FinanceService.resolve_fees_priority(potential_fees)

            mandatory_fees = [f for f in fee_defs if f.is_required]
            optional_fees = [f for f in fee_defs if not f.is_required]

            academic_start = enrollment.academic_year.start_date
            months_until_start = (start_date.year - academic_start.year) * 12 + (start_date.month - academic_start.month)
            months_until_end = (end_date.year - academic_start.year) * 12 + (end_date.month - academic_start.month) + 1

            def calculate_expected(fees_list):
                exp_start = 0
                exp_end = 0
                for fee in fees_list:
                    if fee.payment_modality == 'UNIQUE':
                        exp_start += fee.amount
                        exp_end += fee.amount
                    else:
                        count = fee.installment_count or 1
                        periods_start = min(max(0, months_until_start), count)
                        periods_end = min(max(0, months_until_end), count)
                        if fee.custom_installments and len(fee.custom_installments) == count:
                            custom_insts = sorted(fee.custom_installments, key=lambda x: int(x.get('tranche', 0)))
                            exp_start += sum(float(inst.get('amount', 0)) for inst in custom_insts[:periods_start])
                            exp_end += sum(float(inst.get('amount', 0)) for inst in custom_insts[:periods_end])
                        else:
                            monthly_amount = fee.amount / count
                            exp_start += (monthly_amount * periods_start)
                            exp_end += (monthly_amount * periods_end)
                return exp_end, max(0, exp_end - exp_start)

            # Frais obligatoires
            mand_expected_until_end, expected_period = calculate_expected(mandatory_fees)
            mand_categories = [f.category for f in mandatory_fees]
            
            payments_period = Payment.objects.filter(
                invoice__enrollment=enrollment, invoice__category__in=mand_categories,
                payment_date__date__range=[start_date, end_date], establishment_id=self.establishment_id
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            total_paid_to_date = Payment.objects.filter(
                invoice__enrollment=enrollment, invoice__category__in=mand_categories,
                payment_date__date__lte=end_date, establishment_id=self.establishment_id
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            remaining_balance = max(0, mand_expected_until_end - total_paid_to_date)
            total_expected_global = sum(f.amount for f in mandatory_fees)
            total_paid_global = total_paid_to_date
            remaining_global = max(0, total_expected_global - total_paid_global)

            # Frais optionnels
            opt_expected_until_end, opt_expected_period = calculate_expected(optional_fees)
            opt_categories = [f.category for f in optional_fees]
            
            opt_payments_period = Payment.objects.filter(
                invoice__enrollment=enrollment, invoice__category__in=opt_categories,
                payment_date__date__range=[start_date, end_date], establishment_id=self.establishment_id
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            opt_total_paid_to_date = Payment.objects.filter(
                invoice__enrollment=enrollment, invoice__category__in=opt_categories,
                payment_date__date__lte=end_date, establishment_id=self.establishment_id
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            opt_remaining_balance = max(0, opt_expected_until_end - opt_total_paid_to_date)
            opt_total_expected_global = sum(f.amount for f in optional_fees)
            opt_remaining_global = max(0, opt_total_expected_global - opt_total_paid_to_date)

            is_up_to_date = total_paid_to_date >= mand_expected_until_end

            report_data.append({
                'student': {
                    'id': enrollment.student.id,
                    'firstName': enrollment.student.first_name,
                    'lastName': enrollment.student.last_name,
                    'matricule': enrollment.student.matricule,
                    'classroom_id': enrollment.classroom.id,
                    'classroom_name': enrollment.classroom.name,
                },
                'total_expected_global': total_expected_global,
                'total_paid_global': total_paid_global,
                'expected_period': expected_period,
                'paid_period': payments_period,
                'due_balance': remaining_balance,
                'remaining_global': remaining_global,
                'is_up_to_date': is_up_to_date,
                
                'opt_expected_period': opt_expected_period,
                'opt_paid_period': opt_payments_period,
                'opt_due_balance': opt_remaining_balance,
                'opt_total_expected_global': opt_total_expected_global,
                'opt_total_paid_global': opt_total_paid_to_date,
                'opt_remaining_global': opt_remaining_global
            })

        is_global = not classroom_id

        # Group items by classroom
        classrooms_dict = {}
        for item in report_data:
            cid = item['student']['classroom_id']
            cname = item['student']['classroom_name']
            if cid not in classrooms_dict:
                classrooms_dict[cid] = {
                    'classroom_id': cid,
                    'classroom_name': cname,
                    'items': [],
                    'totals': {
                        'total_expected_global': 0.0,
                        'total_paid_global': 0.0,
                        'total_expected_period': 0.0,
                        'total_paid_period': 0.0,
                        'total_remaining_period': 0.0,
                        'total_remaining_global': 0.0,
                        
                        'opt_total_expected_global': 0.0,
                        'opt_total_paid_global': 0.0,
                        'opt_total_expected_period': 0.0,
                        'opt_total_paid_period': 0.0,
                        'opt_total_remaining_period': 0.0,
                        'opt_total_remaining_global': 0.0,
                    }
                }
            
            c = classrooms_dict[cid]
            c['items'].append(item)
            
            # Accumulate totals
            c['totals']['total_expected_global'] += float(item['total_expected_global'])
            c['totals']['total_paid_global'] += float(item['total_paid_global'])
            c['totals']['total_expected_period'] += float(item['expected_period'])
            c['totals']['total_paid_period'] += float(item['paid_period'])
            c['totals']['total_remaining_period'] += float(item['due_balance'])
            c['totals']['total_remaining_global'] += float(item['remaining_global'])
            
            c['totals']['opt_total_expected_global'] += float(item['opt_total_expected_global'])
            c['totals']['opt_total_paid_global'] += float(item['opt_total_paid_global'])
            c['totals']['opt_total_expected_period'] += float(item['opt_expected_period'])
            c['totals']['opt_total_paid_period'] += float(item['opt_paid_period'])
            c['totals']['opt_total_remaining_period'] += float(item['opt_due_balance'])
            c['totals']['opt_total_remaining_global'] += float(item['opt_remaining_global'])

        # Calculate recovery rates for each classroom
        for c in classrooms_dict.values():
            exp_period = c['totals']['total_expected_period']
            paid_period = c['totals']['total_paid_period']
            c['totals']['recovery_rate'] = round((paid_period / exp_period * 100) if exp_period > 0 else 100.0, 2)
            if c['totals']['recovery_rate'] > 100.0: c['totals']['recovery_rate'] = 100.0
            
            opt_exp_period = c['totals']['opt_total_expected_period']
            opt_paid_period = c['totals']['opt_total_paid_period']
            c['totals']['opt_recovery_rate'] = round((opt_paid_period / opt_exp_period * 100) if opt_exp_period > 0 else 100.0, 2)
            if c['totals']['opt_recovery_rate'] > 100.0: c['totals']['opt_recovery_rate'] = 100.0

        # Sort classrooms by name
        classrooms_list = sorted(classrooms_dict.values(), key=lambda x: x['classroom_name'])

        # Global totals
        total_exp_global = sum(c['totals']['total_expected_global'] for c in classrooms_list)
        total_pd_global = sum(c['totals']['total_paid_global'] for c in classrooms_list)
        total_exp_period = sum(c['totals']['total_expected_period'] for c in classrooms_list)
        total_pd_period = sum(c['totals']['total_paid_period'] for c in classrooms_list)
        total_rem_period = sum(c['totals']['total_remaining_period'] for c in classrooms_list)
        total_rem_global = sum(c['totals']['total_remaining_global'] for c in classrooms_list)
        
        opt_total_exp_global = sum(c['totals']['opt_total_expected_global'] for c in classrooms_list)
        opt_total_pd_global = sum(c['totals']['opt_total_paid_global'] for c in classrooms_list)
        opt_total_exp_period = sum(c['totals']['opt_total_expected_period'] for c in classrooms_list)
        opt_total_pd_period = sum(c['totals']['opt_total_paid_period'] for c in classrooms_list)
        opt_total_rem_period = sum(c['totals']['opt_total_remaining_period'] for c in classrooms_list)
        opt_total_rem_global = sum(c['totals']['opt_total_remaining_global'] for c in classrooms_list)
        
        recovery_rate = (total_pd_period / total_exp_period * 100) if total_exp_period > 0 else 100.0
        if recovery_rate > 100.0: recovery_rate = 100.0
        
        opt_recovery_rate = (opt_total_pd_period / opt_total_exp_period * 100) if opt_total_exp_period > 0 else 100.0
        if opt_recovery_rate > 100.0: opt_recovery_rate = 100.0

        return {
            'start_date': start_date.strftime('%d/%m/%Y'),
            'end_date': end_date.strftime('%d/%m/%Y'),
            'classroom_name': 'Toutes les classes' if is_global else (enrollments.first().classroom.name if enrollments.exists() else 'N/A'),
            'is_global': is_global,
            'classrooms': classrooms_list,
            'totals': {
                'total_expected_global': float(total_exp_global),
                'total_paid_global': float(total_pd_global),
                'total_expected_period': float(total_exp_period),
                'total_paid_period': float(total_pd_period),
                'total_remaining_period': float(total_rem_period),
                'total_remaining_global': float(total_rem_global),
                'recovery_rate': round(float(recovery_rate), 2),
                
                'opt_total_expected_global': float(opt_total_exp_global),
                'opt_total_paid_global': float(opt_total_pd_global),
                'opt_total_expected_period': float(opt_total_exp_period),
                'opt_total_paid_period': float(opt_total_pd_period),
                'opt_total_remaining_period': float(opt_total_rem_period),
                'opt_total_remaining_global': float(opt_total_rem_global),
                'opt_recovery_rate': round(float(opt_recovery_rate), 2)
            }
        }

    @staticmethod
    def resolve_fees_priority(potential_fees):
        """
        Méthode utilitaire pour arbitrer les priorités de frais par catégorie.
        Surgical Priority: Student (4) > Class (3) > Option (2) > Level (1)
        """
        fees_by_category = {}
        
        for fee in potential_fees:
            category = fee.category
            current_best = fees_by_category.get(category)
            
            # Calcul du score de précision
            score = 1 # Niveau (par défaut)
            if fee.option_id: score = 2
            if fee.classrooms.exists(): score = 3
            # On vérifie si l'item a des relations ManyToMany chargées ou via ID
            # Dans un queryset, 'students' peut être accédé
            if fee.students.exists(): score = 4 
            
            if not current_best or score >= current_best['score']:
                fees_by_category[category] = {'fee': fee, 'score': score}

        return [item['fee'] for item in fees_by_category.values()]
