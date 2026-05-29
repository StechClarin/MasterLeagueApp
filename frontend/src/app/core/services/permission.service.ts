import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  // Signal pour stocker la liste des codenames de permissions actives
  readonly activePermissions = signal<string[]>([]);

  setPermissions(permissions: string[]) {
    console.log('[PermissionService] Active permissions updated:', permissions);
    this.activePermissions.set(permissions);
  }

  hasPermission(codename: string): boolean {
    if (this.isSuperAdmin()) {
      return true; // Le super-admin ethernanos possède tous les droits d'accès
    }
    return this.activePermissions().includes(codename);
  }

  private isSuperAdmin(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.is_superuser !== undefined) {
          return payload.is_superuser;
      }
      return payload.username ? payload.username.toLowerCase() === 'ethernanos' : false;
    } catch (e) {
      return false;
    }
  }
}
