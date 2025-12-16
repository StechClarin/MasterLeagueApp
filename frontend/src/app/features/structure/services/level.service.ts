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
}
