import { Injectable, inject } from '@angular/core';
import { BaseService } from '@app/core/abstracts/base.service';
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

    override list(params: any = {}): Observable<any[]> {
        return this.getAllPersonnelsGQL.fetch(params).pipe(
            map(res => res.data.personnels?.items || [])
        );
    }

    listByRole(roleName: string): Observable<any[]> {
        return this.getAllPersonnelsGQL.fetch({ roleName, pageSize: 100 }).pipe(
            map(res => res.data.personnels?.items || [])
        );
    }
}
