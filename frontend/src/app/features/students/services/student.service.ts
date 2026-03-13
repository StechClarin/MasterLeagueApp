import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllStudentsGQL, GetAllStudentsDocument } from '../graphql/student.generated';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends BaseService {
  endpoint = 'student'; // Maps to API endpoint
  private generatedGQL = inject(GetAllStudentsGQL);

  getQuery() {
    return GetAllStudentsDocument;
  }

  override list(filters: any = {}) {
    return this.generatedGQL.fetch({ 
        search: filters.search || undefined,
        classroomId: filters.classroomId || undefined,
        academicYearId: filters.academicYearId || undefined,
        status: filters.status || undefined,
        page: filters.page || 1, 
        pageSize: filters.pageSize || 100 
    }, { fetchPolicy: 'network-only' }).pipe(
      map((res: any) => res.data.students?.items || [])
    );
  }
}
