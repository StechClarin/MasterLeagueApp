import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/login/login.component';
import { MainLayoutComponent } from '@layout/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'print/evaluation-planning/:id',
    loadComponent: () => import('./features/evaluations/components/evaluation-planning-print/evaluation-planning-print.component')
      .then(m => m.EvaluationPlanningPrintComponent)
  },
  {
    path: 'print/bulletins',
    loadComponent: () => import('./features/evaluations/components/bulletin-print/bulletin-print.component')
      .then(m => m.BulletinPrintComponent)
  },
  {
    path: 'print/certificate',
    loadComponent: () => import('./features/students/components/certificate-print/certificate-print.component')
      .then(m => m.CertificatePrintComponent)
  },
  {
    path: 'print/idcard',
    loadComponent: () => import('./features/students/components/idcard-print/idcard-print.component')
      .then(m => m.IdcardPrintComponent)
  },
  {
    path: 'print/receipt/:id',
    loadComponent: () => import('@features/finance/components/payment-receipt/payment-receipt.component')
      .then(m => m.PaymentReceiptComponent)
  },
  {
    path: 'print/invoice/:id',
    loadComponent: () => import('@features/finance/components/invoice-receipt/invoice-receipt.component')
      .then(m => m.InvoiceReceiptComponent)
  },

  // --- ZONE PROTÉGÉE (Layout Admin) ---
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
