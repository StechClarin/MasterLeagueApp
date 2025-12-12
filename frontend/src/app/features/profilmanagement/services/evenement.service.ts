import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllEvenementsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class EvenementService extends BaseService {
    endpoint = 'evenement';
    private getAllEvenementsGQL = inject(GetAllEvenementsGQL);

    getQuery() {
        return this.getAllEvenementsGQL.document;
    }
}
