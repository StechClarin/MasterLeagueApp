import { Injectable } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RoleService extends BaseService {
    endpoint = 'role';

    // Récupère toutes les permissions groupées par module (via une API spécifique ou GET /permission/)
    getPermissions(): Observable<any[]> {
        // On suppose que le backend a une route /api/permission/ ou qu'on utilise /api/role/permissions/
        // Pour l'instant, utilisons une convention standard
        return this.http.get<any[]>(`${this.apiUrl.replace('role', 'permission')}/`); // Hack rapide ou endpoint dédié
    }
}
