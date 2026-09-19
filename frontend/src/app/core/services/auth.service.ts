import { Injectable, inject, signal, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { environment } from '../../../environments/environment';
import { PermissionService } from './permission.service';

// Interface pour la réponse Django
interface AuthResponse {
  access: string;
  refresh: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl; // ex: http://127.0.0.1:8000/api
  private permissionService = inject(PermissionService);

  // Signal pour savoir si on est connecté
  currentUserSignal = signal(this.hasToken());

  // --- LOGIN ---
  login(credentials: { username: string, password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap(response => {
        // 1. On stocke les tokens
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        // 2. On met à jour le signal
        this.currentUserSignal.set(true);
      })
    );
  }

  // --- LOGOUT ---
  private injector = inject(Injector);

  logout() {
    // 1. Vide localStorage et sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Supprime tous les cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + window.location.hostname;
    }

    // 3. Vide le cache CacheStorage
    if (window.caches) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      }).catch(() => {});
    }

    this.currentUserSignal.set(false);

    // On récupère Apollo et ModuleStateService via l'injecteur pour éviter une dépendance circulaire
    const apollo = this.injector.get(Apollo);
    apollo.client.resetStore().catch(() => {});

    try {
      const { ModuleStateService } = require('./module-state.service');
      const moduleState = this.injector.get(ModuleStateService);
      moduleState.clear();
    } catch (e) {}

    this.permissionService.setPermissions([]);

    this.router.navigate(['/login']);
  }

  // --- UTILITAIRES ---
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (e) {
      return true;
    }
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || null;
    } catch (e) {
      return null;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch (e) {
      return null;
    }
  }

  isSuperAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Vérifie si le backend a renvoyé is_superuser
      if (payload.is_superuser !== undefined) {
          return payload.is_superuser;
      }
      // Fallback sur le nom d'utilisateur ethernanos par sécurité
      return payload.username ? payload.username.toLowerCase() === 'ethernanos' : false;
    } catch (e) {
      return false;
    }
  }

  private hasToken(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }
}