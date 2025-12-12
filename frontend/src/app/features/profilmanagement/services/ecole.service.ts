import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllEcolesGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class EcoleService extends BaseService {
    override endpoint = 'ecole';
    private getAllEcolesGQL = inject(GetAllEcolesGQL);

    getQuery() {
        return this.getAllEcolesGQL.document;
    }
}
