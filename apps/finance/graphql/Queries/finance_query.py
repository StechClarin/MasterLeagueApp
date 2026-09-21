import graphene
from django.db.models import Q
from apps.finance.models import FeeDefinition, Invoice, Payment, Expense
from ..Types.finance_type import FeeDefinitionType, InvoiceType, PaymentType, ExpenseType
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset

FeeDefinitionPaginatedType = get_paginated_type(FeeDefinitionType)
InvoicePaginatedType = get_paginated_type(InvoiceType)
PaymentPaginatedType = get_paginated_type(PaymentType)
ExpensePaginatedType = get_paginated_type(ExpenseType)

class FinanceQuery(graphene.ObjectType):
    # Fee Definitions
    fee_definitions = graphene.Field(
        FeeDefinitionPaginatedType,
        search=graphene.String(),
        level_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    # Invoices
    invoices = graphene.Field(
        InvoicePaginatedType,
        search=graphene.String(),
        student_id=graphene.ID(),
        status=graphene.String(),
        category=graphene.String(),
        classroom_id=graphene.ID(),
        max_paid_amount=graphene.Float(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    # Payments
    payments = graphene.Field(
        PaymentPaginatedType,
        search=graphene.String(),
        invoice_id=graphene.ID(),
        payment_date=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    # Expenses
    expenses = graphene.Field(
        ExpensePaginatedType,
        search=graphene.String(),
        category=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    # Single Expense
    expense = graphene.Field(ExpenseType, id=graphene.ID(required=True))

    # Dynamic Filter Categories (based on created FeeDefinitions)
    used_fee_categories = graphene.List(graphene.JSONString)

    # Single Payment (for receipts)
    payment = graphene.Field(PaymentType, id=graphene.ID(required=True))

    def resolve_payment(self, info, id):
        est_id = info.context.establishment_id
        return Payment.objects.get(id=id, establishment_id=est_id)

    def resolve_fee_definitions(self, info, search=None, level_id=None, page=1, page_size=10):
        est_id = info.context.establishment_id
        queryset = FeeDefinition.objects.filter(establishment_id=est_id).order_by('level', 'category')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        
        return FeeDefinitionPaginatedType(**paginate_queryset(queryset, page, page_size))  # type: ignore

    def resolve_invoices(self, info, search=None, student_id=None, status=None, category=None, classroom_id=None, max_paid_amount=None, page=1, page_size=10):
        est_id = info.context.establishment_id
        queryset = Invoice.objects.filter(establishment_id=est_id).order_by('-created_at')
        
        if search:
            import operator
            from functools import reduce
            
            conditions = [
                Q(title__icontains=search),
                Q(student__last_name__icontains=search),
                Q(student__matricule__icontains=search),
                Q(reference__icontains=search)
            ]
            queryset = queryset.filter(reduce(operator.or_, conditions))
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
        if classroom_id:
            queryset = queryset.filter(enrollment__classroom_id=classroom_id)
        if max_paid_amount is not None:
            queryset = queryset.filter(paid_amount__lt=max_paid_amount)
            
        return InvoicePaginatedType(**paginate_queryset(queryset, page, page_size))  # type: ignore

    def resolve_payments(self, info, search=None, invoice_id=None, payment_date=None, page=1, page_size=10):
        est_id = info.context.establishment_id
        queryset = Payment.objects.filter(establishment_id=est_id).order_by('-payment_date')
        
        if search:
            import operator
            from functools import reduce
            conditions = [
                Q(invoice__title__icontains=search),
                Q(invoice__student__last_name__icontains=search),
                Q(invoice__student__matricule__icontains=search),
                Q(reference__icontains=search)
            ]
            queryset = queryset.filter(reduce(operator.or_, conditions))
            
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
            
        if payment_date:
            queryset = queryset.filter(payment_date__date=payment_date)
            
        return PaymentPaginatedType(**paginate_queryset(queryset, page, page_size))  # type: ignore

    def resolve_expenses(self, info, search=None, category=None, page=1, page_size=10):
        est_id = info.context.establishment_id
        queryset = Expense.objects.filter(establishment_id=est_id).order_by('-expense_date')

        if search:
            import operator
            from functools import reduce
            conditions = [
                Q(title__icontains=search),
                Q(reference__icontains=search),
                Q(description__icontains=search),
            ]
            queryset = queryset.filter(reduce(operator.or_, conditions))

        if category:
            queryset = queryset.filter(category=category)

        return ExpensePaginatedType(**paginate_queryset(queryset, page, page_size))  # type: ignore

    def resolve_expense(self, info, id):
        est_id = info.context.establishment_id
        return Expense.objects.get(id=id, establishment_id=est_id)

    def resolve_used_fee_categories(self, info):
        """
        Retourne la liste des catégories uniques de tarifs/factures pour l'établissement courant.
        """
        est_id = info.context.establishment_id
        from apps.finance.models.fee_definition import FeeCategory, FeeDefinition
        from apps.finance.models.invoice import Invoice

        # Récupération des catégories distinctes présentes dans les factures ou définitions de frais
        used_cats = list(Invoice.objects.filter(establishment_id=est_id).values_list('category', flat=True).distinct())
        if not used_cats:
            used_cats = list(FeeDefinition.objects.filter(establishment_id=est_id).values_list('category', flat=True).distinct())
        
        # Fallback sur les catégories standard si aucune donnée
        if not used_cats or not any(used_cats):
            used_cats = [choice[0] for choice in FeeCategory.choices]

        category_choices = dict(FeeCategory.choices)

        result = []
        for cat in used_cats:
            if cat and cat in category_choices:
                result.append({
                    "label": category_choices[cat],
                    "value": cat,
                    "category": cat
                })
        return result

