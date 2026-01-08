import { Component, ElementRef, Input, ViewChild, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-ui-file-input',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiFileInputComponent),
            multi: true
        }
    ],
    template: `
    <div class="w-full">
      <!-- Label -->
      <label *ngIf="label" class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <!-- Drop Zone -->
      <div 
        class="relative w-full border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer group bg-white"
        [ngClass]="{
            'border-gray-300 hover:border-indigo-400 hover:bg-gray-50': !isDragOver && !selectedFile,
            'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200': isDragOver,
            'border-green-400 bg-green-50': selectedFile
        }"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <!-- Content: No File -->
        <div *ngIf="!selectedFile" class="flex flex-col items-center justify-center py-8 px-4 text-center">
            
            <div class="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg *ngIf="!isDragOver" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <svg *ngIf="isDragOver" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>

            <p class="text-sm font-medium text-gray-900">
                <span class="text-indigo-600 hover:underline">Cliquez pour upload</span> ou glissez un fichier
            </p>
            <p class="text-xs text-gray-500 mt-1">
                {{ acceptString || 'PDF, Excel, Word (Max 10MB)' }}
            </p>
        </div>

        <!-- Content: File Selected -->
        <div *ngIf="selectedFile" class="flex items-center justify-between p-4">
            <div class="flex items-center gap-4">
                <!-- File Icon -->
                <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100">
                    <ng-container [ngSwitch]="getFileType(selectedFile.name)">
                        <!-- PDF -->
                        <svg *ngSwitchCase="'pdf'" class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-4h2v4z"/></svg>
                        <!-- Excel -->
                        <svg *ngSwitchCase="'xls'" class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        <!-- Default -->
                        <svg *ngSwitchDefault class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </ng-container>
                </div>
                
                <!-- Info -->
                <div class="overflow-hidden">
                    <p class="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{{ selectedFile.name }}</p>
                    <p class="text-xs text-gray-500">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
                </div>
            </div>

            <!-- Remove Button -->
            <button 
                type="button"
                class="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                (click)="removeFile($event)"
                title="Supprimer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

      </div>

      <!-- Hidden Input -->
      <input 
        #fileInput
        type="file" 
        [accept]="accept"
        class="hidden"
        (change)="onFileSelected($event)"
      >
    </div>
  `
})
export class UiFileInputComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() required: boolean = false;
    @Input() accept: string = '.pdf,.doc,.docx,.xls,.xlsx,.csv';

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    selectedFile: File | null = null;
    isDragOver = false;

    disabled = false;
    onChange = (value: File | null) => { };
    onTouched = () => { };

    get acceptString(): string {
        return this.accept.replace(/,/g, ', ').toUpperCase();
    }

    // ControlValueAccessor Interface
    writeValue(value: any): void {
        // Note: On ne peut pas "set" un File object programmatiquement pour des raisons de sécurité
        // Mais on pourrait afficher le nom si c'était une URL pour l'édition (à gérer plus tard)
        this.selectedFile = null;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    // UI Events
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.disabled) {
            this.isDragOver = true;
        }
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        if (this.disabled) return;

        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            this.handleFile(event.dataTransfer.files[0]);
        }
    }

    removeFile(event: Event) {
        event.stopPropagation(); // Stop click propagating to the drop zone
        this.selectedFile = null;
        this.fileInput.nativeElement.value = ''; // Reset input
        this.onChange(null);
        this.onTouched();
    }

    // Helper
    private handleFile(file: File) {
        // Validation basic (Type)
        // TODO: Advanced validation
        this.selectedFile = file;
        this.onChange(file);
        this.onTouched();
    }

    getFileType(filename: string): 'pdf' | 'xls' | 'other' {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'pdf';
        if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'xls';
        return 'other';
    }
}
