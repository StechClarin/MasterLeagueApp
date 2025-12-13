import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { Observable } from 'rxjs';
import { DynamicRouterService } from '@core/routing/dynamic-router.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent],
  styles: [`
    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes meteor {
      0% { transform: rotate(215deg) translateX(0); opacity: 1; }
      70% { opacity: 1; }
      100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
    }
    .star {
      position: absolute;
      background: white;
      /* 5-pointed star shape */
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
      animation: twinkle 3s infinite ease-in-out;
    }
    .meteor {
      position: absolute;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      animation: meteor linear infinite;
      z-index: 1;
    }
    /* White Comet */
    .meteor.white {
      background: linear-gradient(to left, #ffffff, rgba(255,255,255,0));
      box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.4);
    }
    .meteor.white::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 1px;
      background: linear-gradient(to right, #ffffff, rgba(255,255,255,0));
      transform: translateX(-50%);
    }
    /* Purple Comet */
    .meteor.purple {
      background: linear-gradient(to left, #a855f7, rgba(168, 85, 247, 0)); /* Purple-500 */
      box-shadow: 0 0 10px 2px rgba(168, 85, 247, 0.4);
    }
    .meteor.purple::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 1px;
      background: linear-gradient(to right, #a855f7, rgba(168, 85, 247, 0));
      transform: translateX(-50%);
    }
    /* Staggered Entrance Animation */
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    /* Floating Icons Animation - Smoother Entry */
    @keyframes travel {
        0% { left: -10%; opacity: 0; }
        20% { opacity: 1; } /* Slower fade in */
        80% { opacity: 1; }
        100% { left: 110%; opacity: 0; }
    }
    .floating-icon {
        position: absolute;
        width: 35px;
        height: 35px;
        color: rgba(168, 85, 247, 0.6); /* Purple-500 with higher opacity */
        animation: travel linear infinite;
        filter: drop-shadow(0 0 5px rgba(168, 85, 247, 0.5));
    }
    /* Tail for floating icons */
    .floating-icon::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 100%; /* Tail behind (left side) */
        width: 60px;
        height: 2px;
        background: linear-gradient(to left, rgba(168, 85, 247, 0.5), transparent);
        transform: translateY(-50%);
    }
    .animate-enter {
        opacity: 0; /* Start hidden */
        animation: fadeInUp 0.6s ease-out forwards;
    }
  `],
  template: `
    <div class="min-h-screen flex bg-[#0f172a] font-sans relative overflow-hidden">
      
      <!-- Space Background Animation Layer (Z-0) -->
      <div class="absolute inset-0 z-0 overflow-hidden">
        <!-- Stars -->
        <div *ngFor="let star of stars" class="star" [ngStyle]="star.style"></div>
        <!-- Meteors -->
        <div *ngFor="let meteor of meteors" class="meteor" [ngClass]="meteor.class" [ngStyle]="meteor.style"></div>
        
        <!-- Floating Management Icons -->
        <div *ngFor="let icon of floatingIcons" class="icon-wrapper" [ngStyle]="icon.wrapperStyle">
            <svg class="floating-icon" [ngStyle]="icon.iconStyle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="icon.path"></path>
            </svg>
        </div>
      </div>

      <!-- Left Column: Form (Z-10, Semi-transparent) -->
      <div class="w-full lg:w-1/2 xl:w-1/3 p-8 flex flex-col justify-between relative z-10 border-r border-slate-800/50 bg-[#0f172a]/60 backdrop-blur-md">
        
        <!-- Logo -->
        <div class="flex items-center gap-3 animate-enter" style="animation-delay: 0ms;">
          <div class="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner border border-white/10">
            <span class="text-white font-bold text-xl">G</span>
          </div>
          <span class="text-xl font-bold text-white tracking-tight">GigaCore</span>
        </div>

        <!-- Form Container -->
        <div class="w-full max-w-sm mx-auto">
          <div class="mb-8 animate-enter" style="animation-delay: 100ms;">
            <h2 class="text-3xl font-bold text-white mb-2">Bon retour !</h2>
            <p class="text-slate-400">Veuillez saisir vos identifiants pour continuer.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
            
            <div class="animate-enter" style="animation-delay: 200ms;">
                <app-ui-input
                label="Nom d'utilisateur"
                [control]="form.controls.username"
                [required]="true"
                placeholder="Votre identifiant"
                theme="dark"
                ></app-ui-input>
            </div>

            <div class="animate-enter" style="animation-delay: 300ms;">
                <app-ui-input
                label="Mot de passe"
                type="password"
                [control]="form.controls.password"
                [required]="true"
                placeholder="Votre mot de passe"
                theme="dark"
                ></app-ui-input>
            </div>

            <div class="flex items-center justify-between animate-enter" style="animation-delay: 400ms;">
              <div class="flex items-center">
                <input id="remember-me" type="checkbox" class="h-4 w-4 bg-slate-800 border-slate-700 rounded text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900">
                <label for="remember-me" class="ml-2 block text-sm text-slate-400">Se souvenir de moi</label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Mot de passe oublié ?</a>
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="form.invalid || isSubmitting"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 animate-enter"
              style="animation-delay: 500ms;"
            >
              <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Connexion en cours...' : 'Se connecter' }}
            </button>

          </form>

          <p *ngIf="errorMessage" class="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center animate-enter" style="animation-delay: 600ms;">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Footer -->
        <div class="text-xs text-slate-600 font-medium animate-enter" style="animation-delay: 700ms;">
          Developed by <span class="text-slate-500 hover:text-indigo-400 transition-colors cursor-default">ethernanos</span>
        </div>

      </div>

      <!-- Right Column: Decorative (Transparent Background) -->
      <div class="hidden lg:block lg:w-1/2 xl:w-2/3 relative overflow-hidden z-10">
        <!-- Background Gradients -->
        <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <!-- Content -->
        <div class="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <div class="relative mb-8">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-20 rounded-full"></div>
            <img src="assets/images/login-illustration.svg" alt="" class="relative w-96 h-auto opacity-90 drop-shadow-2xl" onerror="this.style.display='none'">
          </div>
          <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Bienvenue sur <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">GigaCore</span></h1>
          <p class="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
            La plateforme de gestion unifiée pour piloter votre activité avec élégance et performance.
          </p>
        </div>
      </div>

    </div>
  `
})
export class LoginComponent extends BaseFormComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private dynamicRouter = inject(DynamicRouterService);

  // Typage strict du formulaire
  override form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  // Génération des étoiles et météores
  stars = Array(100).fill(0).map(() => ({
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      opacity: 0.7 + Math.random() * 0.3,
      width: `${Math.random() * 6 + 4}px`, // Plus grand pour voir la forme (4px à 10px)
      height: `${Math.random() * 6 + 4}px`
    }
  }));

  meteors = Array(12).fill(0).map(() => ({
    class: Math.random() > 0.5 ? 'white' : 'purple', // 50% chance white/purple
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 2 + 2}s`
    }
  }));

  // Icônes de gestion flottantes
  private iconPaths = {
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    print: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
    pdf: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    excel: 'M3 3h18v18H3V3zm5 5h8v2H8V8zm0 4h8v2H8v-2zm0 4h8v2H8v-2z' // Simplified table icon
  };

  floatingIcons: any[] = [];

  override ngOnInit() {
    super.ngOnInit();
    this.floatingIcons = Array(40).fill(0).map(() => {
      const icons = Object.keys(this.iconPaths);
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      return {
        path: this.iconPaths[randomIcon as keyof typeof this.iconPaths],
        wrapperStyle: {
          transform: `rotate(${Math.random() * 360}deg) translateY(${Math.random() * 100 - 50}vh)`
        },
        iconStyle: {
          animationDelay: `${Math.random() * 10}s`, // Reduced delay (0-5s)
          animationDuration: `${Math.random() * 10 + 10}s`, // Faster (5-15s)
          opacity: 0.4 + Math.random() * 0.4 // More visible (0.4-0.8)
        }
      };
    });
  }

  // Implémentation de save() pour BaseFormComponent
  save(): Observable<any> {
    const { username, password } = this.form.getRawValue();
    return this.auth.login({ username, password });
  }

  // Surcharge de submit pour gérer la redirection après succès
  override submit() {
    // On s'abonne à l'événement success émis par BaseFormComponent
    this.success.subscribe(async () => {
      // 1. Recharger les routes dynamiques maintenant qu'on est authentifié
      await this.dynamicRouter.loadDynamicRoutes();
      // 2. Rediriger
      this.router.navigate(['/dashboard']);
    });
    super.submit();
  }
}