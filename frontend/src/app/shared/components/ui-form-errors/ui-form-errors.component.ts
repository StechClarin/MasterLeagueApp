import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-form-errors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errors && errors.length > 0" 
         class="mb-6 p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="flex items-center mb-3">
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <h4 class="text-sm font-bold text-red-900">Attention : Des corrections sont nécessaires</h4>
        </div>
        
        <ul class="space-y-2">
            <li *ngFor="let err of errors" class="flex items-start text-sm group">
                <span class="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] uppercase tracking-wider font-bold mr-2 mt-0.5 group-hover:bg-red-200 transition-colors">
                    {{ err.field }}
                </span>
                <span class="text-red-700 font-medium">{{ err.message }}</span>
            </li>
        </ul>
    </div>
  `
})
export class UiFormErrorsComponent {
  @Input() errors: Array<{ field: string, message: string }> = [];
}
