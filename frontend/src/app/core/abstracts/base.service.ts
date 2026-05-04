import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from '../services/logging.service';
import { FormUtils } from '../utils/form.utils';

@Injectable({
    providedIn: 'root'
})
export abstract class BaseService {
    protected http = inject(HttpClient);
    protected logger = inject(LoggingService);
    protected serviceName = this.constructor.name;

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
     * Generic List
     * GET /api/{endpoint}/
     */
    list(params: any = {}): Observable<any[]> {
        this.logger.logApi('GET', this.apiUrl, 'START', params);
        return this.http.get<any[]>(this.apiUrl, { params }).pipe(
            tap(res => this.logger.logApi('GET', this.apiUrl, 'SUCCESS', res)),
            catchError(err => {
                this.logger.logApi('GET', this.apiUrl, 'ERROR', err);
                throw err;
            })
        );
    }
    get_by_id(id: number | string): Observable<any> {
        const url = `${this.apiUrl}/get_by_id/${id}/`;
        this.logger.logApi('GET', url, 'START');
        return this.http.get(url).pipe(
            tap(res => this.logger.logApi('GET', url, 'SUCCESS', res)),
            catchError(err => {
                this.logger.logApi('GET', url, 'ERROR', err);
                throw err;
            })
        );
    }

    /**
     * Generic Upsert (Create or Update)
     * POST {endpoint}/save/
     */
    save(data: any): Observable<any> {
        let url = `${this.apiUrl}/save/`;
        if (data.id) {
            url += `${data.id}/`;
        }

        const snakeData = FormUtils.convertPayloadToSnakeCase(data);
        this.logger.logApi('POST', url, 'START', snakeData);
        const request = this.http.post(url, snakeData);

        return request.pipe(
            tap(res => {
                this.logger.logApi('POST', url, 'SUCCESS', res);
                this._refresh$.next();
            }),
            catchError(err => {
                this.logger.logApi('POST', url, 'ERROR', err);
                throw err;
            })
        );
    }

    /**
     * Generic Delete
     * DELETE /api/{endpoint}/delete/{id}/
     */
    delete(id: number | string): Observable<any> {
        const url = `${this.apiUrl}/delete/${id}/`;
        this.logger.logApi('POST (DELETE)', url, 'START');

        return this.http.post(url, {}).pipe(
            tap(res => {
                this.logger.logApi('POST (DELETE)', url, 'SUCCESS', res);
                this._refresh$.next();
            }),
            catchError(err => {
                this.logger.logApi('POST (DELETE)', url, 'ERROR', err);
                throw err;
            })
        );
    }

    /**
     * Generic Status Toggle
     * POST /api/{endpoint}/status/{id}/
     */
    status(id: number | string): Observable<any> {
        const url = `${this.apiUrl}/status/${id}/`;
        return this.http.post(url, {}).pipe(
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
        const url = `${this.apiUrl}/import_data/`;
        this.logger.logApi('POST', url, 'START', { file: file.name });

        return this.http.post(url, formData).pipe(
            tap(res => {
                this.logger.logApi('POST', url, 'SUCCESS', res);
                this._refresh$.next();
            }),
            catchError(err => {
                this.logger.logApi('POST', url, 'ERROR', err);
                throw err;
            })
        );
    }

    /**
     * Generic Export
     * GET /api/{endpoint}/export_data/?format={format}
     * Downloads data as CSV or Excel file
     */
    export(format: 'csv' | 'excel' = 'excel'): Observable<Blob> {
        const url = `${this.apiUrl}/export_data?format=${format}`;
        this.logger.logApi('GET (EXPORT)', url, 'START');
        return this.http.get(url, {
            responseType: 'blob'
        }).pipe(
            tap(() => this.logger.logApi('GET (EXPORT)', url, 'SUCCESS')),
            catchError(err => {
                this.logger.logApi('GET (EXPORT)', url, 'ERROR', err);
                throw err;
            })
        );
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
