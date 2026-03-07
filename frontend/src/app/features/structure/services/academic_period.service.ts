import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllAcademicPeriodsGQL } from '../graphql/structure.generated';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AcademicPeriodService extends BaseService {
    override endpoint = 'academic_period'; // Matches backend router
    private generatedGQL = inject(GetAllAcademicPeriodsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.academicPeriods?.items || [])
        );
    }
}
