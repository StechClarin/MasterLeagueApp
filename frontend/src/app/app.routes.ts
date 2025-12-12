import { Routes } from '@angular/router';

// ✅ 1. On utilise les ALIAS pour importer les composants structurels
import { LoginComponent } from '@features/auth/login/login.component';
import { MainLayoutComponent } from '@layout/main-layout/main-layout.component';
// import { authGuard } from '@core/guards/auth.guard'; // (Sera décommenté plus tard)

export const routes: Routes = [

  // --- ZONE PUBLIQUE ---
  {
    path: 'login',
    component: LoginComponent
  },

  // --- ZONE PROTÉGÉE (Layout Admin) ---
  {
    path: '',
    component: MainLayoutComponent,
    // canActivate: [authGuard], // Sécurité à venir
    children: [
      // Redirection par défaut
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 1. Dashboard (Lazy Loading de COMPOSANT via alias)
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // 2. Module Products (Lazy Loading de ROUTES via alias)
      {
        path: 'products',
        loadChildren: () => import('@features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },

      // 3. Module Profils (Lazy Loading de ROUTES via alias)
      {
        path: 'profils/roles',
        loadChildren: () => import('@features/profilmanagement/profil.routes').then(m => m.PROFIL_ROUTES)
      },

    ]
  },

  // --- FALLBACK (404) ---
  { path: '**', redirectTo: '' }
];
