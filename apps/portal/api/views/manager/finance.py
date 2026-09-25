from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from django.db.models import Sum

from apps.students.models import Student, Enrollment
from apps.finance.models import Payment, Invoice, PaymentMethod
from apps.finance.models.fee_definition import FeeCategory
from apps.finance.services.payment_service import PaymentService
from apps.portal.api.views.utils import get_request_establishment_id


class ManagerFinanceView(APIView):
    """
    GET /api/portal/manager/finance/?establishment_id=...
    Récupère le récapitulatif financier, la liste des factures, l'historique et les référentiels.

    POST /api/portal/manager/finance/
    Enregistre un paiement via PaymentService (enfant de BaseService) et met à jour automatiquement
    le statut de l'inscription et la facture associée.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def get(self, request):
        est_id = get_request_establishment_id(request)

        payment_qs = Payment.objects.filter(is_deleted=False)
        student_qs = Student.objects.filter(is_active=True)
        enrollment_qs = Enrollment.objects.filter(is_deleted=False)
        invoice_qs = Invoice.objects.filter(is_deleted=False)

        if est_id:
            payment_qs = payment_qs.filter(establishment_id=est_id)
            student_qs = student_qs.filter(establishment_id=est_id)
            enrollment_qs = enrollment_qs.filter(establishment_id=est_id)
            invoice_qs = invoice_qs.filter(establishment_id=est_id)

        search_query = request.query_params.get("search", "").strip()
        category_filter = request.query_params.get("category", "").strip()
        status_filter = request.query_params.get("status", "").strip()

        if search_query:
            invoice_qs = invoice_qs.filter(
                Q(student__first_name__icontains=search_query) |
                Q(student__last_name__icontains=search_query) |
                Q(student__matricule__icontains=search_query) |
                Q(reference__icontains=search_query) |
                Q(title__icontains=search_query)
            )

        if category_filter:
            invoice_qs = invoice_qs.filter(category=category_filter)

        if status_filter:
            invoice_qs = invoice_qs.filter(status=status_filter)

        # Calcul des métriques globales
        total_collected = payment_qs.aggregate(total=Sum("amount"))["total"] or 0
        total_invoiced = invoice_qs.aggregate(total=Sum("total_amount"))["total"] or 0
        total_remaining = total_invoiced - total_collected
        if total_remaining < 0:
            total_remaining = 0
        collection_rate = round((float(total_collected) / float(total_invoiced) * 100), 1) if total_invoiced > 0 else 0.0
        invoice_count = invoice_qs.count()
        pending_students_count = enrollment_qs.filter(status="PENDING").count()

        # Pagination des factures
        try:
            page = max(1, int(request.query_params.get("page", 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page_size = 15

        total_pages = max(1, (invoice_count + page_size - 1) // page_size) if invoice_count > 0 else 1
        offset = (page - 1) * page_size

        # Liste des factures pour la grille principale
        invoices_data = []
        for inv in invoice_qs.select_related("student").order_by("-created_at")[offset : offset + page_size]:
            st = inv.student
            class_name = ""
            if st:
                en = Enrollment.objects.filter(student=st, is_deleted=False).select_related("classroom").first()
                if en and en.classroom:
                    class_name = en.classroom.name
            
            invoices_data.append({
                "id": str(inv.pk),
                "reference": inv.reference or f"FAC-{inv.pk}",
                "studentId": str(st.pk) if st else "",
                "studentName": f"{st.first_name} {st.last_name}" if st else "Non assigné",
                "studentMatricule": st.matricule if st else "",
                "className": class_name,
                "title": inv.title or "Facture",
                "category": inv.category,
                "categoryLabel": dict(FeeCategory.choices).get(inv.category, inv.category),
                "totalAmount": float(inv.total_amount),
                "paidAmount": float(inv.paid_amount),
                "remainingAmount": float(inv.remaining_amount),
                "dueDate": inv.due_date.strftime("%Y-%m-%d") if inv.due_date else "",
                "status": inv.status,
                "createdAt": inv.created_at.strftime("%Y-%m-%d"),
            })

        # Historique des paiements
        history_data = []
        for p in payment_qs.select_related("invoice", "invoice__student").order_by("-payment_date", "-created_at")[:50]:
            student_name = "N/A"
            inv_ref = ""
            if p.invoice:
                inv_ref = p.invoice.reference or f"FAC-{p.invoice.pk}"
                if p.invoice.student:
                    student_name = f"{p.invoice.student.first_name} {p.invoice.student.last_name}"
            
            history_data.append({
                "id": str(p.pk),
                "invoiceId": str(p.invoice_id) if p.invoice_id else "",
                "invoiceReference": inv_ref,
                "reference": p.reference or f"RCP-{p.pk}",
                "studentName": student_name,
                "amount": float(p.amount),
                "method": p.payment_method,
                "methodLabel": dict(PaymentMethod.choices).get(p.payment_method, p.payment_method),
                "date": p.payment_date.strftime("%Y-%m-%d") if p.payment_date else "",
                "note": p.note or "",
            })

        # Référentiels pour filtres et formulaires
        categories_data = [
            {"value": "REGISTRATION", "label": "Frais d'Inscription"},
            {"value": "TUITION", "label": "Frais de Scolarité"},
            {"value": "CANTEEN", "label": "Cantine"},
            {"value": "TRANSPORT", "label": "Transport"},
            {"value": "OTHER", "label": "Autre"},
        ]

        statuses_data = [
            {"value": "UNPAID", "label": "Impayé"},
            {"value": "PARTIAL", "label": "Partiel"},
            {"value": "PAID", "label": "Payé"},
            {"value": "CANCELLED", "label": "Annulé"},
        ]

        payment_methods_data = [
            {"value": "CASH", "label": "Espèces"},
            {"value": "BANK_TRANSFER", "label": "Virement Bancaire"},
            {"value": "MOBILE_MONEY", "label": "Mobile Money"},
            {"value": "CHECK", "label": "Chèque"},
        ]

        return Response({
            "metrics": {
                "totalInvoiced": float(total_invoiced),
                "totalCollected": float(total_collected),
                "totalRemaining": float(total_remaining),
                "collectionRate": collection_rate,
                "invoiceCount": invoice_count,
                "pendingCount": pending_students_count,
            },
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "totalCount": invoice_count,
                "totalPages": total_pages,
            },
            "invoices": invoices_data,
            "history": history_data,
            "categories": categories_data,
            "statuses": statuses_data,
            "paymentMethods": payment_methods_data,
        }, status=200)

    def post(self, request):
        est_id = get_request_establishment_id(request)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)

        invoice_id = data.get("invoice_id") or data.get("invoiceId")
        student_id = data.get("student_id") or data.get("studentId")
        amount = data.get("amount")
        payment_method = data.get("payment_method", "CASH")

        if not amount:
            return Response({"error": "Le montant du paiement est obligatoire."}, status=400)

        # Si pas de facture spécifiée mais un élève, on cherche ou crée la facture d'inscription
        if not invoice_id and student_id:
            inv = Invoice.objects.filter(student_id=student_id, category="REGISTRATION", is_deleted=False).first()
            if not inv:
                inv = Invoice.objects.create(
                    student_id=student_id,
                    establishment_id=est_id,
                    title="Frais d'inscription",
                    category="REGISTRATION",
                    total_amount=amount,
                    status="UNPAID",
                )
            invoice_id = str(inv.pk)

        if not invoice_id:
            return Response({"error": "Impossible de déterminer la facture associée au paiement."}, status=400)

        # Utilisation de PaymentService (enfant de BaseService)
        service = PaymentService(establishment_id=est_id)
        payment_data = {
            "invoice": invoice_id,
            "amount": amount,
            "payment_method": payment_method,
        }
        if est_id:
            payment_data["establishment_id"] = est_id

        try:
            payment = service.save(payment_data)
            return Response({
                "success": True,
                "message": "Paiement enregistré avec succès.",
                "payment": {
                    "id": str(payment.pk),
                    "reference": payment.reference,
                    "amount": float(payment.amount),
                }
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
