import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UiFormHeaderComponent } from '../ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '../ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '../ui-form-errors/ui-form-errors.component';

@Component({
  selector: 'app-ui-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiFormHeaderComponent, UiFormActionsComponent, UiFormErrorsComponent],
  template: `
    <div class="h-full flex flex-col bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <!-- Shared Header -->
      <app-ui-form-header
        [title]="title"
        [description]="description"
        (close)="onCancel()">
      </app-ui-form-header>

      <!-- Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white relative">
         <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
            <ng-content></ng-content>

            <app-ui-form-errors [errors]="formErrors"></app-ui-form-errors>
         </form>
      </div>

      <!-- Shared Footer -->
      <app-ui-form-actions
        *ngIf="!isReadOnly"
        [isSubmitting]="isLoading"
        [disabled]="disableInvalid && formGroup.invalid"
        [submitLabel]="submitLabel"
        [cancelLabel]="cancelLabel"
        (submit)="onSubmit()"
        (cancel)="onCancel()">
      </app-ui-form-actions>
    </div>
  `
})
export class UiFormComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() formGroup!: FormGroup;
  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;
  @Input() formErrors: Array<{ field: string, message: string }> = [];
  @Input() submitLabel: string = 'Enregistrer';
  @Input() cancelLabel: string = 'Annuler';
  @Input() disableInvalid: boolean = true;
  @Input() isReadOnly: boolean = false;

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
