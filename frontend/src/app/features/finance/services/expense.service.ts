import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetExpensesGQL, GetExpensesDocument, GetExpenseByIdGQL } from '../graphql/finance.generated';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends BaseService {
  override endpoint = 'expense';
  private generatedGQL = inject(GetExpensesGQL);
  private getExpenseByIdGQL = inject(GetExpenseByIdGQL);

  getQuery() {
    return GetExpensesDocument;
  }

  override list() {
    return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
      map((res: any) => res.data.expenses?.items || [])
    );
  }

  getExpenseByGraphql(id: string) {
    return this.getExpenseByIdGQL.fetch({ id }, { fetchPolicy: 'network-only' }).pipe(
      map(res => ({ data: res.data.expense }))
    );
  }
}
