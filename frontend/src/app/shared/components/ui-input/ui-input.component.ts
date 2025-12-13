import { Component, Input, Self, Optional, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label [for]="'input-' + label" class="block text-sm font-medium mb-1" [ngClass]="labelClasses">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <input
        [id]="'input-' + label"
        [type]="type"
        [formControl]="control"
        [placeholder]="placeholder"
        [ngClass]="inputClasses"
        (blur)="onBlur()"
      />
      <div *ngIf="control.invalid && (control.dirty || control.touched)" class="text-red-600 text-sm mt-1">
        <div *ngIf="control.errors?.['required']">Ce champ est requis.</div>
        <div *ngIf="control.errors?.['email']">Veuillez entrer une adresse email valide.</div>
        <div *ngIf="control.errors?.['minlength']">
          Ce champ doit contenir au moins {{ control.errors?.['minlength'].requiredLength }} caractères.
        </div>
      </div>
    </div>
  `
})
export class UiInputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() required: boolean = false;
  @Input() theme: 'light' | 'dark' = 'light';

  get labelClasses(): string {
    return this.theme === 'dark' ? 'text-slate-300' : 'text-gray-700';
  }

  get inputClasses(): string {
    const base = 'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors';
    return this.theme === 'dark'
      ? base + ' bg-slate-800 border-slate-700 text-white placeholder-slate-500'
      : base + ' border-gray-300 text-gray-900 placeholder-gray-400';
  }


  onChange: any = () => { };
  onTouch: any = () => { };

  constructor(@Self() @Optional() public ngControl?: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    // Sync internal control changes to parent form
    this.control.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  writeValue(value: any): void {
    // Prevent infinite loop if value is same
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
