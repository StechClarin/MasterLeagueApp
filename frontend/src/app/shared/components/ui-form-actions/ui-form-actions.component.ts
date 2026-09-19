import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
    selector: 'app-ui-form-actions',
    standalone: true,
    imports: [CommonModule, UiButtonComponent],
    template: `
    <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-white">
        <!-- Cancel -->
        <app-ui-button 
          type="button" 
          [label]="cancelLabel"
          variant="secondary"
          (btnClick)="cancel.emit()">
        </app-ui-button>

        <!-- Submit -->
        <app-ui-button 
          type="button" 
          [label]="isSubmitting ? 'Enregistrement...' : submitLabel"
          variant="primary"
          [loading]="isSubmitting"
          [disabled]="disabled"
          (btnClick)="submit.emit()">
        </app-ui-button>
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
