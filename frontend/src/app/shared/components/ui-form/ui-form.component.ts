import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-ui-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="bg-white rounded-xl shadow-xl border border-gray-200 max-w-2xl mx-auto overflow-hidden">
      
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
        <p *ngIf="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
      </div>

      <!-- Content -->
      <div class="p-6">
        <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
          
          <!-- Projected Content (Inputs) -->
          <ng-content></ng-content>

          <!-- Global Error Message -->
          <div *ngIf="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ errorMessage }}
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end items-center mt-8 pt-6 border-t border-gray-100 gap-3">
            <button 
              type="button" 
              (click)="onCancel()"
              class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm">
              {{ cancelLabel }}
            </button>
            
            <button 
              type="submit" 
              [disabled]="formGroup.invalid || isLoading"
              class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center">
              <span *ngIf="isLoading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ submitLabel }}
            </button>
          </div>

        </form>
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

    @Output() submitForm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onSubmit() {
        if (this.formGroup.valid && !this.isLoading) {
            this.submitForm.emit();
        } else {
            this.formGroup.markAllAsTouched();
        }
    }

    onCancel() {
        this.cancel.emit();
    }
}
