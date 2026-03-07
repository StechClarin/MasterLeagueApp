import { Injectable, inject } from '@angular/core';
import { BaseService } from '@core/abstracts/base.service';
import { GetAllEvaluationSessionsGQL, GetAllEvaluationPlanningsGQL } from '../graphql/evaluations.generated';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of, forkJoin } from 'rxjs';
import { DocumentService } from '../../documents/services/document.service';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EvaluationService extends BaseService {
    override endpoint = 'evaluation_session'; // Matches backend router
    private generatedGQL = inject(GetAllEvaluationSessionsGQL);
    public evaluationPlanningsGQL = inject(GetAllEvaluationPlanningsGQL);
    private documentService = inject(DocumentService);

    getQuery() {
        return this.generatedGQL.document;
    }

    override list() {
        return this.generatedGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).pipe(
            map((res: any) => res.data.evaluationSessions?.items || [])
        );
    }

    afterSave(sessionData: any, filesToUpload: { index: number, file: File }[]): Observable<any> {
        if (!filesToUpload || filesToUpload.length === 0) {
            return of(sessionData);
        }

        const subjects = sessionData.subjects || [];
        const uploadRequests = filesToUpload.map(item => {
            const subjectId = subjects[item.index]?.id;
            if (subjectId) {
                const formData = new FormData();
                formData.append('file', item.file);
                return this.http.post(`${environment.apiUrl}/evaluation_subject/upload_subject_file/${subjectId}/`, formData);
            }
            return of(null);
        });

        return forkJoin(uploadRequests).pipe(
            map(() => sessionData)
        );
    }

    changeStatus(id: string, status: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/${this.endpoint}/status/${id}/`, { status });
    }
}
