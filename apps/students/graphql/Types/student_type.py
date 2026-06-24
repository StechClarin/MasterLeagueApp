import base64
import graphene
from graphene_django.types import DjangoObjectType
from ...models import Student
from .student_health_type import StudentHealthType

class StudentType(DjangoObjectType):
    class Meta:
        model = Student
        fields = "__all__"
    siblings = graphene.List(lambda: StudentType)
    photo = graphene.String()
    qr_code_base64 = graphene.String()

    def resolve_photo(self, info):
        if self.photo and hasattr(self.photo, 'url'):
            request = info.context
            if hasattr(request, 'build_absolute_uri'):
                return request.build_absolute_uri(self.photo.url)
            from django.conf import settings
            return f"{settings.MEDIA_URL}{self.photo.name}"
        return None

    def resolve_siblings(self, info):
        # Siblings are students who share at least one guardian with the current student,
        # excluding the student themselves.
        return Student.objects.filter(
            guardians__in=self.guardians.all()
        ).exclude(id=self.id).distinct()

    def resolve_qr_code_base64(self, info):
        from apps.core.utils.qr_generator import QRCodeGenerator
        
        # Generate the QR Code File (in memory)
        img_file = QRCodeGenerator.generate_auth_qr({
            'id': str(self.id),
            'matricule': self.matricule,
            'role': 'STUDENT'
        })
        
        # Read the file's binary content and encode to base64
        img_file.seek(0)
        encoded = base64.b64encode(img_file.read()).decode('utf-8')
        return f"data:image/png;base64,{encoded}"
