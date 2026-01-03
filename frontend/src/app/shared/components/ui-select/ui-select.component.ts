import { Component, Input, Self, Optional, OnInit } from '@angular/core';
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
        (blur)="onBlur()"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
      >
        <option [ngValue]="null" disabled>{{ placeholder }}</option>
        <option *ngFor="let option of options" [ngValue]="option[bindValue]">
          {{ option[bindLabel] }}
        </option>
      </select>
      <p *ngIf="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
      <div *ngIf="control.invalid && (control.dirty || control.touched)" class="text-red-600 text-sm mt-1">
        <div *ngIf="control.errors?.['required']">Ce champ est requis.</div>
      </div>
    </div>
  `
})
export class UiSelectComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Sélectionner...';
  @Input() options: any[] = [];
  @Input() bindLabel: string = 'label';
  @Input() bindValue: string = 'value';
  @Input() control: FormControl = new FormControl();
  @Input() required: boolean = false;
  @Input() hint: string = '';

  onChange: any = () => { };
  onTouch: any = () => { };

  constructor(@Self() @Optional() public ngControl?: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.control.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  // Called by Angular to write value to the view
  writeValue(value: any): void {
    if (this.control.value !== value) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  onBlur() {
    this.onTouch();
  }
}
