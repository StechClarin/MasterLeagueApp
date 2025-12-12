import { Component, Input, Self, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
    label: string;
    value: any;
}

@Component({
    selector: 'app-ui-select',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="mb-4">
      <label [for]="'select-' + label" class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <select
        [id]="'select-' + label"
        [formControl]="control"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option *ngFor="let option of options" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
      <div *ngIf="control.invalid && (control.dirty || control.touched)" class="text-red-600 text-sm mt-1">
        <div *ngIf="control.errors?.['required']">Ce champ est requis.</div>
      </div>
    </div>
  `
})
export class UiSelectComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() placeholder: string = 'Sélectionner...';
    @Input() options: SelectOption[] = [];
    @Input() control: FormControl = new FormControl();
    @Input() required: boolean = false;

    constructor(@Self() @Optional() public ngControl?: NgControl) {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    writeValue(obj: any): void { }
    registerOnChange(fn: any): void { }
    registerOnTouched(fn: any): void { }
    setDisabledState?(isDisabled: boolean): void { }
}
