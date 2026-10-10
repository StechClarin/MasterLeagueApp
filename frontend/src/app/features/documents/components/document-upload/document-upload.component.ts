import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-document-upload',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-4">
      <!-- Upload Zone -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-gray-50 hover:bg-white"
        (click)="fileInput.click()"
        (dragover)="$event.preventDefault()"
        (drop)="onDrop($event)">
    
        <input
          #fileInput
          type="file"
          class="hidden"
          (change)="onFileSelected($event)">
    
        <div class="text-gray-600">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="mt-1 text-sm">Cliquez ou glissez un fichier ici</p>
          <p class="text-xs text-gray-500 mt-1">PDF, Images (Max 10MB)</p>
        </div>
      </div>
    
      <!-- Upload Progress -->
      @if (isUploading) {
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-indigo-600 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
        </div>
      }
    
      <!-- File List -->
      <div class="space-y-2">
        @for (doc of documents; track doc) {
          <div class="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="bg-indigo-100 p-2 rounded text-indigo-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 truncate">{{ doc.title }}</p>
                <p class="text-xs text-gray-500">{{ doc.documentType }} - {{ doc.uploadedAt | date:'short' }}</p>
              </div>
            </div>
            <a [href]="doc.fileUrl" target="_blank" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </a>
          </div>
        }
        @if (documents.length === 0) {
          <div class="text-center text-sm text-gray-500 py-4 italic">
            Aucun document attaché.
          </div>
        }
      </div>
    </div>
    `
})
export class DocumentUploadComponent {
    @Input({ required: true }) entityId!: string | number;
    @Input({ required: true }) appLabel!: string;
    @Input({ required: true }) modelName!: string;
    @Input() documentType: string = 'AUTRE';
    @Output() uploaded = new EventEmitter<void>();

    private service = inject(DocumentService);

    isUploading = false;
    documents: any[] = [];

    ngOnInit() {
        this.loadDocuments();
    }

    loadDocuments() {
        if (!this.entityId) return;
        this.service.getByEntity(this.appLabel, this.modelName, this.entityId.toString())
            .subscribe(docs => this.documents = docs || []);
    }

    uploadFile(file: File) {
        if (!file) return;

        this.isUploading = true;
        this.service.uploadDocument(file, this.appLabel, this.modelName, this.entityId, this.documentType)
            .pipe(finalize(() => this.isUploading = false))
            .subscribe({
                next: () => {
                    this.uploaded.emit();
                    this.loadDocuments();
                },
                error: (err) => console.error('Upload failed', err)
            });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        this.uploadFile(file);
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer?.files.length) {
            this.uploadFile(event.dataTransfer.files[0]);
        }
    }
}
