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
    list() {
        return this.generatedGQL.fetch().pipe(
            map(res => res.data.subjects?.items || [])
        );
    }
}
