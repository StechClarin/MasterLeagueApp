import { Routes } from '@angular/router';

export const STRUCTURE_ROUTES: Routes = [
    {
        path: 'establishments',
        loadComponent: () => import('./components/establishment-list/establishment-list.component')
            .then(m => m.EstablishmentListComponent),
        data: { title: 'Établissements' }
    },
    {
        path: 'years',
        loadComponent: () => import('./components/academic-year-list/academic-year-list.component')
            .then(m => m.AcademicYearListComponent),
        data: { title: 'Années Scolaires' }
    },
    {
        path: 'periods',
        loadComponent: () => import('./components/academic-period-list/academic-period-list.component')
            .then(m => m.AcademicPeriodListComponent),
        data: { title: 'Périodes Académiques' }
    },
    {
        path: 'subjects',
        loadComponent: () => import('./components/subject-list/subject-list.component')
            .then(m => m.SubjectListComponent),
        data: { title: 'Matières' }
    },
    {
        path: 'classes',
        loadComponent: () => import('./components/classroom-list/classroom-list.component')
            .then(m => m.ClassRoomListComponent),
        data: { title: 'Classes' }
    },
    {
        path: 'tree',
        loadComponent: () => import('./components/structure-tree/structure-tree.component')
            .then(m => m.StructureTreeComponent),
        data: { title: 'Cycles & Niveaux' }
    }
];
