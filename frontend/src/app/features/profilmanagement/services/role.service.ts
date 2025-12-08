import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { QueryBuilderService } from '@core/services/query-builder.service';
import { PROFIL_FIELDS } from '../profil.graphql';

@Injectable({
    providedIn: 'root'
})
export class RoleService extends BaseService {
    override endpoint = 'role';
    private apollo = inject(Apollo);
    private qb = inject(QueryBuilderService);

    getPermissions(): Observable<any[]> {
        console.error('[RoleService] Fetching permissions...');
        const query = this.qb.buildQuery('permissions', PROFIL_FIELDS.permissions);

        return this.apollo.query<any>({ query }).pipe(
            map(result => {
                console.log('[RoleService] Permissions fetched:', result.data.permissions);
                return result.data.permissions;
            })
        );
    }

    override get_by_id(id: number | string): Observable<any> {
        // On construit la query pour 'role' avec le champ 'id' en filtre
        const query = this.qb.buildQuery('role', PROFIL_FIELDS.roleDetail, { id });

        return this.apollo.query<any>({
            query,
            variables: { id }
        }).pipe(
            map(result => {
                const role = result.data.role;
                // On transforme les permissions en tableau d'IDs pour le formulaire
                if (role && role.permissions) {
                    role.permissions = role.permissions.map((p: any) => p.id);
                }
                return role;
            })
        );
    }

    /**
     * Retourne la requête GraphQL pour la liste des rôles
     */
    getQuery() {
        return this.qb.buildQuery('roles', PROFIL_FIELDS.roles, { name: '' });
    }
}
