import { Component, OnInit, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BaseFormComponent } from './base-form.component';
import { environment } from 'src/environments/environment';

@Component({ template: '' })
export abstract class BaseModalFormComponent extends BaseFormComponent implements OnInit {
    protected fb = inject(FormBuilder);
    private _data: any = null;

    getControl(name: string): FormControl {
        return this.form.get(name) as FormControl;
    }

    @Input() set data(value: any) {
        this._data = value;
        if (this.form && value) {
            this.patchValue(value);
        } else if (this.form && !value) {
            this.form.reset();
        }
    }

    get data(): any {
        return this._data;
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.initForm();
        if (this._data) {
            this.patchValue(this._data);
        }
    }

    abstract initForm(): FormGroup;

    patchValue(data: any): void {
        if (this.form && data) {
            this.form.patchValue(data);
        }
    }

    getPhotoUrl(path: string): string {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const baseUrl = environment.apiUrl.replace('/api', '');
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        if (cleanPath.startsWith('media/')) {
            return `${baseUrl}/${cleanPath}`;
        }
        return `${baseUrl}/media/${cleanPath}`;
    }
}
