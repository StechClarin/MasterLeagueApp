import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModalComponent } from '../ui-modal/ui-modal.component';

@Component({
    selector: 'app-ui-export-modal',
    standalone: true,
    imports: [CommonModule, UiModalComponent],
    template: `
    <app-ui-modal [isOpen]="isOpen" (close)="close.emit()">
      <div class="p-6 bg-white rounded-xl shadow-xl max-w-md mx-auto text-center">
        <h3 class="text-xl font-bold text-gray-900 mb-2">Exporter les données</h3>
        <p class="text-gray-500 mb-8">Choisissez le format d'export souhaité. Le fichier contiendra toutes les données correspondant à vos filtres actuels.</p>
        
        <div class="grid grid-cols-2 gap-4">
          <button (click)="confirm.emit('excel')" [disabled]="isExporting"
            class="flex flex-col items-center justify-center p-6 border-2 border-green-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
            <div class="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span class="font-semibold text-gray-900 group-hover:text-green-700">Excel</span>
          </button>

          <button (click)="confirm.emit('pdf')" [disabled]="isExporting"
            class="flex flex-col items-center justify-center p-6 border-2 border-red-100 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
            <div class="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="font-semibold text-gray-900 group-hover:text-red-700">PDF</span>
          </button>
        </div>

        <div *ngIf="isExporting" class="mt-6 flex items-center justify-center text-indigo-600">
          <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Génération du fichier en cours...
        </div>
      </div>
    </app-ui-modal>
  `
})
export class UiExportModalComponent {
    @Input() isOpen: boolean = false;
    @Input() isExporting: boolean = false;
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<'excel' | 'pdf'>();
}
