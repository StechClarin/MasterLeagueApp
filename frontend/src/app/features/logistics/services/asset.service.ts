import { inject, Injectable } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllAssetsGQL } from '../graphql/logistics.generated';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssetService extends BaseService {
  override endpoint = 'asset';
  private generatedGQL = inject(GetAllAssetsGQL);

  getQuery() {
    return this.generatedGQL.document;
  }

  override list() {
    return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
      map((res: any) => res.data.assets?.items || [])
    );
  }

  reportIssue(id: string, description: string): Observable<any> {
    const url = `${this.apiUrl}/report_issue/${id}/`;
    return this.http.post(url, { description });
  }

  performMaintenance(id: string, description: string): Observable<any> {
    const url = `${this.apiUrl}/perform_maintenance/${id}/`;
    return this.http.post(url, { description });
  }

  assign(id: string, roomId: string): Observable<any> {
    const url = `${this.apiUrl}/assign/${id}/`;
    return this.http.post(url, { room_id: roomId });
  }

  unassign(id: string): Observable<any> {
    const url = `${this.apiUrl}/unassign/${id}/`;
    return this.http.post(url, {});
  }

  retire(id: string): Observable<any> {
    const url = `${this.apiUrl}/retire/${id}/`;
    return this.http.post(url, {});
  }
}
