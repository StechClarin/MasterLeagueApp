import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllPersonnesGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class PersonneService extends BaseService {
    override endpoint = 'personne'; // Correspond to backend URL part, usually
    private getAllPersonnesGQL = inject(GetAllPersonnesGQL);

    /**
     * Retourne la requête GraphQL pour la liste des personnes
     * Utilise le service généré par Codegen
     */
    getQuery() {
        console.log('[PersonneService] Getting generated query document...');
        return this.getAllPersonnesGQL.document;
    }
}
