import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllPlanningsGQL, GetPlanningByIdGQL, GetPlanningDependenciesGQL, GetPlanningDetailsGQL } from '../graphql/pedagogy.generated';

@Injectable({ providedIn: 'root' })
export class PlanningService extends BaseService {
    endpoint = 'planning';

    getAllGQL = inject(GetAllPlanningsGQL);
    getByIdGQL = inject(GetPlanningByIdGQL);
    getDependenciesGQL = inject(GetPlanningDependenciesGQL);
    getDetailsGQL = inject(GetPlanningDetailsGQL);

    getQuery() {
        return this.getAllGQL.document;
    }

    getByIdQuery() {
        return this.getByIdGQL.document;
    }

    getDependencies() {
        return this.getDependenciesGQL.fetch();
    }
}
