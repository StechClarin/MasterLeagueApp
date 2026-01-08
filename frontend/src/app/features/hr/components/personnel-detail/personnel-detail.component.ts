import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment'; // Adjust path

@Component({
  selector: 'app-personnel-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Header with gradient and user initials -->
      <div class="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 pb-20 rounded-t-xl sm:rounded-none">
        <div class="flex justify-between items-start text-white">
          <h2 class="text-xl font-bold opacity-90">Détails du Personnel</h2>
          <button (click)="close.emit()" class="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg p-1">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Avatar & Name Overlay -->
      <div class="px-6 relative flex-shrink-0">
        <div class="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-4">
          <div class="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl">
            <img *ngIf="data?.user?.photo && !imageError" [src]="getPhotoUrl(data.user.photo)" class="w-full h-full object-cover rounded-xl border border-indigo-50" alt="Avatar" (error)="imageError = true">
            <div *ngIf="!data?.user?.photo || imageError" class="h-full w-full rounded-xl bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-3xl font-bold text-indigo-600 border border-indigo-50">
              {{ getInitials(data?.user?.username) }}
            </div>
          </div>
          <div class="text-center sm:text-left mb-2">
            <h1 class="text-2xl font-bold text-gray-900">{{ data?.user?.firstName }} {{ data?.user?.lastName }}</h1>
          <p class="text-indigo-600 font-medium">&#64;{{ data?.user?.username }}</p>
          </div>
          <div class="sm:ml-auto mb-3">
             <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + (data?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')">
                {{ data?.isActive ? 'Actif' : 'Inactif' }}
             </span>
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Information Personnelle -->
            <div class="space-y-4">
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Identité
                </h3>
                <dl class="space-y-3">
                    <div>
                        <dt class="text-xs text-gray-500">Email Personnel</dt>
                        <dd class="text-sm font-medium text-gray-900 break-all">{{ data?.user?.email }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-gray-500">Téléphone</dt>
                        <dd class="text-sm font-medium text-gray-900">{{ data?.phoneNumber || '-' }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-gray-500">Adresse</dt>
                        <dd class="text-sm font-medium text-gray-900">{{ data?.address || '-' }}</dd>
                    </div>
                </dl>
            </div>

            <!-- Information Professionnelle -->
            <div class="space-y-4">
                <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Poste & Contrat
                </h3>
                <dl class="space-y-3">
                     <div>
                        <dt class="text-xs text-gray-500">Matricule</dt>
                        <dd class="text-sm font-mono bg-gray-50 px-2 py-1 rounded inline-block text-gray-700">{{ data?.matricule }}</dd>
                    </div>
                    <div>
                        <dt class="text-xs text-gray-500">Poste</dt>
                        <dd class="text-sm font-medium text-gray-900">{{ data?.jobTitle }}</dd>
                    </div>
                     <div>
                        <dt class="text-xs text-gray-500">Email Professionnel</dt>
                        <dd class="text-sm font-medium text-gray-900 break-all">{{ data?.emailPro || '-' }}</dd>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <dt class="text-xs text-gray-500">Type de Contrat</dt>
                            <dd class="text-sm font-medium text-gray-900">{{ data?.contractType?.designation || '-' }}</dd>
                        </div>
                        <div>
                            <dt class="text-xs text-gray-500">Date Recrutement</dt>
                            <dd class="text-sm font-medium text-gray-900">{{ data?.dateHired | date:'shortDate' }}</dd>
                        </div>
                    </div>
                    <div>
                        <dt class="text-xs text-gray-500">Établissement</dt>
                        <dd class="text-sm font-medium text-indigo-600">{{ data?.establishment?.name }}</dd>
                    </div>
                </dl>
            </div>
            
            <!-- Rôles -->
            <div class="col-span-1 md:col-span-2 space-y-4">
                 <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Rôles Système
                </h3>
                <div class="flex flex-wrap gap-2">
                    <span *ngFor="let role of data?.roles" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                        {{ role.name }}
                    </span>
                    <span *ngIf="!data?.roles?.length" class="text-sm text-gray-400 italic">Aucun rôle assigné</span>
                </div>
            </div>

        </div>
      </div>
      
      <!-- Footer -->
       <div class="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
            <button (click)="close.emit()" class="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm">
                Fermer
            </button>
       </div>
    </div>
  `
})
export class PersonnelDetailComponent {
  @Input() data: any;
  @Output() close = new EventEmitter<void>();
  imageError = false;

  getInitials(name: string | undefined): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  getPhotoUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/media/${cleanPath}`;
  }
}
