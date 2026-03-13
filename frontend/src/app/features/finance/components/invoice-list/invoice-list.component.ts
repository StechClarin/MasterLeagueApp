import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { GetInvoicesDocument } from '../../graphql/finance.generated';

import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    PaymentFormComponent,
    UiListPageComponent,
    UiTableComponent,
    UiPaginationComponent,
    UiModalComponent,
    UiToolbarComponent
  ],
  template: `
    <app-ui-list-page 
      title="Gestion des Factures" 
      description="Suivez les paiements et factures des élèves."
      [isLoading]="isLoading()" 
      [isEmpty]="(items$ | async)?.length === 0">
      
      <ng-container header-actions>
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher (Réf, Matricule, Libellé, Élève)..."></app-ui-toolbar>
      </ng-container>

      <div class="px-6 py-3 border-b border-slate-100 bg-white overflow-x-auto">
        <div class="flex items-center gap-2 min-w-max">
           <button 
             (click)="setCategory(null)"
             [class]="!filterForm.value.category ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
             class="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border border-transparent">
             Tout
           </button>
           <button 
             *ngFor="let cat of categories"
             (click)="setCategory(cat.value)"
             [class]="filterForm.value.category === cat.value ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
             class="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border border-transparent flex items-center gap-2">
             <span class="opacity-70">{{ cat.icon }}</span>
             {{ cat.label }}
           </button>
        </div>
      </div>

      <ng-container table>
        <app-ui-table 
          [columns]="tableColumns" 
          [data]="items$ | async" 
          [actionsTemplate]="actionsCell">
        </app-ui-table>
      </ng-container>

      <ng-container pagination>
        <app-ui-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalCount]="totalCount()"
          [numPages]="numPages()"
          (prev)="prevPage()"
          (next)="nextPage()"
          (goTo)="goToPage($event)">
        </app-ui-pagination>
      </ng-container>
    </app-ui-list-page>

    <app-ui-modal [isOpen]="isModalOpen()" (close)="closeModal()" [title]="'Encaissement'">
       <app-payment-form
         *ngIf="isModalOpen()"
         [item]="selectedItem()"
         (cancel)="closeModal()"
         (success)="onSave()">
       </app-payment-form>
    </app-ui-modal>

    <!-- Templates for Table Cells -->
    <ng-template #statusCell let-item>
       <span [class]="getStatusClass(item.status)">
         {{ getStatusLabel(item.status) }}
       </span>
    </ng-template>

    <ng-template #studentCell let-item>
       <div class="flex flex-col py-1">
         <span class="font-bold text-slate-900">{{ item.student?.firstName }} {{ item.student?.lastName }}</span>
         <div class="flex items-center gap-2 mt-0.5">
           <span class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-medium">{{ item.student?.matricule || 'N/A' }}</span>
           <span class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{{ item.enrollment?.classroom?.name || 'Non Inscrit' }}</span>
         </div>
       </div>
    </ng-template>

    <ng-template #actionsCell let-item>
       <div class="flex justify-end gap-2">
          <button *ngIf="item.status !== 'PAID'" 
                  class="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-green-200" 
                  (click)="openPaymentModal(item)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Encaisser
          </button>
       </div>
    </ng-template>
  `
})
export class InvoiceListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit, OnDestroy {
  service = inject(InvoiceService);
  responseKey = 'invoices';
  query = GetInvoicesDocument;
  
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  categories = [
    { label: "Frais d'Inscription", value: 'REGISTRATION', icon: '📝' },
    { label: 'Scolarité', value: 'TUITION', icon: '🎓' },
    { label: 'Cantine', value: 'CANTEEN', icon: '🍽️' },
    { label: 'Transport', value: 'TRANSPORT', icon: '🚌' },
    { label: 'Autre', value: 'OTHER', icon: '✨' }
  ];

  @ViewChild('statusCell') statusCell!: TemplateRef<any>;
  @ViewChild('studentCell') studentCell!: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  override ngOnInit() {
    super.ngOnInit();
    
    // Sync Search
    this.searchControl.valueChanges.pipe(
        takeUntil(this.destroy$)
    ).subscribe(val => {
        this.filterForm.patchValue({ search: val || '' });
    });

    // Auto-refresh on filter change
    this.filterForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
    ).subscribe(() => {
        this.currentPage.set(1);
        this.refresh();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Référence', key: 'reference', className: 'font-mono text-xs font-bold' },
        { header: 'Libellé', key: 'title' },
        { header: 'Élève', template: this.studentCell },
        { header: 'Total', format: (item) => `${item.totalAmount?.toLocaleString()} FCFA` },
        { header: 'Payé', format: (item) => `${item.paidAmount?.toLocaleString()} FCFA` },
        { header: 'Reste', format: (item) => `${item.remainingAmount?.toLocaleString()} FCFA`, className: 'font-bold text-red-600' },
        { header: 'Statut', template: this.statusCell }
      ];
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initFilterForm() {
    return this.fb.group({
      search: [''],
      studentId: [null],
      status: [null],
      category: [null]
    });
  }

  setCategory(category: string | null) {
    this.filterForm.patchValue({ category });
  }

  openPaymentModal(invoice: any) {
    this.openModal(invoice, 'create');
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'UNPAID': 'Impayé',
      'PARTIAL': 'Partiel',
      'PAID': 'Payé',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const base = 'px-2.5 py-1 rounded-full text-xs font-bold border ';
    const classes: any = {
      'UNPAID': base + 'bg-red-50 text-red-700 border-red-100',
      'PARTIAL': base + 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'PAID': base + 'bg-green-50 text-green-700 border-green-100',
      'CANCELLED': base + 'bg-gray-50 text-gray-700 border-gray-100'
    };
    return classes[status] || base + 'bg-gray-50 text-gray-400 border-gray-100';
  }
}
