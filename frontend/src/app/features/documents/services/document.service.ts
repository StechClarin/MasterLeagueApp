import { Injectable, inject } from '@angular/core';
import { BaseService } from '../../../core/abstracts/base.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { GetDocumentsByEntityGQL } from '../../../graphql/generated';

@Injectable({
    providedIn: 'root'
})
export class DocumentService extends BaseService {
    endpoint = 'document'; // Matches DocumentController
    private getDocumentsGQL = inject(GetDocumentsByEntityGQL);

    getQuery() {
        // We don't have a specific global query for documents list yet, using a dummy or returning null
        // But BaseService usually expects one. For now, we override list() methods if needed or implement a GetAllDocuments query later.
        return this.getDocumentsGQL.document;
    }

    uploadDocument(file: File, appLabel: string, modelName: string, objectId: string | number, type: string = 'AUTRE'): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', file.name);
        formData.append('document_type', type);
        formData.append('content_type_app', appLabel); // Provided to backend to find content_type
        formData.append('content_type_model', modelName);
        formData.append('object_id', objectId.toString());

        // Manual POST because BaseService.create expects JSON usually, but here we send FormData
        // Or we can assume BaseService handles generic data. Let's use direct http for specific upload control (progress?)
        return this.http.post(`${environment.apiUrl}/${this.endpoint}/save/`, formData);
    }

    getByEntity(appLabel: string, modelName: string, objectId: string) {
        return this.getDocumentsGQL.fetch({
            appLabel,
            modelName,
            objectId
        }).pipe(map(res => res.data.documentsByEntity));
    }
}
