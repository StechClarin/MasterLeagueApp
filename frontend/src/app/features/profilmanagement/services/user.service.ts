import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllUsersGQL } from '@app/graphql/generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService {
    override endpoint = 'user';
    private getAllUsersGQL = inject(GetAllUsersGQL);

    /**
     * Retourne la requête GraphQL pour la liste des utilisateurs
     * Utilise le service généré par Codegen
     */
    getQuery() {
        console.log('[UserService] Getting generated query document...');
        return this.getAllUsersGQL.document;
    }
}
