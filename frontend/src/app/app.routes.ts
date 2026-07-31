import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/login/login.component';
import { MainLayoutComponent } from '@layout/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'map-tracking',
        loadComponent: () => import('@features/map-tracking/map-tracking.component').then(m => m.MapTrackingComponent)
      },
      {
        path: 'profils/roles',
        loadChildren: () => import('@features/profilmanagement/profil.routes').then(m => m.PROFIL_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
