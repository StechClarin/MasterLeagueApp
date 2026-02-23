import { ApplicationConfig, inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, from } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

import { environment } from '../../../environments/environment';

const uri = environment.graphqlUrl;

export function apolloOptionsFactory(): ApolloClientOptions<any> {
    const httpLink = inject(HttpLink);
    const authService = inject(AuthService);
    const toastService = inject(ToastService);

    // Lien pour gérer les erreurs globales (ex: session expirée)
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path, extensions }) => {
                console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);

                // Si le backend renvoie un code d'erreur d'auth (souvent 'UNAUTHENTICATED' ou 'Unauthorized')
                if (extensions?.['code'] === 'UNAUTHENTICATED' || message.includes('Unauthorized')) {
                    toastService.error('Session expirée ou invalide. Veuillez vous reconnecter.');
                    authService.logout();
                }
            });
        }
        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
            // On peut aussi gérer les 401 ici si le serveur renvoie un code HTTP d'erreur
            if ('status' in networkError && networkError.status === 401) {
                toastService.error('Session expirée. Redirection...');
                authService.logout();
            }
        }
    });

    const http = httpLink.create({ uri });

    return {
        link: from([errorLink, http]),
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'cache-and-network',
                errorPolicy: 'all',
            },
            query: {
                fetchPolicy: 'network-only',
                errorPolicy: 'all',
            },
        }
    };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
    Apollo,
    {
        provide: APOLLO_OPTIONS,
        useFactory: apolloOptionsFactory,
    },
];
