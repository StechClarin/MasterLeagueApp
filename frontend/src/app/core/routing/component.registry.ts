import { Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

import { AppRoutes } from './routes.enum';

export const COMPONENT_REGISTRY: Record<string, () => Promise<any>> = {
  '/users': () => import('@features/profilmanagement/components/user-list/user-list.component').then(m => m.UserListComponent),
  '/roles': () => import('@features/profilmanagement/components/role-list/role-list.component').then(m => m.RoleListComponent),
  '/map-tracking': () => import('@features/map-tracking/map-tracking.component').then(m => m.MapTrackingComponent),
};
