import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
    {
        path: 'personnels',
        loadComponent: () => import('./components/personnel-list/personnel-list.component').then(m => m.PersonnelListComponent)
    },
    {
        path: 'contract-types',
        loadComponent: () => import('./components/contract-type-list/contract-type-list.component').then(m => m.ContractTypeListComponent)
    },
    {
        path: '',
        redirectTo: 'personnels',
        pathMatch: 'full'
    }
];
