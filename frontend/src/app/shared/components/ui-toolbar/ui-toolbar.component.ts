import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-ui-toolbar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      
      <!-- Search Section -->
      <div *ngIf="searchControl" class="relative group flex-grow sm:flex-grow-0 min-w-[300px]">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          [formControl]="searchControl" 
          [placeholder]="placeholder"
          class="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-gray-300" />
      </div>

      <!-- Actions Section (Projected Content) -->
      <div class="flex items-center gap-3">
        <ng-content></ng-content>
      </div>

    </div>
  `
})
export class UiToolbarComponent {
    @Input() searchControl?: FormControl;
    @Input() placeholder: string = 'Rechercher...';
}
