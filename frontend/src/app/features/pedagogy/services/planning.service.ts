import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllPlanningsGQL, GetPlanningByIdGQL, GetPlanningDependenciesGQL } from '../../../graphql/generated';

@Injectable({ providedIn: 'root' })
export class PlanningService extends BaseService {
    endpoint = 'planning';

    getAllGQL = inject(GetAllPlanningsGQL);
    getByIdGQL = inject(GetPlanningByIdGQL);
    getDependenciesGQL = inject(GetPlanningDependenciesGQL);

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
