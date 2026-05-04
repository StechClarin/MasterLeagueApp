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
    return this.http.get<any>(`${this.apiUrl}/financial_status/${studentId}/`);
  }

  getCollectionReport(classroomId: string, startDate: string, endDate: string) {
    const url = `${this.apiUrl}/collection_report/`;
    return this.http.get<any>(url, {
      params: { classroom_id: classroomId, start_date: startDate, end_date: endDate }
    });
  }
}
