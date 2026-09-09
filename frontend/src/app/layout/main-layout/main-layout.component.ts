import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Added CommonModule

// On utilise les alias pour importer les briques
import { SidebarComponent } from '../components/sidebar/sidebar.component'; // Path changed
import { HeaderComponent } from '../components/header/header.component'; // Path changed
import { UiToastComponent } from '@shared/components/ui-toast/ui-toast.component'; // Added UiToastComponent
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  // On importe les 3 éléments nécessaires pour la page
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, UiToastComponent], // Added CommonModule and UiToastComponent
  template: `
    <div class="relative flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      <!-- 🌟 PREMIUM SELECTION OVERLAY -->
      <div *ngIf="!structureState.currentEstablishmentId()"
           class="fixed inset-0 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-700">

        <!-- 🖼️ Background Image (fixe — ne défile pas avec les cartes) -->
        <div class="absolute inset-0 z-0">
          <img src="assets/images/school.png" class="w-full h-full object-cover scale-105 blur-[2px]" alt="School Background">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-900/80 to-purple-950/90 backdrop-blur-sm"></div>
        </div>

        <!-- 🍱 Content Container : en-tête et pied fixes, seules les cartes défilent -->
        <div class="relative z-10 flex-1 min-h-0 w-full max-w-[1760px] mx-auto flex flex-col px-4 sm:px-8 lg:px-10 pt-5 md:pt-7 pb-3 md:pb-5 gap-4 md:gap-5">

          <!-- Header Section (fixe) -->
          <div class="shrink-0 text-center space-y-3 md:space-y-4 animate-in slide-in-from-top-10 duration-1000">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 backdrop-blur-md">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span class="text-[10px] font-black tracking-[0.2em] text-indigo-300 uppercase">Onboarding Eteyelo</span>
            </div>

            <h2 class="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Bienvenue chez <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Eteyelo</span>
            </h2>

            <p class="text-slate-300/80 text-sm md:text-lg max-w-2xl mx-auto font-medium">
              Prêt pour une nouvelle journée ? Sélectionnez l'entité que vous souhaitez piloter aujourd'hui.
            </p>
          </div>

          <!-- 🔄 Loading State -->
          <div *ngIf="structureState.isLoading() && structureState.establishments().length === 0"
               class="flex-1 min-h-0 flex items-center justify-center py-6 animate-in fade-in zoom-in duration-500">
            <div class="flex flex-col items-center justify-center">
              <div class="relative">
                <div class="w-20 h-20 border-4 border-indigo-500/20 rounded-full"></div>
                <div class="absolute inset-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div class="absolute inset-3 bg-indigo-500/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                   <svg class="w-8 h-8 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 100-4 2 2 0 000 4"></path></svg>
                </div>
              </div>
              <p class="mt-5 text-indigo-300 font-bold tracking-widest text-sm uppercase animate-pulse">Synchronisation de vos accès...</p>
            </div>
          </div>

          <!-- 🚫 Empty State -->
          <div *ngIf="!structureState.isLoading() && structureState.establishments().length === 0"
               class="flex-1 min-h-0 flex items-center justify-center">
            <div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-10 text-center max-w-lg shadow-2xl animate-in zoom-in duration-500">
              <div class="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 transform -rotate-6">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">Accès non configuré</h3>
              <p class="text-slate-400 font-medium mb-6">Votre compte n'est lié à aucun établissement pour le moment. Contactez l'administrateur système.</p>
              <button (click)="goToLogin()"
                      class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group">
                <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                Retourner à la connexion
              </button>
            </div>
          </div>

          <!-- 🏢 Grid of Establishments : panneau à défilement interne (la modale reste immobile) -->
          <div *ngIf="structureState.establishments().length > 0"
               class="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain pr-0.5 md:pr-1 rounded-xl animate-in slide-in-from-bottom-10 duration-1000 delay-300"
               style="scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.3) transparent;">
            <div class="min-h-full flex flex-col">
              <div class="my-auto w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 lg:gap-5 pb-2">

                <div *ngFor="let ets of structureState.establishments()"
                     (click)="structureState.setEstablishment(ets.id)"
                     class="group relative flex flex-col items-center gap-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl p-2.5 md:p-3.5 text-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,0.35)] border-t-white/20 min-w-0 overflow-hidden">

                  <!-- Refined Background Decoration -->
                  <div class="absolute inset-0 pointer-events-none">
                    <div class="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
                  </div>

                  <div class="relative z-10 flex flex-col items-center gap-2 w-full min-w-0">

                    <!-- 🎖️ Compact Logo Frame -->
                    <div class="relative shrink-0">
                      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-10 group-hover:opacity-40 transition-opacity duration-700"></div>
                      <div class="relative w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-900/40 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-all duration-300 ease-out">
                        <ng-container *ngIf="ets.logo; else defaultLogo">
                          <img [src]="getLogoUrl(ets.logo)" class="w-full h-full object-cover" [alt]="'Logo de ' + ets.name">
                        </ng-container>
                        <ng-template #defaultLogo>
                          <div class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                            <!-- High Quality Building SVG -->
                            <svg class="w-6 h-6 md:w-8 md:h-8 text-indigo-400 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 21h18M3 7l9-4 9 4v14H3V7z"/>
                              <path d="M9 21V9h6v12M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/>
                            </svg>
                          </div>
                        </ng-template>
                      </div>
                    </div>

                    <!-- 📝 Identity Section (compacte) -->
                    <h3 class="w-full text-[13px] md:text-sm font-bold leading-snug text-white group-hover:text-indigo-300 transition-colors duration-300 line-clamp-2 break-words"
                        [title]="ets.name">
                      {{ ets.name }}
                    </h3>

                    <div class="flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 group-hover:border-indigo-500/20 transition-all max-w-full">
                      <svg class="w-3 h-3 shrink-0 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span class="text-[9px] md:text-[10px] font-semibold text-slate-300 uppercase tracking-wide truncate"
                            [title]="(ets.country || 'Cameroun') + ' — ' + (ets.city || 'Ville')">
                        {{ ets.country || 'Cameroun' }} — {{ ets.city || 'Ville' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Branding (fixe) -->
          <div class="shrink-0 text-center text-slate-500 text-[10px] font-black tracking-[0.4em] uppercase opacity-30 animate-in fade-in duration-1000 delay-1000">
             &copy; 2024 Ethernanos Ecosystem
          </div>
        </div>
      </div>

      <app-ui-toast></app-ui-toast>
      
      <!-- Sidebar (Fixed) -->
      <app-sidebar></app-sidebar>

      <!-- Main Content Wrapper (Scrollable) -->
      <div class="ml-72 flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
        
        <app-header></app-header>

        <main [class.blur-md]="!structureState.currentEstablishmentId()" 
              [class.scale-95]="!structureState.currentEstablishmentId()"
              class="flex-1 pt-24 pb-8 overflow-y-auto overflow-x-hidden transition-all duration-700">
          <div class="w-full">
            <router-outlet></router-outlet>
          </div>
        </main>

      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  public structureState = inject(StructureStateService);
  private router = inject(Router);

  goToLogin() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }

  getLogoUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;

    let cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const host = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");

    if (!cleanPath.startsWith('media/')) {
      cleanPath = 'media/' + cleanPath;
    }

    return `${host}/${cleanPath}`;
  }
}