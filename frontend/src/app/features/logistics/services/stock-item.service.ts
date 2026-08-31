import { inject, Injectable } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllStockItemsGQL } from '../graphql/logistics.generated';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StockItemService extends BaseService {
  override endpoint = 'stock_item';
  private generatedGQL = inject(GetAllStockItemsGQL);

  getQuery() {
    return this.generatedGQL.document;
  }

  override list() {
    return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
      map((res: any) => res.data.stockItems?.items || [])
    );
  }
}
