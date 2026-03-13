import { Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

import { AppRoutes } from './routes.enum';

// On définit ici le lien entre l'URL de la BDD et le fichier Angular
// On utilise des fonctions d'import (Lazy Loading) pour la performance
export const COMPONENT_REGISTRY: Record<string, () => Promise<any>> = {

  // Clé (URL BDD)      // Valeur (Import du Composant Standalone)
  '/users': () => import('@features/profilmanagement/components/user-list/user-list.component').then(m => m.UserListComponent),
  '/roles': () => import('@features/profilmanagement/components/role-list/role-list.component').then(m => m.RoleListComponent),
  '/years': () => import('@features/structure/components/academic-year-list/academic-year-list.component').then(m => m.AcademicYearListComponent),
  '/subjects': () => import('@features/structure/components/subject-list/subject-list.component').then(m => m.SubjectListComponent),
  '/classes': () => import('@features/structure/components/classroom-list/classroom-list.component').then(m => m.ClassRoomListComponent),
  '/establishments': () => import('@features/structure/components/establishment-list/establishment-list.component').then(m => m.EstablishmentListComponent),
  '/tree': () => import('@features/structure/components/structure-tree/structure-tree.component').then(m => m.StructureTreeComponent),
  '/students': () => import('@features/students/components/student-list/student-list.component').then(m => m.StudentListComponent),
  '/personnels': () => import('@features/hr/components/personnel-list/personnel-list.component').then(m => m.PersonnelListComponent),
  '/contract-types': () => import('@features/hr/components/contract-type-list/contract-type-list.component').then(m => m.ContractTypeListComponent),
  '/assignments': () => import('@features/pedagogy/components/teaching-assignment-list/teaching-assignment-list.component').then(m => m.TeachingAssignmentListComponent),
  '/academic-periods': () => import('@features/structure/components/academic-period-list/academic-period-list.component').then(m => m.AcademicPeriodListComponent),
  '/evaluation-types': () => import('@features/evaluations/components/evaluation-type-list/evaluation-type-list.component').then(m => m.EvaluationTypeListComponent),
  '/evaluations': () => import('@features/evaluations/components/evaluation-list/evaluation-list.component').then(m => m.EvaluationListComponent),
  '/grade-entry': () => import('@features/evaluations/components/grade-entry-list/grade-entry-list.component').then(m => m.GradeEntryListComponent),
  '/enrollments': () => import('@features/students/components/enrollment-list/enrollment-list.component').then(m => m.EnrollmentListComponent),

  [AppRoutes.PLANNINGS_PEDAGOGIQUES]: () => import('@features/pedagogy/components/planning-list/planning-list.component').then(m => m.PlanningListComponent),
  '/timetable': () => import('@features/students/components/student-timetable/student-timetable.component').then(m => m.StudentTimetableComponent),

  // Finance
  [AppRoutes.CONFIGURATION_TARIFS]: () => import('@features/finance/components/fee-list/fee-list.component').then(m => m.FeeListComponent),
  [AppRoutes.FACTURATION]: () => import('@features/finance/components/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent),
  [AppRoutes.ENCAISSEMENTS]: () => import('@features/finance/components/payment-list/payment-list.component').then(m => m.PaymentListComponent),
  [AppRoutes.ETAT_DE_RECOUVREMENT]: () => import('@features/finance/components/collection-report/collection-report.component').then(m => m.CollectionReportComponent),
};