import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BaseFormComponent } from './base-form.component';
import { environment } from 'src/environments/environment';

@Component({ template: '' })
export abstract class BaseModalFormComponent extends BaseFormComponent implements OnInit {
    protected fb = inject(FormBuilder);
    private _data: any = null;

    @Output() close = new EventEmitter<void>();

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
        return this.resolveMediaUrl(path);
    }
}
