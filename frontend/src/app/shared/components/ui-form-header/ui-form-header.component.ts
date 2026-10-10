import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
    selector: 'app-ui-form-header',
    standalone: true,
    imports: [],
    template: `
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0 bg-white">
      <div>
        <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
        @if (description) {
          <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
        }
      </div>
      <button type="button" (click)="close.emit()" class="text-gray-400 hover:text-gray-500 transition-colors">
        <span class="sr-only">Fermer</span>
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    `
})
export class UiFormHeaderComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Output() close = new EventEmitter<void>();
}
