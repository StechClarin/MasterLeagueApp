import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center flex-shrink-0">
        <div>
           <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
           <p *ngIf="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
        </div>
        <button (click)="onCancel()" class="text-gray-400 hover:text-gray-500 transition-colors">
            <span class="sr-only">Fermer</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white relative">
         <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <ng-content></ng-content>

            <!-- Global Error Message -->
            <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ errorMessage }}
            </div>
         </form>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-white">
        <!-- Cancel -->
        <button 
          type="button" 
          (click)="onCancel()"
          class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-4 focus:ring-gray-100">
          {{ cancelLabel }}
        </button>

        <!-- Submit -->
        <button 
          type="button" 
          (click)="onSubmit()"
          [disabled]="(disableInvalid && formGroup.invalid) || isLoading"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-lg shadow-indigo-500/20 focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg *ngIf="isLoading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Enregistrement...' : submitLabel }}</span>
        </button>
      </div>
    </div>
  `
})
export class UiFormComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() formGroup!: FormGroup;
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() submitLabel: string = 'Enregistrer';
  @Input() cancelLabel: string = 'Annuler';
  @Input() disableInvalid: boolean = true;

  @Output() submitForm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit() {
    if ((!this.disableInvalid || this.formGroup.valid) && !this.isLoading) {
      this.submitForm.emit();
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
