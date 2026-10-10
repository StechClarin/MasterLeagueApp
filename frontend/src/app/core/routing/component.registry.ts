import { Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

import { AppRoutes } from './routes.enum';

export const COMPONENT_REGISTRY: Record<string, () => Promise<any>> = {
  [AppRoutes.COMPTES_UTILISATEURS]: () => import('@features/profilmanagement/components/user-list/user-list.component').then(m => m.UserListComponent),
  [AppRoutes.ROLES_AND_PERMISSIONS]: () => import('@features/profilmanagement/components/role-list/role-list.component').then(m => m.RoleListComponent),
  [AppRoutes.CARTE_LIVE]: () => import('@features/map-tracking/map-tracking.component').then(m => m.MapTrackingComponent),
};
