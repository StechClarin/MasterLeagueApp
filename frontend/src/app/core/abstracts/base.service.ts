import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export abstract class BaseService {
    protected http = inject(HttpClient);

    // Endpoint spécifique à définir par l'enfant (ex: 'user', 'product')
    abstract endpoint: string;

    // Reactive Sync: Signal de rafraîchissement
    private _refresh$ = new Subject<void>();
    get refresh$() {
        return this._refresh$.asObservable();
    }

    protected get apiUrl(): string {
        return `${environment.apiUrl || 'http://127.0.0.1:8000/api'}/${this.endpoint}`;
    }

    /**
     * Generic Get by ID
     * GET /api/{endpoint}/{id}/
     */
    get_by_id(id: number | string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}/`);
    }

    /**
     * Generic Upsert (Create or Update)
     * POST /api/{endpoint}/save/
     */
    save(data: any): Observable<any> {
        const request = data.id
            ? this.http.post(`${this.apiUrl}/save/${data.id}/`, data)
            : this.http.post(`${this.apiUrl}/save/`, data);

        return request.pipe(tap(() => this._refresh$.next()));
    }

    /**
     * Generic Delete
     * DELETE /api/{endpoint}/delete/{id}/
     */
    delete(id: number | string): Observable<any> {
        return this.http.post(`${this.apiUrl}/delete/${id}/`, {}).pipe(
            tap(() => this._refresh$.next())
        );
    }

    /**
     * Generic Status Toggle
     * POST /api/{endpoint}/status/{id}/
     */
    status(id: number | string): Observable<any> {
        return this.http.post(`${this.apiUrl}/status/${id}/`, {}).pipe(
            tap(() => this._refresh$.next())
        );
    }

    /**
     * Generic Import
     * POST /api/{endpoint}/import_data/
     * Uploads a file (CSV/Excel) to import data
     */
    import(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/import_data/`, formData).pipe(
            tap(() => this._refresh$.next())
        );
    }

    /**
     * Generic Export
     * GET /api/{endpoint}/export_data/?format={format}
     * Downloads data as CSV or Excel file
     */
    export(format: 'csv' | 'excel' = 'excel'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export_data?format=${format}`, {
            responseType: 'blob'
        });
    }

    /**
     * Download Import Template
     * GET /api/{endpoint}/import_template/
     */
    downloadTemplate(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/import_template/`, {
            responseType: 'blob'
        });
    }
}
