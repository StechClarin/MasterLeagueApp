import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // HEURE DE VERITE (v6.0) : On injecte le Token de Handshake du Hub
  // Dans une installation industrielle, on le récupèrerait dynamiquement.
  const hubHandshakeToken = 'ethernanos-hub-secret-2026';

  let headers = req.headers.set('X-Hub-Session-Token', hubHandshakeToken);

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const clonedRequest = req.clone({
    headers,
    withCredentials: true // Fondamental pour le passage des sessions en Iframe
  });

  return next(clonedRequest);
};