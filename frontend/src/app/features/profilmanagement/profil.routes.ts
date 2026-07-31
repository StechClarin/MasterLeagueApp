import { Routes } from '@angular/router';

export const PROFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/role-list/role-list.component').then(m => m.RoleListComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./components/role-list/role-list.component').then(m => m.RoleListComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-list/user-list.component').then(m => m.UserListComponent)
  }
];
