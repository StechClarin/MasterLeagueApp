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

  override list(classroomId?: string) {
    return this.generatedGQL.fetch({ classroomId: classroomId || undefined, page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
      map((res: any) => res.data.students?.items || [])
    );
  }
}
