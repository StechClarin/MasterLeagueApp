import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllGradesGQL } from '../graphql/evaluations.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GradeService extends BaseService {
    override endpoint = 'grade';
    private generatedGQL = inject(GetAllGradesGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    override list(evaluationSessionId?: string) {
        return this.generatedGQL.fetch({
            evaluationSessionId,
            page: 1,
            pageSize: 500 // High enough for a classroom
        }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.grades?.items || [])
        );
    }

    listByPeriodAndClass(academicPeriodId: string, classroomId: string) {
        return this.generatedGQL.fetch({
            academicPeriodId,
            classroomId,
            page: 1,
            pageSize: 2000 // All grades for all sessions in this class/period
        }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.grades?.items || [])
        );
    }

    listByPeriod(academicPeriodId: string) {
        return this.generatedGQL.fetch({
            academicPeriodId,
            page: 1,
            pageSize: 10000 // All grades in the establishment for this period
        }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.grades?.items || [])
        );
    }

    /**
     * Bulk save grades for an evaluation
     */
    bulkSave(evaluationId: string, grades: any[]) {
        return this.http.post(`${this.apiUrl}/bulk_save/`, {
            evaluation_id: evaluationId,
            grades: grades
        });
    }
}
