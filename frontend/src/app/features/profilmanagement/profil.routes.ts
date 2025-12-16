import { Routes } from '@angular/router';

export const PROFIL_ROUTES: Routes = [
  {
    path: 'roles',
    loadComponent: () => import('./components/role-list/role-list.component').then(m => m.RoleListComponent)
  },

];
