import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllPersonnelsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class PersonnelService extends BaseService {
    override endpoint = 'personnel';
    private getAllPersonnelsGQL = inject(GetAllPersonnelsGQL);

    /**
     * Retourne la requête GraphQL pour la liste des personnels
     */
    getQuery() {
        return this.getAllPersonnelsGQL.document;
    }
}
