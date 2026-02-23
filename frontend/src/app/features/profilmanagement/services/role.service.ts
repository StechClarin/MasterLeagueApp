import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetAllRolesGQL, GetRoleByIdGQL, GetAllPermissionsGQL } from '../graphql/profil.generated';

@Injectable({
    providedIn: 'root'
})
export class RoleService extends BaseService {
    override endpoint = 'role';

    private getAllRolesGQL = inject(GetAllRolesGQL);
    private getRoleByIdGQL = inject(GetRoleByIdGQL);
    private getAllPermissionsGQL = inject(GetAllPermissionsGQL);

    getAll(search = '', page = 1, pageSize = 100) {
        return this.getAllRolesGQL.watch({ name: search, page, pageSize }).valueChanges;
    }

    getPermissions(): Observable<any[]> {
        console.log('[RoleService] Fetching permissions...');
        return this.getAllPermissionsGQL.fetch().pipe(
            map(result => {
                console.log('[RoleService] Permissions fetched:', result.data.permissions);
                return result.data.permissions || [];
            })
        );
    }

    override get_by_id(id: number | string): Observable<any> {
        // Le cast en number est nécessaire car l'ID GraphQL est souvent attendu en string ou int selon le schéma
        // Ici notre query attend ID! qui est string en TS, mais int côté Django souvent.
        // On convertit en string pour être sûr.
        return this.getRoleByIdGQL.fetch({ id: String(id) }).pipe(
            map(result => {
                const role = JSON.parse(JSON.stringify(result.data.role)); // Deep copy pour éviter readonly
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
        return this.getAllRolesGQL.document;
    }
}
