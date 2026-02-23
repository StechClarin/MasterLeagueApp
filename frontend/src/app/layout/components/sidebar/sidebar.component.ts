import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GET_SIDEBAR_MODULES } from './sidebar.queries';

// Interface locale pour typer les données
interface SidebarPage {
  id: string;
  title: string;
  link: string;
  icon: string;
}

interface SidebarModule {
  id: string;
  name: string;
  icon: string;
  pages: SidebarPage[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-72 h-screen bg-[#0f172a] flex flex-col fixed left-0 top-0 z-50 shadow-2xl font-sans border-r border-slate-800/50">
      
      <!-- Logo Section with Glow -->
      <div class="h-20 flex items-center px-8 border-b border-slate-800/50 bg-[#0f172a] relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
        
        <div class="relative flex items-center gap-4 group cursor-pointer">
          <div class="relative">
            <div class="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div class="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner border border-white/10">
              <span class="text-white font-bold text-xl">G</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all duration-300">
              GigaCore
            </span>
            <span class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Panel</span>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-8 px-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
          <div class="relative">
            <div class="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <span class="text-slate-500 text-xs font-medium tracking-wide animate-pulse">CHARGEMENT...</span>
        </div>

        <div *ngFor="let module of modules$ | async" class="mb-2">
          
          <button 
            (click)="toggleModule(module.id)"
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 group focus:outline-none border border-transparent hover:border-white/5">
            
            <div class="flex items-center gap-4">
              <span class="p-2 rounded-lg bg-slate-800/50 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all duration-300">
                 <!-- Icone générique si pas d'icone spécifique -->
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </span>
              <span class="text-sm font-semibold tracking-wide">{{ module.name }}</span>
            </div>

            <div class="relative">
              <div class="absolute inset-0 bg-indigo-500 blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
              <svg 
                [class.rotate-180]="isExpanded(module.id)"
                class="w-4 h-4 transition-transform duration-300 text-slate-500 group-hover:text-white relative z-10" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>

          <div 
            *ngIf="isExpanded(module.id)"
            class="mt-2 space-y-1 pl-4 relative">
            
            <!-- Ligne guide verticale -->
            <div class="absolute left-8 top-0 bottom-0 w-px bg-slate-800/50"></div>

            <a *ngFor="let page of module.pages"
               [routerLink]="page.link" 
               routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
               [routerLinkActiveOptions]="{exact: false}"
               class="flex items-center px-4 py-2.5 text-sm text-slate-400 rounded-xl hover:text-white hover:bg-white/5 transition-all duration-200 relative group/page ml-4 overflow-hidden">
              
              <!-- Effet de fond au survol -->
              <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/0 to-indigo-600/0 group-hover/page:from-indigo-600/10 group-hover/page:to-transparent transition-all duration-300"></div>

              <span class="mr-3 relative z-10">
                 <svg class="w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover/page:opacity-100 group-hover/page:scale-125 transition-all duration-300" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"/></svg>
              </span>

              <span class="font-medium relative z-10">{{ page.title }}</span>
              
              <!-- Indicateur actif -->
              <div class="absolute right-2 w-1.5 h-1.5 rounded-full bg-white opacity-0 transition-opacity duration-200" routerLinkActive="opacity-100"></div>
            </a>
          </div>

        </div>
      </nav>

      <!-- User Profile Section -->
      <div class="p-4 border-t border-slate-800/50 bg-[#0f172a]">
        <button class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 group border border-transparent hover:border-white/5">
          <div class="relative">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-300"></div>
            <div class="relative h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white font-bold border border-slate-700 group-hover:border-transparent">
              <img src="https://ui-avatars.com/api/?name=Ether+Nanos&background=6366f1&color=fff" alt="Profile" class="rounded-full">
            </div>
            <div class="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-[#0f172a] rounded-full"></div>
          </div>
          <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">EtherNanos</p>
            <p class="text-xs text-slate-500 truncate group-hover:text-slate-400">Super Admin</p>
          </div>
          <svg class="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  private apollo = inject(Apollo);

  modules$!: Observable<SidebarModule[]>;
  loading = true;
  expandedModules: Record<string, boolean> = {};

  private router = inject(Router);

  ngOnInit() {
    this.modules$ = this.apollo.watchQuery<any>({
      query: GET_SIDEBAR_MODULES,
      fetchPolicy: 'cache-and-network' // Feedback immédiat + refresh auto
    }).valueChanges.pipe(
      tap(() => this.loading = false),
      map(result => {
        const modules = result.data.modules;

        // Auto-expand module based on current route
        if (modules) {
          const currentUrl = this.router.url;
          modules.forEach((module: SidebarModule) => {
            if (module.pages.some(page => currentUrl.includes(page.link))) {
              this.expandedModules[module.id] = true;
            }
          });
        }

        return modules;
      })
    );
  }

  toggleModule(moduleId: string) {
    this.expandedModules[moduleId] = !this.expandedModules[moduleId];
  }

  isExpanded(moduleId: string): boolean {
    return !!this.expandedModules[moduleId];
  }
}