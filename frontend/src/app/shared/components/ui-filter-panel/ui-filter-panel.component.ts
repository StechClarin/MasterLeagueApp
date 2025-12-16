import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-filter-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="transition-all duration-300 ease-in-out overflow-hidden"
      [style.max-height]="isOpen ? '500px' : '0'" 
      [style.opacity]="isOpen ? '1' : '0'">

      <div class="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm mt-6" [formGroup]="form">
          <!-- Projected Filter Inputs -->
          <ng-content></ng-content>

          <!-- Reset Button -->
          <div class="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
            <button (click)="reset.emit()"
              class="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors border border-gray-200 hover:border-gray-300 w-full md:w-auto flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Réinitialiser les filtres
            </button>
          </div>
        </div>
    </div>
  `
})
export class UiFilterPanelComponent {
  @Input() isOpen: boolean = false;
  @Input() form!: FormGroup;
  @Output() reset = new EventEmitter<void>();
}
