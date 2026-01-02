import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllStudentsDocument } from '@app/graphql/generated';

@Injectable({
  providedIn: 'root'
})
export class StudentService extends BaseService {
  endpoint = 'student'; // Maps to API endpoint

  getQuery() {
    return GetAllStudentsDocument;
  }
}
