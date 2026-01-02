import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllAcademicYearsGQL } from '@app/graphql/generated';
import { map } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class AcademicYearService extends BaseService {
    override endpoint = 'academic_year'; // Matches generic router: /api/academic_year/
    private generatedGQL = inject(GetAllAcademicYearsGQL);

    getQuery() {
        return this.generatedGQL.document;
    }

    list() {
        return this.generatedGQL.fetch().pipe(
            map(res => res.data.academicyears?.items || [])
        );
    }
}
