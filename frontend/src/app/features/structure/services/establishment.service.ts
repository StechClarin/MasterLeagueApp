import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllEstablishmentsGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class EstablishmentService extends BaseService {
    override endpoint = 'establishment';
    private generatedGQL = inject(GetAllEstablishmentsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    getAll(search = '', page = 1, pageSize = 100) {
        return this.generatedGQL.watch({ search, page, pageSize }).valueChanges;
    }
}
