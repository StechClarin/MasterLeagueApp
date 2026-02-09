import { ApplicationConfig, inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { environment } from '../../../environments/environment';

const uri = environment.graphqlUrl; // URL dynamique selon l'environnement

export function apolloOptionsFactory(): ApolloClientOptions<any> {
    const httpLink = inject(HttpLink);
    return {
        link: httpLink.create({ uri }),
        cache: new InMemoryCache(), // Le fameux cache qui évite les requêtes inutiles
    };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
    Apollo,
    {
        provide: APOLLO_OPTIONS,
        useFactory: apolloOptionsFactory,
    },
];
