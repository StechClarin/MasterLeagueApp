import { Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

import { AppRoutes } from './routes.enum';

// On définit ici le lien entre l'URL de la BDD et le fichier Angular
// On utilise des fonctions d'import (Lazy Loading) pour la performance
export const COMPONENT_REGISTRY: Record<string, () => Promise<any>> = {

  // Clé (URL BDD)      // Valeur (Import du Composant Standalone)
  '/users': () => import('../../features/profilmanagement/components/user-list/user-list.component').then(m => m.UserListComponent),
  '/roles': () => import('../../features/profilmanagement/components/role-list/role-list.component').then(m => m.RoleListComponent),
  '/years': () => import('../../features/structure/components/academic-year-list/academic-year-list.component').then(m => m.AcademicYearListComponent),
  '/subjects': () => import('../../features/structure/components/subject-list/subject-list.component').then(m => m.SubjectListComponent),
  '/classes': () => import('../../features/structure/components/classroom-list/classroom-list.component').then(m => m.ClassRoomListComponent),
  '/establishments': () => import('../../features/structure/components/establishment-list/establishment-list.component').then(m => m.EstablishmentListComponent),
  '/tree': () => import('../../features/structure/components/structure-tree/structure-tree.component').then(m => m.StructureTreeComponent),
  '/students': () => import('../../features/students/components/student-list/student-list.component').then(m => m.StudentListComponent),
  '/personnels': () => import('../../features/hr/components/personnel-list/personnel-list.component').then(m => m.PersonnelListComponent),
  '/contract-types': () => import('../../features/hr/components/contract-type-list/contract-type-list.component').then(m => m.ContractTypeListComponent),
  '/assignments': () => import('../../features/pedagogy/components/teaching-assignment-list/teaching-assignment-list.component').then(m => m.TeachingAssignmentListComponent),

  [AppRoutes.PLANNINGS]: () => import('../../features/pedagogy/components/planning-list/planning-list.component').then(m => m.PlanningListComponent),
};