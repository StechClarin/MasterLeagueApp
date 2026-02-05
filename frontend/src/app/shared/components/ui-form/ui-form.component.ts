import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UiFormHeaderComponent } from '../ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '../ui-form-actions/ui-form-actions.component';

@Component({
  selector: 'app-ui-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiFormHeaderComponent, UiFormActionsComponent],
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

            <!-- Global Error Message -->
            <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ errorMessage }}
            </div>
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
