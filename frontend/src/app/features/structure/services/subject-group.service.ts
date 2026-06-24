import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllSubjectGroupsGQL } from '../graphql/structure.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SubjectGroupService extends BaseService {
    override endpoint = 'subject_group';
    private generatedGQL = inject(GetAllSubjectGroupsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    getAll(params?: any) {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100, ...params }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => ({ items: res.data.subjectgroups?.items || [], totalCount: res.data.subjectgroups?.totalCount || 0 }))
        );
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.subjectgroups?.items || [])
        );
    }
}
