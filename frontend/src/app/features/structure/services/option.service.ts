import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllOptionsGQL } from '../graphql/structure.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class OptionService extends BaseService {
    override endpoint = 'option';
    private generatedGQL = inject(GetAllOptionsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    getAll(search?: string, parentId?: string, establishmentId?: string) {
        return this.generatedGQL.fetch({
            search,
            parentId,
            establishmentId,
            page: 1,
            pageSize: 100
        }, { fetchPolicy: 'network-only' });
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.options?.items || [])
        );
    }
}
