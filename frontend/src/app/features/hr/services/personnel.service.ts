import { Injectable, inject } from '@angular/core';
import { BaseService } from '@app/core/abstracts/base.service';
import { GetAllPersonnelsGQL } from '../graphql/hr.generated';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StructureStateService } from '@core/services/structure-state.service';

@Injectable({
    providedIn: 'root'
})
export class PersonnelService extends BaseService {
    override endpoint = 'personnel';
    private getAllPersonnelsGQL = inject(GetAllPersonnelsGQL);
    private structureState = inject(StructureStateService);

    /**
     * Retourne la requête GraphQL pour la liste des personnels
     */
    getQuery() {
        return this.getAllPersonnelsGQL.document;
    }

    override list(params: any = {}): Observable<any[]> {
        if (!params.establishment) {
            params.establishment = this.structureState.currentEstablishmentId();
        }
        return this.getAllPersonnelsGQL.fetch(params).pipe(
            map(res => res.data.personnels?.items || [])
        );
    }

    listByRole(roleName: string): Observable<any[]> {
        return this.list({ 
            roleName, 
            pageSize: 100, 
            establishment: this.structureState.currentEstablishmentId() 
        });
    }
}
