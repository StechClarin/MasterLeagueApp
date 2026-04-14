import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore, provideState } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { UserFeature } from './features/profilmanagement/store/user/user.store';
import { DynamicRouterService } from './core/routing/dynamic-router.service';
import { routes } from './app.routes';
import { graphqlProvider } from './core/providers/graphql.provider';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { graphqlNameInterceptor } from './core/interceptors/graphql-name.interceptor';
import { establishmentInterceptor } from './core/interceptors/establishment.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export function initializeRoutes(dynamicRouter: DynamicRouterService) {
  return () => dynamicRouter.loadDynamicRoutes();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(), // Required for Toast animations

    // HTTP Client with Interceptors
    provideHttpClient(withInterceptors([
      authInterceptor,      // 1. Token
      establishmentInterceptor, // 2. Establishment Context
      graphqlNameInterceptor, // 3. URL renaming
      errorInterceptor      // 4. Global Error Handling ...
    ])),

    {
      provide: APP_INITIALIZER,
      useFactory: initializeRoutes,
      deps: [DynamicRouterService],
      multi: true
    },

    // Apollo
    graphqlProvider,

    // NgRx
    provideStore(),
    provideState(UserFeature),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};