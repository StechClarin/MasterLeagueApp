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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Projected Filter Inputs -->
          <ng-content></ng-content>

          <!-- Reset Button -->
          <div class="flex items-end justify-end md:col-start-3">
            <button (click)="reset.emit()"
              class="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors border border-gray-200 hover:border-gray-300 w-full md:w-auto">
              Réinitialiser les filtres
            </button>
          </div>

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
