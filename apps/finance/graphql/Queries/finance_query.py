import graphene
from django.db.models import Q
from apps.finance.models import FeeDefinition, Invoice, Payment
from ..Types.finance_type import FeeDefinitionType, InvoiceType, PaymentType
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset

FeeDefinitionPaginatedType = get_paginated_type(FeeDefinitionType)
InvoicePaginatedType = get_paginated_type(InvoiceType)
PaymentPaginatedType = get_paginated_type(PaymentType)

class FinanceQuery(graphene.ObjectType):
    # Fee Definitions
    fee_definitions = graphene.Field(
        FeeDefinitionPaginatedType,
        search=graphene.String(),
        level_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    # Invoices
    invoices = graphene.Field(
        InvoicePaginatedType,
        search=graphene.String(),
        student_id=graphene.Int(),
        status=graphene.String(),
        category=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    # Payments
    payments = graphene.Field(
        PaymentPaginatedType,
        invoice_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_fee_definitions(self, info, search=None, level_id=None, page=1, page_size=10):
        queryset = FeeDefinition.objects.all().order_by('level', 'category')
        if search:
            queryset = queryset.filter(name__icontains=search)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        
        return FeeDefinitionPaginatedType(**paginate_queryset(queryset, page, page_size))

    def resolve_invoices(self, info, search=None, student_id=None, status=None, category=None, page=1, page_size=10):
        queryset = Invoice.objects.all().order_by('-created_at')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(student__last_name__icontains=search) | 
                Q(student__matricule__icontains=search) | 
                Q(reference__icontains=search)
            )
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)
            
        return InvoicePaginatedType(**paginate_queryset(queryset, page, page_size))

    def resolve_payments(self, info, invoice_id=None, page=1, page_size=10):
        queryset = Payment.objects.all().order_by('-payment_date')
        if invoice_id:
            queryset = queryset.filter(invoice_id=invoice_id)
            
        return PaymentPaginatedType(**paginate_queryset(queryset, page, page_size))
