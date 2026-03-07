import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllSubjectsGQL } from '../graphql/structure.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SubjectService extends BaseService {
    override endpoint = 'subject';
    private generatedGQL = inject(GetAllSubjectsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.subjects?.items || [])
        );
    }
}
