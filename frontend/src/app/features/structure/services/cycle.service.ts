import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllCyclesGQL } from '../graphql/structure.generated';
import { tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';

@Injectable({
    providedIn: 'root'
})
export class CycleService extends BaseService {
    override endpoint = 'cycle';
    private generatedGQL = inject(GetAllCyclesGQL);
    private apollo = inject(Apollo);

    getQuery() {
        return this.generatedGQL.document;
    }

    getAllCycles(search = '', page = 1, pageSize = 100, establishmentId?: string) {
        return this.generatedGQL.watch({ search, page, pageSize, establishmentId });
    }

    override save(data: any) {
        return super.save(data).pipe(
            tap(() => {
                // Invalidate GraphQL Cache to update lists (e.g. inside LevelForm)
                // generatedGQL.client is the client NAME (string)
                this.apollo.use(this.generatedGQL.client).client.refetchQueries({
                    include: [this.generatedGQL.document]
                });
            })
        );
    }
}
