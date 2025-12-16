import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllCyclesGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class CycleService extends BaseService {
    override endpoint = 'cycle';
    private generatedGQL = inject(GetAllCyclesGQL);

    getQuery() {
        return this.generatedGQL.document;
    }
}
