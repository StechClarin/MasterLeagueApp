import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'app-ui-filter-panel',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent],
  template: `
    <div class="grid transition-all duration-300 ease-in-out"
      [class.grid-rows-\\[1fr\\]]="isOpen"
      [class.grid-rows-\\[0fr\\]]="!isOpen"
      [class.opacity-100]="isOpen"
      [class.opacity-0]="!isOpen"
      [class.mt-4]="isOpen"
      [class.mt-0]="!isOpen">
    
      <div class="overflow-hidden">
        <div class="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm" [formGroup]="form">
          <!-- Optional Header Info / Active Filters Badge -->
          @if (activeFiltersCount > 0) {
            <div class="mb-4 pb-3 border-b border-gray-100 flex items-center justify-between text-xs text-indigo-600 font-medium">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                {{ activeFiltersCount }} filtre(s) actif(s)
              </span>
            </div>
          }
    
          <!-- Projected Filter Inputs -->
          <ng-content></ng-content>
    
          <!-- Standardized UI Kit Reset Button -->
          <div class="flex items-center justify-end mt-6 pt-4 border-t border-gray-100">
            <app-ui-button
              label="Réinitialiser les filtres"
              icon="refresh"
              variant="secondary"
              (btnClick)="reset.emit()">
            </app-ui-button>
          </div>
        </div>
      </div>
    </div>
    `
})
export class UiFilterPanelComponent {
  @Input() isOpen: boolean = false;
  @Input() form!: FormGroup;
  @Input() activeFiltersCount: number = 0;
  @Output() reset = new EventEmitter<void>();
}

