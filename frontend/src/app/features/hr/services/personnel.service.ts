import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllPersonnelsGQL } from '../graphql/hr.generated';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    list(): Observable<any[]> {
        return this.getAllPersonnelsGQL.fetch().pipe(
            // @ts-ignore
            map(res => res.data.personnels?.items || [])
        );
    }

    listByRole(roleName: string): Observable<any[]> {
        return this.getAllPersonnelsGQL.fetch({ roleName, pageSize: 100 }).pipe(
            // @ts-ignore
            map(res => res.data.personnels?.items || [])
        );
    }
}
