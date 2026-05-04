import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetInvoicesGQL, GetInvoicesDocument } from '../graphql/finance.generated';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService extends BaseService {
  endpoint = 'invoice';
  private generatedGQL = inject(GetInvoicesGQL);

  getQuery() {
    return GetInvoicesDocument;
  }

  markPrinted(id: string | number) {
    return this.http.get(`${this.apiUrl}/mark_printed/${id}/`);
  }
}
