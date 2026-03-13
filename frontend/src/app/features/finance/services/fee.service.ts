import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetFeeDefinitionsGQL, GetFeeDefinitionsDocument } from '../graphql/finance.generated';

@Injectable({
  providedIn: 'root'
})
export class FeeService extends BaseService {
  endpoint = 'fee_definition';
  private generatedGQL = inject(GetFeeDefinitionsGQL);

  getQuery() {
    return GetFeeDefinitionsDocument;
  }

  backfill(id: string) {
    return this.status(id);
  }
}
