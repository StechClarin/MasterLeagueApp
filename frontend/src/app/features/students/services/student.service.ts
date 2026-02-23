import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllStudentsGQL, GetAllStudentsDocument } from '../graphql/student.generated';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends BaseService {
  endpoint = 'student'; // Maps to API endpoint

  getQuery() {
    return GetAllStudentsDocument;
  }
}
