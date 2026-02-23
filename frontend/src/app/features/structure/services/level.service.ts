import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllLevelsGQL } from '../graphql/structure.generated';

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
        // We use fetch() for a direct observable that completes
        // and network-only to ensure we have fresh data on each form open
        return this.generatedGQL.fetch({
            page: 1,
            pageSize: 100
        }, { fetchPolicy: 'network-only' });
    }
}
