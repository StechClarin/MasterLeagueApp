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

    override list(evaluationSessionId?: number) {
        return this.generatedGQL.fetch({
            evaluationSessionId,
            page: 1,
            pageSize: 500 // High enough for a classroom
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
