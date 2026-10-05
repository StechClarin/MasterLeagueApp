from rest_framework import serializers
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Enrollment

class EnrollmentSerializer(BaseSerializer):
    auto_create_classroom = serializers.BooleanField(required=False, write_only=True, default=False)

    class Meta:
        model = Enrollment
        fields = "__all__"

    def validate(self, data):
        data = super().validate(data)
        auto_create = data.pop('auto_create_classroom', False)
        classroom = data.get('classroom')

        if classroom:
            current_student_id = self.instance.student_id if self.instance else data.get('student')
            if hasattr(current_student_id, 'id'):
                current_student_id = current_student_id.id

            enrolled_count = Enrollment.objects.filter(
                classroom=classroom
            ).exclude(student_id=current_student_id).count()

            if enrolled_count >= classroom.capacity:
                if auto_create:
                    from apps.structure.models.classroom import ClassRoom
                    import re

                    base_name = classroom.name.strip()
                    match = re.match(r'^(.*?)(?:-(\d+))?$', base_name)
                    prefix = match.group(1).strip() if match else base_name

                    sibling_names = list(ClassRoom.objects.filter(
                        level=classroom.level,
                        academic_year=classroom.academic_year,
                        establishment=classroom.establishment
                    ).values_list('name', flat=True))

                    counter = 2
                    new_name = f"{prefix}-{counter}"
                    while new_name in sibling_names:
                        counter += 1
                        new_name = f"{prefix}-{counter}"

                    new_room = ClassRoom.objects.create(
                        name=new_name,
                        level=classroom.level,
                        academic_year=classroom.academic_year,
                        option=classroom.option,
                        capacity=classroom.capacity,
                        establishment=classroom.establishment
                    )
                    data['classroom'] = new_room
                else:
                    raise serializers.ValidationError({
                        "detail": f"La classe {classroom.name} est pleine ({enrolled_count}/{classroom.capacity} élèves).",
                        "code": "CLASSROOM_FULL",
                        "classroom_id": classroom.id,
                        "classroom_name": classroom.name,
                        "capacity": classroom.capacity,
                        "enrolled_count": enrolled_count
                    })
        return data

