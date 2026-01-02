from apps.core.services import BaseService
from ..models.teaching_assignment import TeachingAssignment

class TeachingAssignmentService(BaseService):
    def __init__(self):
        super().__init__(TeachingAssignment)
