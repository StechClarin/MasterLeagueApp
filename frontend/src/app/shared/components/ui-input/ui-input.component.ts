import { Component, Input, Self, Optional, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-4">
      <label [for]="'input-' + label" class="block text-sm font-medium mb-1" [ngClass]="labelClasses">
        {{ label }} @if (required) {
        <span class="text-red-500">*</span>
      }
    </label>
    
    <!-- Description -->
    @if (description) {
      <p class="text-xs text-gray-500 mb-2" [ngClass]="{'text-slate-400': theme === 'dark'}">{{ description }}</p>
    }
    
    <!-- Input or Textarea -->
    @if (type !== 'textarea') {
      <input
        [id]="'input-' + label"
        [type]="type"
        [formControl]="control"
        [placeholder]="placeholder"
        [min]="min"
        [readOnly]="readonly"
        [ngClass]="inputClasses"
        (blur)="onBlur()"
        />
    } @else {
      <textarea
        [id]="'input-' + label"
        [formControl]="control"
        [placeholder]="placeholder"
        [readOnly]="readonly"
        [rows]="rows"
        [ngClass]="inputClasses"
        (blur)="onBlur()"
      ></textarea>
    }
    
    
    <!-- Helper Text -->
    @if (helper) {
      <p class="mt-1 text-xs text-gray-500" [ngClass]="{'text-slate-400': theme === 'dark'}">{{ helper }}</p>
    }
    
    @if (control.invalid && (control.dirty || control.touched)) {
      <div class="text-red-600 text-sm mt-1">
        @if (control.errors?.['required']) {
          <div>Ce champ est requis.</div>
        }
        @if (control.errors?.['email']) {
          <div>Veuillez entrer une adresse email valide.</div>
        }
        @if (control.errors?.['minlength']) {
          <div>
            Ce champ doit contenir au moins {{ control.errors?.['minlength'].requiredLength }} caractères.
          </div>
        }
        @if (control.errors?.['serverError']) {
          <div>{{ control.errors?.['serverError'] }}</div>
        }
      </div>
    }
    </div>
    `
})
export class UiInputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() theme: 'light' | 'dark' = 'light';

  @Input() helper: string = '';
  @Input() description: string = '';
  @Input() min: string = '';
  @Input() rows: number = 3;

  private destroyRef = inject(DestroyRef);

  get labelClasses(): string {
    return this.theme === 'dark' ? 'text-slate-300' : 'text-gray-700';
  }

  get inputClasses(): string {
    const base = 'block w-full px-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all read-only:cursor-default read-only:opacity-75';
    return this.theme === 'dark'
      ? base + ' bg-slate-800 border-slate-700 text-white placeholder-slate-500 read-only:bg-slate-900'
      : base + ' border-gray-200 text-gray-900 placeholder-gray-400 read-only:bg-gray-50';
  }


  onChange: any = () => { };
  onTouch: any = () => { };

  constructor(@Self() @Optional() public ngControl?: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    // Sync internal control changes to parent form avec sécurité mémoire
    this.control.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
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
