import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-toggle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex items-center justify-between">
      <div class="flex flex-col">
        <label *ngIf="label" class="text-sm font-medium text-gray-700">{{ label }}</label>
        <p *ngIf="description" class="text-xs text-gray-400 mt-1">{{ description }}</p>
      </div>
      
      <button 
        type="button"
        role="switch"
        [attr.aria-checked]="control.value"
        (click)="toggle()"
        [class.bg-indigo-600]="control.value && !readonly"
        [class.bg-gray-200]="!control.value && !readonly"
        [class.bg-indigo-400]="control.value && readonly"
        [class.bg-gray-100]="!control.value && readonly"
        [class.cursor-not-allowed]="readonly"
        [class.opacity-50]="readonly"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
        
        <span class="sr-only">{{ label }}</span>
        <span 
          [class.translate-x-5]="control.value"
          [class.translate-x-0]="!control.value"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
        </span>
      </button>
    </div>
  `
})
export class UiToggleComponent {
  @Input() label: string = '';
  @Input() description: string = '';
  @Input() readonly: boolean = false;
  @Input({ required: true }) control!: FormControl;

  toggle() {
    if (this.readonly || this.control.disabled) return;
    this.control.setValue(!this.control.value);
    this.control.markAsTouched();
    this.control.markAsDirty();
  }
}

