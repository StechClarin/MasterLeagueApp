import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllEnrollmentsGQL, GetAllEnrollmentsDocument } from '../graphql/student.generated';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService extends BaseService {
  endpoint = 'enrollment'; // REST endpoint for CUD
  private generatedGQL = inject(GetAllEnrollmentsGQL);

  getQuery() {
    return GetAllEnrollmentsDocument;
  }

  // List functionality via GraphQL
  override list(filters: any = {}) {
    return this.generatedGQL.fetch({ 
        search: filters.search || undefined,
        classroomId: filters.classroomId || undefined,
        academicYearId: filters.academicYearId || undefined,
        page: filters.page || 1, 
        pageSize: filters.pageSize || 20 
    }, { fetchPolicy: 'network-only' }).pipe(
      map((res: { data: any }) => res.data.enrollments?.items || [])
    );
  }
}
