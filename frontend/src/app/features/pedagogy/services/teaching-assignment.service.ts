import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllTeachingAssignmentsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class TeachingAssignmentService extends BaseService {
    override endpoint = 'teaching_assignment';
    private generatedGQL = inject(GetAllTeachingAssignmentsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    getAll(search = '', page = 1, pageSize = 10) {
        return this.generatedGQL.watch({ search, page, pageSize }).valueChanges;
    }
}
