import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
    selector: 'app-ui-confirm-modal',
    standalone: true,
    imports: [CommonModule, UiButtonComponent],
    template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto backdrop-blur-sm">
      <div class="p-6 bg-white rounded-xl shadow-2xl max-w-md w-full text-center relative z-10 transform transition-all">
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
        
        <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">{{ title }}</h3>
        
        <div class="mt-2">
          <p class="text-sm text-gray-500">
            {{ message }}
          </p>
        </div>

        <div class="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <app-ui-button
            [label]="cancelLabel"
            variant="secondary"
            customClass="w-full sm:w-auto"
            (btnClick)="cancel.emit()">
          </app-ui-button>
          
          <app-ui-button
            [label]="confirmLabel"
            [variant]="type === 'danger' ? 'danger' : (type === 'warning' ? 'warning' : 'primary')"
            customClass="w-full sm:w-auto"
            (btnClick)="confirm.emit()">
          </app-ui-button>
        </div>
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
