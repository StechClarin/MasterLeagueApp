import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
           class="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
        
        <!-- 🖼️ Background Image with Parallax-like Depth -->
        <div class="absolute inset-0 z-0">
          <img src="assets/images/school.png" class="w-full h-full object-cover scale-105 blur-[2px]" alt="School Background">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-900/80 to-purple-950/90 backdrop-blur-sm"></div>
        </div>

        <!-- 🍱 Content Container -->
        <div class="relative z-10 max-w-6xl w-full flex flex-col items-center gap-12 lg:gap-16">
          
          <!-- Header Section -->
          <div class="text-center space-y-6 animate-in slide-in-from-top-10 duration-1000">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span class="text-xs font-black tracking-[0.2em] text-indigo-300 uppercase">Onboarding GigaCore</span>
            </div>
            
            <h2 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Bienvenue chez <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">GigaCore</span>
            </h2>
            
            <p class="text-slate-300/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Prêt pour une nouvelle journée ? Sélectionnez l'entité que vous souhaitez piloter aujourd'hui.
            </p>
          </div>

          <!-- 🔄 Loading State -->
          <div *ngIf="structureState.isLoading() && structureState.establishments().length === 0" 
               class="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div class="relative">
              <div class="w-24 h-24 border-4 border-indigo-500/20 rounded-full"></div>
              <div class="absolute inset-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div class="absolute inset-4 bg-indigo-500/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                 <svg class="w-8 h-8 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 100-4 2 2 0 000 4"></path></svg>
              </div>
            </div>
            <p class="mt-6 text-indigo-300 font-bold tracking-widest text-sm uppercase animate-pulse">Synchronisation de vos accès...</p>
          </div>

          <!-- 🚫 Empty State -->
          <div *ngIf="!structureState.isLoading() && structureState.establishments().length === 0"
               class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 text-center max-w-lg shadow-2xl animate-in zoom-in duration-500">
            <div class="w-20 h-20 bg-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 class="text-2xl font-black text-white mb-3">Accès non configuré</h3>
            <p class="text-slate-400 font-medium mb-8">Votre compte n'est lié à aucun établissement pour le moment. Contactez l'administrateur système.</p>
            <button (click)="structureState.fetchEstablishments()" 
                    class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 group">
              <svg class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Réessayer la connexion
            </button>
          </div>

          <!-- 🏢 Grid of Establishments -->
          <div *ngIf="structureState.establishments().length > 0" 
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-in slide-in-from-bottom-10 duration-1000 delay-300">
            
            <div *ngFor="let ets of structureState.establishments(); let i = index" 
                 (click)="structureState.setEstablishment(ets.id)"
                 class="group relative bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.35)] border-t-white/20">
              
              <!-- Refined Background Decoration -->
              <div class="absolute inset-0 overflow-hidden rounded-[2.5rem]">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
              </div>

              <div class="relative z-10 flex flex-col items-center">
                
                <!-- 🎖️ Minimalist Logo Frame -->
                <div class="relative mb-10">
                  <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-10 group-hover:opacity-40 transition-opacity duration-700"></div>
                  <div class="relative w-32 h-32 rounded-[2rem] bg-slate-900/40 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-all duration-500 ease-out">
                    <ng-container *ngIf="ets.logo; else defaultLogo">
                      <img [src]="getLogoUrl(ets.logo)" class="w-full h-full object-cover">
                    </ng-container>
                    <ng-template #defaultLogo>
                      <div class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                        <!-- High Quality Building SVG -->
                        <svg class="w-14 h-14 text-indigo-400 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 21h18M3 7l9-4 9 4v14H3V7z"/>
                          <path d="M9 21V9h6v12M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/>
                        </svg>
                      </div>
                    </ng-template>
                  </div>
                </div>
                
                <!-- 📝 Identity Section -->
                <div class="flex flex-col items-center gap-4">
                  <h3 class="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors duration-300 tracking-tight text-center">
                    {{ ets.name }}
                  </h3>
                  
                  <div class="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 group-hover:border-indigo-500/30 transition-all">
                    <svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span class="text-xs font-black text-slate-300 uppercase tracking-widest text-center">
                      {{ ets.country || 'Cameroun' }} — {{ ets.city || 'Ville' }}
                    </span>
                  </div>
                </div>

                <!-- Subtle Hover Indicator -->
                <div class="mt-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 text-center">
                  <span class="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                    Ouvrir l'espace de travail
                  </span>
                </div>

              </div>
            </div>
          </div>
          
          <!-- Footer Branding -->
          <div class="text-slate-500 text-xs font-black tracking-[0.4em] uppercase opacity-30 animate-in fade-in duration-1000 delay-1000">
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