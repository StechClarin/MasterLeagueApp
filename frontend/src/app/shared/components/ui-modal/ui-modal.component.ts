import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Overlay (Rideau noir) -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div class="fixed inset-0 bg-black bg-opacity-80 transition-opacity" aria-hidden="true" (click)="onClose()"></div>

        <!-- Centrage vertical -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Contenu de la modale -->
        <div [ngClass]="[maxWidth, 'w-full']" class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() maxWidth = 'sm:max-w-lg';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
