import { Component, Input, OnChanges } from '@angular/core';

import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-ui-avatar',
    standalone: true,
    imports: [],
    template: `
    <div [class]="containerClasses">
      @if (fullPhotoUrl && !hasError) {
        <img [src]="fullPhotoUrl" alt="Avatar" [class]="avatarClasses + ' object-cover'" (error)="hasError = true">
      }
      @if (!fullPhotoUrl || hasError) {
        <div [class]="avatarClasses">
          {{ initials }}
        </div>
      }
    </div>
    `
})
export class UiAvatarComponent implements OnChanges {
    @Input() name: string = '';
    @Input() photoUrl: string | null | undefined = null;
    @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

    hasError = false;

    ngOnChanges() {
        this.hasError = false;
    }

    get fullPhotoUrl(): string | null {
        if (!this.photoUrl) return null;
        if (this.photoUrl.startsWith('http') || this.photoUrl.startsWith('data:')) return this.photoUrl;

        const baseUrl = environment.apiUrl.replace('/api', '');
        const cleanPath = this.photoUrl.startsWith('/') ? this.photoUrl.substring(1) : this.photoUrl;
        return `${baseUrl}/media/${cleanPath}`;
    }

    get initials(): string {
        return this.name ? this.name.charAt(0).toUpperCase() : '?';
    }

    get containerClasses(): string {
        switch (this.size) {
            case 'sm': return 'h-8 w-8 flex-shrink-0';
            case 'lg': return 'h-16 w-16 flex-shrink-0';
            case 'xl': return 'h-20 w-20 flex-shrink-0';
            case 'full': return 'h-full w-full';
            case 'md': default: return 'h-11 w-11 flex-shrink-0';
        }
    }

    get avatarClasses(): string {
        // Remove flex/justify/text logic for image mode? Or keep standard classes and add object-cover.
        // For img, we need w-full h-full rounded-full.
        // The current avatarClasses includes bg-gradient which we don't need for img, but it's fine as fallback/background.
        // Wait, for img, I should separate classes or reuse.
        const base = 'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white w-full h-full';
        switch (this.size) {
            case 'sm': return `${base} text-xs`;
            case 'lg': return `${base} text-xl`;
            case 'xl': return `${base} text-2xl border-4 border-white/20`;
            case 'md': default: return `${base} text-lg group-hover:scale-105 transition-transform duration-200`;
        }
    }
}
