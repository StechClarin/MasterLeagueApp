import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllLevelsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class LevelService extends BaseService {
    override endpoint = 'level';
    private generatedGQL = inject(GetAllLevelsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    getAll(establishmentId?: string | null) {
        // Warning: filtering by establishment relies on backend context or future query update
        // Current GetAllLevels query does NOT take establishmentId.
        // But backend filters by context.
        return this.generatedGQL.watch({
            page: 1,
            pageSize: 100
        }, { fetchPolicy: 'cache-and-network' }).valueChanges;
    }
}
