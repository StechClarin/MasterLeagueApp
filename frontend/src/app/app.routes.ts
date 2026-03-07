import { Routes } from '@angular/router';

// ✅ 1. On utilise les ALIAS pour importer les composants structurels
import { LoginComponent } from '@features/auth/login/login.component';
import { MainLayoutComponent } from '@layout/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard'; // (Sera décommenté plus tard)

export const routes: Routes = [

  // --- ZONE PUBLIQUE ---
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'print/evaluation-planning/:id',
    loadComponent: () => import('./features/evaluations/components/evaluation-planning-print/evaluation-planning-print.component')
      .then(m => m.EvaluationPlanningPrintComponent)
  },

  // --- ZONE PROTÉGÉE (Layout Admin) ---
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Sécurité à venir
    children: [
      // Redirection par défaut
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 1. Dashboard (Lazy Loading de COMPOSANT via alias)
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // 2. Module Profils (Lazy Loading de ROUTES via alias)
      {
        path: 'profils/roles',
        loadChildren: () => import('@features/profilmanagement/profil.routes').then(m => m.PROFIL_ROUTES)
      },
      // 3. Module Structure (Années, Cycles, Classes...)
      {
        path: 'structure',
        loadChildren: () => import('@features/structure/structure.routes').then(m => m.STRUCTURE_ROUTES)
      },

      // 4. Module RH (Personnels, Contrats, Emploi du temps...)
      {
        path: 'hr',
        loadChildren: () => import('@features/hr/hr.routes').then(m => m.HR_ROUTES)
      },
      {
        path: 'grade-entry',
        loadComponent: () => import('@features/evaluations/components/grade-entry-list/grade-entry-list.component').then(m => m.GradeEntryListComponent)
      },
      {
        path: 'grade-entry/:id',
        loadComponent: () => import('@features/evaluations/components/grade-entry/grade-entry.component').then(m => m.GradeEntryComponent)
      },

    ]
  },

  // --- FALLBACK (404) ---
  { path: '**', redirectTo: '' }
];
