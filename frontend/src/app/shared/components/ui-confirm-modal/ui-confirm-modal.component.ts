import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent, ButtonVariant } from '../ui-button/ui-button.component';

export type ConfirmModalType = 'danger' | 'warning' | 'info' | 'success';

@Component({
  selector: 'app-ui-confirm-modal',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm transition-all duration-200 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      (click)="onBackdropClick($event)">
    
      <div
        class="relative w-full max-w-md p-6 overflow-hidden text-center transition-all transform bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/60 scale-100"
        (click)="$event.stopPropagation()">
    
        <!-- Close Button (X) -->
        @if (showCloseButton) {
          <button
            type="button"
            [disabled]="loading"
            (click)="onCancel()"
            class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fermer">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
    
        <!-- Icon Badge -->
        <div
          class="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl mb-4 transition-transform hover:scale-105"
          [ngClass]="badgeClasses">
          <svg
            class="h-7 w-7"
            [ngClass]="iconColorClasses"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              [attr.d]="iconPath" />
          </svg>
        </div>
    
        <!-- Title -->
        <h3
          class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          id="modal-title">
          {{ title }}
        </h3>
    
        <!-- Message Body -->
        <div class="mt-2.5 px-2">
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {{ message }}
          </p>
        </div>
    
        <!-- Action Buttons -->
        <div class="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <app-ui-button
            [label]="cancelLabel"
            variant="secondary"
            [disabled]="loading"
            customClass="w-full sm:w-auto min-w-[100px]"
            (btnClick)="onCancel()">
          </app-ui-button>
    
          <app-ui-button
            [label]="confirmLabel"
            [variant]="confirmButtonVariant"
            [loading]="loading"
            [icon]="effectiveConfirmIcon"
            customClass="w-full sm:w-auto min-w-[120px]"
            (btnClick)="onConfirm()">
          </app-ui-button>
        </div>
      </div>
    </div>
    `
})
export class UiConfirmModalComponent {
  @Input() title: string = 'Confirmer l\'action';
  @Input() message: string = 'Êtes-vous sûr de vouloir continuer ?';
  @Input() confirmLabel: string = 'Confirmer';
  @Input() cancelLabel: string = 'Annuler';
  @Input() type: ConfirmModalType = 'danger';
  @Input() loading: boolean = false;
  @Input() closeOnBackdropClick: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() confirmIcon?: string;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.loading) {
      this.onCancel();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && !this.loading) {
      this.onCancel();
    }
  }

  onCancel(): void {
    if (!this.loading) {
      this.cancel.emit();
    }
  }

  onConfirm(): void {
    if (!this.loading) {
      this.confirm.emit();
    }
  }

  get confirmButtonVariant(): ButtonVariant {
    switch (this.type) {
      case 'danger': return 'danger';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info':
      default: return 'primary';
    }
  }

  get effectiveConfirmIcon(): string | undefined {
    if (this.confirmIcon) return this.confirmIcon;
    if (this.type === 'danger') return 'trash';
    if (this.type === 'success') return 'check';
    return undefined;
  }

  get badgeClasses(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200/60 dark:border-rose-800/40 shadow-sm shadow-rose-100 dark:shadow-none';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200/60 dark:border-amber-800/40 shadow-sm shadow-amber-100 dark:shadow-none';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm shadow-emerald-100 dark:shadow-none';
      case 'info':
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-200/60 dark:border-indigo-800/40 shadow-sm shadow-indigo-100 dark:shadow-none';
    }
  }

  get iconColorClasses(): string {
    switch (this.type) {
      case 'danger': return 'text-rose-600 dark:text-rose-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'success': return 'text-emerald-600 dark:text-emerald-400';
      case 'info':
      default: return 'text-indigo-600 dark:text-indigo-400';
    }
  }

  get iconPath(): string {
    switch (this.type) {
      case 'danger':
        // Trash / Exclamation combo or Trash icon
        return 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';
      case 'warning':
        // Alert triangle icon
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'success':
        // Check mark in circle icon
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info':
      default:
        // Information circle icon
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
}

