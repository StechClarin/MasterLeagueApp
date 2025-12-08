import { Injectable } from '@angular/core';
import { gql } from 'apollo-angular';
import { DocumentNode } from 'graphql';

@Injectable({
    providedIn: 'root'
})
export class QueryBuilderService {

    /**
     * Construit une requête GraphQL dynamique
     * @param entityName Nom de l'entité (ex: 'users', 'role')
     * @param fields Liste des champs à récupérer (ex: 'id name permissions { id }')
     * @param filters Objet contenant les filtres (ex: { username: 'toto', page: 1 })
     * @param isSingle Indique si on attend un résultat unique (ex: getById) ou une liste
     */
    buildQuery(entityName: string, fields: string, filters: any = {}, isSingle: boolean = false): DocumentNode {
        const keys = Object.keys(filters);

        // 1. Définitions des variables ($nom: Type)
        const varDefinitions = keys.map(key => {
            const value = filters[key];
            const type = this.inferType(key, value);
            return `$${key}: ${type}`;
        }).join(', ');

        // 2. Arguments de la requête (nom: $nom)
        const args = keys.map(key => `${key}: $${key}`).join(', ');

        // 3. Construction de la chaîne
        // Si varDefinitions est vide, on ne met pas de parenthèses
        const queryVars = varDefinitions ? `(${varDefinitions})` : '';
        const queryArgs = args ? `(${args})` : '';

        const queryStr = `
      query ${entityName}${queryVars} {
        ${entityName}${queryArgs} {
          ${fields}
        }
      }
    `;

        console.log(`[QueryBuilder] Generated for ${entityName}:`, queryStr);
        return gql(queryStr);
    }

    /**
     * Tente de deviner le type GraphQL à partir de la valeur JS
     */
    private inferType(key: string, value: any): string {
        // Cas spécifiques connus (convention de nommage)
        if (key === 'id') return 'ID!';
        if (key === 'page' || key === 'pageSize') return 'Int';

        // Inférence basique
        if (typeof value === 'number') return 'Int';
        if (typeof value === 'boolean') return 'Boolean';

        // Par défaut String (couvre la plupart des filtres de recherche)
        return 'String';
    }
}
