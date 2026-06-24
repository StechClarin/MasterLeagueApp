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
      <div class="relative">
        <select *ngIf="!multiple"
          [id]="'select-' + label"
          [formControl]="control"
          (blur)="onBlur()"
          class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white transition-all appearance-none cursor-pointer"
        >
          <option [ngValue]="null" disabled>{{ placeholder }}</option>
          <option *ngFor="let option of options" [ngValue]="option[bindValue]">
            {{ option[bindLabel] }}
          </option>
        </select>

        <select *ngIf="multiple"
          [id]="'select-' + label"
          [formControl]="control"
          multiple
          (blur)="onBlur()"
          class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white transition-all appearance-none cursor-pointer"
        >
          <option [ngValue]="null" disabled>{{ placeholder }}</option>
          <option *ngFor="let option of options" [ngValue]="option[bindValue]">
            {{ option[bindLabel] }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      <p *ngIf="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
      <div *ngIf="control.invalid && (control.dirty || control.touched)" class="text-red-600 text-sm mt-1">
        <div *ngIf="control.errors?.['required']">Ce champ est requis.</div>
        <div *ngIf="control.errors?.['serverError']">{{ control.errors?.['serverError'] }}</div>
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
  @Input() multiple: boolean = false;

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
