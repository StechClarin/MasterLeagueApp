import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // HEURE DE VERITE (v6.0) : On récupère le token de Handshake injecté par Django
  const hubHandshakeToken = document
    .querySelector<HTMLMetaElement>('meta[name="ether-session-token"]')
    ?.content
    ?.trim() ?? '';

  let headers = req.headers;
  if (hubHandshakeToken) {
    headers = headers.set('X-Hub-Session-Token', hubHandshakeToken);
  }

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const clonedRequest = req.clone({
    headers,
    withCredentials: true // Fondamental pour le passage des sessions en Iframe
  });

  return next(clonedRequest);
};