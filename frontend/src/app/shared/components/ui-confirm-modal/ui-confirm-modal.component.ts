import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-ui-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-6 bg-white rounded-xl shadow-xl max-w-md mx-auto text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
        [ngClass]="{
          'bg-red-100': type === 'danger',
          'bg-yellow-100': type === 'warning',
          'bg-blue-100': type === 'info'
        }">
        <svg class="h-6 w-6" [ngClass]="{
          'text-red-600': type === 'danger',
          'text-yellow-600': type === 'warning',
          'text-blue-600': type === 'info'
        }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">{{ title }}</h3>
      
      <div class="mt-2">
        <p class="text-sm text-gray-500">
          {{ message }}
        </p>
      </div>

      <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button type="button" (click)="confirm.emit()"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm transition-colors"
          [ngClass]="{
            'bg-red-600 hover:bg-red-700 focus:ring-red-500': type === 'danger',
            'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500': type === 'warning',
            'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': type === 'info'
          }">
          {{ confirmLabel }}
        </button>
        <button type="button" (click)="cancel.emit()"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors">
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  `
})
export class UiConfirmModalComponent {
    @Input() title: string = 'Confirmer la suppression';
    @Input() message: string = 'Êtes-vous sûr de vouloir continuer ?';
    @Input() confirmLabel: string = 'Supprimer';
    @Input() cancelLabel: string = 'Annuler';
    @Input() type: 'danger' | 'warning' | 'info' = 'danger';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
}
