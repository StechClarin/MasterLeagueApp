import { Injectable } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllVoituresGQL } from '@app/graphql/generated';
import { inject } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class VoitureService extends BaseService {
    endpoint = 'voiture';
    private getAllVoituresGQL = inject(GetAllVoituresGQL);

    getQuery() {
        return this.getAllVoituresGQL.document;
    }
}
