import { Routes } from '@angular/router';
import { RoleFormComponent } from './components/role-form/role-form.component';
import { RoleListComponent } from './components/role-list/role-list.component';

export const PROFIL_ROUTES: Routes = [
  { path: 'roles', component: RoleListComponent },
  { path: 'roles/new', component: RoleFormComponent },
  { path: 'roles/edit/:id', component: RoleFormComponent },
];
