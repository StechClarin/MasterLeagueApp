import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ui-form-actions',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-white">
        <!-- Cancel -->
        <button 
          type="button" 
          (click)="cancel.emit()"
          class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-4 focus:ring-gray-100">
          {{ cancelLabel }}
        </button>

        <!-- Submit -->
        <button 
          type="button" 
          (click)="submit.emit()"
          [disabled]="disabled || isSubmitting"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-lg shadow-indigo-500/20 focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg *ngIf="isSubmitting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Enregistrement...' : submitLabel }}</span>
        </button>
    </div>
  `
})
export class UiFormActionsComponent {
    @Input() isSubmitting: boolean = false;
    @Input() disabled: boolean = false;
    @Input() submitLabel: string = 'Enregistrer';
    @Input() cancelLabel: string = 'Annuler';

    @Output() submit = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
}
