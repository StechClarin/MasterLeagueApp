import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllSubjectsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class SubjectService extends BaseService {
    override endpoint = 'subject';
    private generatedGQL = inject(GetAllSubjectsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }
}
