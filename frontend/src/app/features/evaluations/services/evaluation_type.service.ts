import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllEvaluationTypesGQL } from '../graphql/evaluations.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class EvaluationTypeService extends BaseService {
    override endpoint = 'evaluation_type'; // Matches backend router
    private generatedGQL = inject(GetAllEvaluationTypesGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.evaluationTypes?.items || [])
        );
    }
}
