import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetPaymentsGQL, GetPaymentsDocument } from '../graphql/finance.generated';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends BaseService {
  override endpoint = 'payment';
  private generatedGQL = inject(GetPaymentsGQL);

  getQuery() {
    return GetPaymentsDocument;
  }

  getFinancialStatus(studentId: string) {
    return this.http.get<any>(`${environment.apiUrl}/payment/financial_status/${studentId}/`);
  }

  getCollectionReport(classroomId: string, date: string) {
    return this.http.get<any>(`${environment.apiUrl}/payment/collection_report/`, {
      params: { classroom_id: classroomId, date }
    });
  }
}
