import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

// ✅ On utilise l'alias @core pour l'import propre
import { AuthService } from '@core/services/auth.service';
import { StructureStateService } from '@core/services/structure-state.service';
import { ModuleStateService } from '@core/services/module-state.service';

interface Page {
  id: string;
  title: string;
  link: string;
  icon: string;
  moduleName?: string; // Pour afficher le contexte
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <header class="fixed top-0 right-0 left-72 h-20 bg-gradient-to-r from-[#0a0f1d] to-[#050811] border-b border-slate-800/60 flex items-center justify-between px-8 z-40 transition-all duration-300 shadow-md">
      
      <!-- Left Section: Breadcrumbs / Title -->
      <div class="flex items-center gap-4">
        <div class="flex flex-col">
          <h1 class="text-xl font-bold text-white tracking-tight font-sans">
            Administration
          </h1>
          <div class="flex items-center text-xs font-semibold text-slate-400 space-x-2 mt-0.5">
            <span>Dashboard</span>
            <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            <span class="text-emerald-400">Vue d'ensemble</span>
          </div>
        </div>
      </div>

      <!-- Right Section: Actions & Profile -->
      <div class="flex items-center gap-6">
        
        <!-- Establishment Selector -->
        <div class="hidden md:flex items-center">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 100-4 2 2 0 000 4"></path></svg>
            </div>
            <select 
                [ngModel]="structureState.currentEstablishmentId()"
                (ngModelChange)="structureState.setEstablishment($event || null)"
                class="pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full appearance-none hover:bg-slate-700 hover:border-emerald-400 transition-all cursor-pointer font-medium">
                <option [ngValue]="null">Tous les établissements</option>
                <option *ngFor="let ets of structureState.establishments()" [ngValue]="ets?.id">
                    {{ ets?.name }}
                </option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
        </div>

        <!-- Search Bar -->
        <div class="hidden md:flex items-center relative group">
          <svg class="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            [formControl]="searchControl"
            type="text" 
            placeholder="Recherche rapide..." 
            class="pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-800 transition-all w-64"
            (blur)="onBlur()">
          
          <!-- Search Results Dropdown -->
          <div *ngIf="showResults && (filteredPages$ | async) as results" 
               class="absolute top-full left-0 w-80 mt-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            
            <div *ngIf="results.length > 0; else noResults">
              <div class="py-2">
                <button *ngFor="let page of results" 
                        (click)="navigateTo(page.link)"
                        class="w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center gap-3 group/item transition-colors">
                  <div class="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover/item:bg-emerald-500/20 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-white">{{ page.title }}</p>
                    <p class="text-xs text-slate-400">{{ page.moduleName }}</p>
                  </div>
                </button>
              </div>
            </div>

            <ng-template #noResults>
              <div class="p-4 text-center text-slate-400 text-sm">
                Aucun résultat trouvé.
              </div>
            </ng-template>

          </div>
        </div>

        <div class="h-8 w-px bg-slate-800"></div>

        <!-- Notifications -->
        <button class="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all relative group">
          <span class="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0a0f1d] animate-pulse"></span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          
          <!-- Tooltip -->
          <div class="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
            <p class="text-xs font-semibold text-slate-400 uppercase mb-2">Notifications</p>
            <div class="text-sm text-slate-200 py-1">3 nouveaux messages</div>
          </div>
        </button>

        <!-- Profile Dropdown Trigger -->
        <div class="relative" (click)="isProfileOpen = !isProfileOpen" (mouseleave)="isProfileOpen = false">
          <div class="flex items-center gap-3 cursor-pointer group p-1.5 pr-3 rounded-xl hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-800/80">
            <div class="relative">
               <div class="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-slate-800 group-hover:ring-emerald-400 transition-all">
                 <img [src]="avatarUrl" alt="Profile" class="rounded-full h-full w-full object-cover">
               </div>
               <div class="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            
            <div class="hidden sm:block text-left">
              <p class="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                {{ username }}
              </p>
              <p class="text-xs text-slate-400 font-medium">{{ userRole }}</p>
            </div>
  
            <svg class="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>

          <!-- Dropdown Menu -->
          <div *ngIf="isProfileOpen" 
               class="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg py-1 border border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <a href="#" class="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-emerald-400">Mon Profil</a>
            <a href="#" class="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-emerald-400">Paramètres</a>
          </div>
        </div>

        <!-- Logout Button -->
        <button 
          (click)="logout()" 
          class="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-slate-800" 
          title="Se déconnecter">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>

    </header>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private moduleState = inject(ModuleStateService);
  private router = inject(Router);
  public structureState = inject(StructureStateService);

  get username(): string {
    return this.authService.getUsername() || 'Utilisateur';
  }

  get userRole(): string {
    return this.structureState.currentUserRole();
  }

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=10b981&color=fff`;
  }

  searchControl = new FormControl('');
  showResults = false;
  isProfileOpen = false;
  private destroy$ = new Subject<void>();

  // ✅ toObservable doit être déclaré dans un contexte d'injection (initialiseur de champ ou constructeur)
  private allPages$ = toObservable(this.moduleState.modules).pipe(
    map(modules => {
      const pages: Page[] = [];
      modules.forEach((mod: any) => {
        if (mod.pages) {
          mod.pages.forEach((p: any) => {
            pages.push({ ...p, moduleName: mod.name });
          });
        }
      });
      return pages;
    })
  );

  filteredPages$!: Observable<Page[]>;

  ngOnInit() {
    // 2. Filtrer en fonction de la saisie
    this.filteredPages$ = combineLatest([
      this.allPages$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([pages, searchTerm]) => {
        const term = (searchTerm || '').toLowerCase();
        this.showResults = term.length > 0;
        if (!term) return [];
        return pages.filter(p => p.title.toLowerCase().includes(term));
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEstablishmentSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const val = select.value || null;
    console.log('[Header] Selection changed to:', val);
    this.structureState.setEstablishment(val);
  }

  navigateTo(link: string) {
    this.showResults = false;
    this.searchControl.setValue('');
    this.router.navigateByUrl(link);
  }

  onBlur() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  logout() {
    this.authService.logout();
  }
}