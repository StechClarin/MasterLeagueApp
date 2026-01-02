from apps.core.services import BaseService
from ..models.teacher import Teacher

class TeacherService(BaseService):
    def __init__(self):
        super().__init__(Teacher)
