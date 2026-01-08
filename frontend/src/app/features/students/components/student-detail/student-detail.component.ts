import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-student-detail',
    standalone: true,
    imports: [CommonModule, UiTabsComponent, UiAvatarComponent],
    templateUrl: './student-detail.component.html'
})
export class StudentDetailComponent {
    @Input() data: any | null = null;
    @Output() closeParams = new EventEmitter<void>(); // Renamed to avoid reserved word conflict if any, or just consistent naming

    tabs: Tab[] = [
        { id: 'identity', label: 'Identité' },
        { id: 'cursus', label: 'Scolarité' },
        { id: 'family', label: 'Famille' },
        { id: 'health', label: 'Santé' }
    ];
    currentTab = signal('identity');

    close() {
        this.closeParams.emit();
    }

    // Helper to get active enrollment
    get currentEnrollment() {
        if (!this.data?.enrollments) return null;
        return this.data.enrollments.find((e: any) => e.status === 'ACTIVE') || this.data.enrollments[0];
    }

    getBloodGroupLabel(value: string | undefined): string {
        if (!value) return '?';
        const map: { [key: string]: string } = {
            'AB_': 'AB+', 'AB__5': 'AB-',
            'A_': 'A+', 'A__1': 'A-',
            'B_': 'B+', 'B__3': 'B-',
            'O_': 'O+', 'O__7': 'O-'
        };
        return map[value] || value;
    }

    getPhotoUrl(path: string): string {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const baseUrl = environment.apiUrl.replace('/api', '');
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${baseUrl}/media/${cleanPath}`;
    }
}
