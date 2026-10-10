import { Component, ElementRef, Input, ViewChild, forwardRef, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-ui-media-input',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UiMediaInputComponent),
            multi: true
        }
    ],
    template: `
    <div class="flex flex-col items-center gap-4 w-full">
      <!-- Label -->
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 w-full text-left">
          {{ label }} @if (required) {
          <span class="text-red-500">*</span>
        }
      </label>
    }
    
    <!-- Preview Container -->
    <div
      class="relative group cursor-pointer transition-all duration-300 ease-in-out"
      [ngClass]="shapeClasses"
      (click)="fileInput.click()"
      >
      <!-- Image Preview -->
      @if (previewUrl && isImage) {
        <img
          [src]="previewUrl"
          class="w-full h-full object-cover border-4 border-white shadow-xl"
          [ngClass]="shapeClasses"
          >
      }
    
      <!-- Video Preview -->
      @if (previewUrl && isVideo) {
        <video
          [src]="previewUrl"
          class="w-full h-full object-cover border-4 border-white shadow-xl bg-black"
          [ngClass]="shapeClasses"
          controls
        ></video>
      }
    
      <!-- Placeholder (No File) -->
      @if (!previewUrl) {
        <div
          class="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
          [ngClass]="shapeClasses"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-xs font-semibold">Upload</span>
        </div>
      }
    
      <!-- Overlay on Hover (Edit) -->
      <div
        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
        [ngClass]="shapeClasses"
        >
        <div class="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Helper Text -->
    @if (helpText) {
      <div class="text-xs text-gray-500 text-center">
        {{ helpText }}
      </div>
    }
    
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
export class UiMediaInputComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() required: boolean = false;
    @Input() accept: string = 'image/*,video/*';
    @Input() shape: 'circle' | 'square' | 'rect' = 'circle';
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() helpText: string = 'Cliquez pour modifier';

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    previewUrl: string | null = null;
    isImage = true;
    isVideo = false;

    disabled = false;
    selectedFile: File | null = null;
    onChange = (value: File | null) => { };
    onTouch = () => { };

    constructor(private cdr: ChangeDetectorRef) {}

    get shapeClasses() {
        const rounded = this.shape === 'circle' ? 'rounded-full' : (this.shape === 'square' ? 'rounded-2xl' : 'rounded-lg aspect-video');

        let sizeClass = '';
        if (this.shape !== 'rect') {
            const dim = this.size === 'sm' ? 'w-24 h-24' : (this.size === 'lg' ? 'w-48 h-48' : 'w-32 h-32');
            sizeClass = dim;
        } else {
            // Rect logic (banner style)
            sizeClass = this.size === 'sm' ? 'w-48 h-28' : (this.size === 'lg' ? 'w-full max-w-lg h-64' : 'w-80 h-44');
        }

        return `${rounded} ${sizeClass} overflow-hidden`;
    }

    // ControlValueAccessor Interface
    writeValue(value: any): void {
        if (typeof value === 'string' && value.length > 0) {
            // C'est une URL existante
            this.previewUrl = value;
            this.checkMediaType(value);
        } else if (value instanceof File) {
            this.selectedFile = value;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl = e.target?.result as string;
                this.checkMediaType(value.type);
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(value);
        } else {
            this.previewUrl = null;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    // Logic
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Update Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewUrl = e.target?.result as string;
                this.checkMediaType(file.type);
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);

            // Notify form
            this.onChange(file);
            this.onTouch();
        }
    }

    private checkMediaType(source: string) {
        // Si c'est un File.type (ex: image/png)
        if (source.includes('image')) {
            this.isImage = true;
            this.isVideo = false;
        } else if (source.includes('video')) {
            this.isImage = false;
            this.isVideo = true;
        } else {
            // Si c'est une extension de fichier dans l'URL
            const ext = source.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
                this.isImage = true;
                this.isVideo = false;
            } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
                this.isImage = false;
                this.isVideo = true;
            }
        }
    }
}
