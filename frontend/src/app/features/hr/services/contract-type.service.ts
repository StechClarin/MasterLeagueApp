import { Injectable, inject } from '@angular/core';
import { BaseService } from '@app/core/abstracts/base.service';
import { GetAllContractTypesGQL, GetContractTypeGQL } from '@app/graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class ContractTypeService extends BaseService {
    protected listQuery = inject(GetAllContractTypesGQL);
    protected detailsQuery = inject(GetContractTypeGQL);

    // Endpoint REST for writes
    endpoint = 'hr/contract_types';

    get listQueryDocument() {
        return this.listQuery.document;
    }

    list(variables?: any) {
        return this.listQuery.watch(variables).valueChanges;
    }
}
