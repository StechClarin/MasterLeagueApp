import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllTeachersGQL } from '@app/graphql/generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TeacherService extends BaseService {
    override endpoint = 'teacher';
    private generatedGQL = inject(GetAllTeachersGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    list() {
        return this.generatedGQL.fetch().pipe(
            map(res => res.data.teachers?.items || [])
        );
    }

    getAll(search = '', page = 1, pageSize = 20) {
        return this.generatedGQL.watch({ search, page, pageSize }).valueChanges;
    }
}
