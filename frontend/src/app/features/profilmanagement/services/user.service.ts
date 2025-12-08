import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { QueryBuilderService } from '@core/services/query-builder.service';
import { PROFIL_FIELDS } from '../profil.graphql';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService {
    override endpoint = 'user';
    private qb = inject(QueryBuilderService);

    /**
     * Retourne la requête GraphQL pour la liste des utilisateurs
     * Les filtres par défaut servent à générer les définitions de variables ($username: String, etc.)
     */
    getQuery() {
        console.log('[UserService] Building query...');
        return this.qb.buildQuery('users', PROFIL_FIELDS.users, {
            username: '',
            email: '',
            role: '',
            page: 0,
            pageSize: 0
        });
    }
}
