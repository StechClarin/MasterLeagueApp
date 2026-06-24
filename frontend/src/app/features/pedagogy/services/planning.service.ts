import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllPlanningsGQL, GetPlanningByIdGQL, GetPlanningDependenciesGQL, GetPlanningDetailsGQL, GetCompiledScheduleGQL } from '../graphql/pedagogy.generated';

@Injectable({ providedIn: 'root' })
export class PlanningService extends BaseService {
    endpoint = 'planning';

    getAllGQL = inject(GetAllPlanningsGQL);
    getByIdGQL = inject(GetPlanningByIdGQL);
    getDependenciesGQL = inject(GetPlanningDependenciesGQL);
    getDetailsGQL = inject(GetPlanningDetailsGQL);
    getCompiledScheduleGQL = inject(GetCompiledScheduleGQL);

    getQuery() {
        return this.getAllGQL.document;
    }

    getByIdQuery() {
        return this.getByIdGQL.document;
    }

    getDependencies() {
        return this.getDependenciesGQL.fetch();
    }

    getCompiledSchedule(startDate: string, endDate: string, classroomId?: string, personnelId?: string) {
        return this.getCompiledScheduleGQL.fetch({ startDate, endDate, classroomId, personnelId });
    }

    cancelEvent(eventId: string, targetDate: string, eventType: string) {
        return this.http.post<any>(`${this.apiUrl}/cancel_event/`, {
            event_id: eventId,
            target_date: targetDate,
            event_type: eventType
        });
    }

    rescheduleEvent(eventId: string, originalDate: string, newDate: string, eventType: string, newStartTime?: string, newEndTime?: string, newRoomId?: string) {
        return this.http.post<any>(`${this.apiUrl}/reschedule_event/`, {
            event_id: eventId,
            original_date: originalDate,
            new_date: newDate,
            event_type: eventType,
            new_start_time: newStartTime,
            new_end_time: newEndTime,
            new_room_id: newRoomId
        });
    }
}
