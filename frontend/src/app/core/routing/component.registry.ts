import { Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

// On définit ici le lien entre l'URL de la BDD et le fichier Angular
// On utilise des fonctions d'import (Lazy Loading) pour la performance
export const COMPONENT_REGISTRY: Record<string, () => Promise<any>> = {

  // Clé (URL BDD)      // Valeur (Import du Composant Standalone)
  '/users': () => import('../../features/profilmanagement/components/user-list/user-list.component').then(m => m.UserListComponent),
  '/roles': () => import('../../features/profilmanagement/components/role-list/role-list.component').then(m => m.RoleListComponent),
  '/personnes': () => import('../../features/profilmanagement/components/personne-list/personne-list.component').then(m => m.PersonneListComponent),
  '/ecoles': () => import('../../features/profilmanagement/components/ecole-list/ecole-list.component').then(m => m.EcoleListComponent),
  '/products': () => import('../../features/products/components/product-list/product-list.component').then(m => m.ProductListComponent),
  '/voitures': () => import('../../features/profilmanagement/components/voiture-list/voiture-list.component').then(m => m.VoitureListComponent),
  '/evenements': () => import('../../features/profilmanagement/components/evenement-list/evenement-list.component').then(m => m.EvenementListComponent),

  // Ajoute tes futurs modules ici...
};