import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseListComponent } from '@core/abstracts/base-list.component';
import { PaymentService } from '../../services/payment.service';
import { GetPaymentsDocument } from '../../graphql/finance.generated';

import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    UiListPageComponent,
    UiTableComponent,
    UiPaginationComponent,
    UiToolbarComponent
  ],
  template: `
    <app-ui-list-page 
      title="Journal des Encaissements" 
      description="Historique complet des transactions financières."
      [isLoading]="isLoading()" 
      [isEmpty]="(items$ | async)?.length === 0">
      
      <ng-container header-actions>
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Filtrer par facture ou élève...">
          <div class="flex items-center gap-2">
            <input 
              type="date" 
              [formControl]="dateControl"
              class="h-[42px] px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 bg-white" 
            />
            <button 
              (click)="confirmExport('pdf')"
              class="h-[42px] px-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2 whitespace-nowrap">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Imprimer Journal
            </button>
          </div>
        </app-ui-toolbar>
      </ng-container>

      <ng-container table>
        <app-ui-table 
          [columns]="tableColumns" 
          [data]="items$ | async">
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

    <ng-template #studentCell let-item>
       <div class="flex flex-col py-1">
         <span class="font-bold text-slate-900">{{ item.invoice?.student?.firstName }} {{ item.invoice?.student?.lastName }}</span>
         <div class="flex items-center gap-2 mt-0.5">
           <span class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-medium">{{ item.invoice?.student?.matricule || 'N/A' }}</span>
           <span class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{{ item.invoice?.enrollment?.classroom?.name || 'Non Inscrit' }}</span>
         </div>
       </div>
    </ng-template>
  `
})
export class PaymentListComponent extends BaseListComponent<any> implements OnInit, AfterViewInit, OnDestroy {
  service = inject(PaymentService);
  responseKey = 'payments';
  query = GetPaymentsDocument;
  
  searchControl = new FormControl('');
  dateControl = new FormControl('');
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  tableColumns: UiTableColumn[] = [];
  @ViewChild('studentCell') studentCell!: TemplateRef<any>;

  override ngOnInit() {
    super.ngOnInit();
    
    // Sync Search
    this.searchControl.valueChanges.pipe(
        takeUntil(this.destroy$)
    ).subscribe(val => {
        this.filterForm.patchValue({ search: val || '' });
    });

    // Sync Date
    this.dateControl.valueChanges.pipe(
        takeUntil(this.destroy$)
    ).subscribe(val => {
        this.filterForm.patchValue({ paymentDate: val || '' });
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
        { header: 'Date', format: (item) => new Date(item.paymentDate).toLocaleDateString('fr-FR') },
        { header: 'Référence', key: 'reference', className: 'font-mono text-xs font-bold text-indigo-600' },
        { header: 'Élève', template: this.studentCell },
        { header: 'Facture', format: (item) => item.invoice?.title || '-' },
        { header: 'Montant', format: (item) => `${item.amount?.toLocaleString()} FCFA`, className: 'font-bold' },
        { header: 'Mode', key: 'paymentMethod' }
      ];
      this.cdr.detectChanges();
    });
  }

  resetFilters() {
      this.filterForm.reset();
      this.searchControl.setValue('', { emitEvent: false });
      this.dateControl.setValue('', { emitEvent: false });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initFilterForm() {
    return this.fb.group({
      search: [''],
      paymentDate: [''],
      invoiceId: [null]
    });
  }

  override getExportConfig() {
    const d = this.dateControl.value;
    const titleDate = d ? new Date(d).toLocaleDateString('fr-FR') : 'Global';
    return {
      title: `Rapport Journalier des Encaissements - ${titleDate}`,
      columns: [
        { header: 'Date', key: 'paymentDate', format: (val: any) => new Date(val).toLocaleDateString('fr-FR') },
        { header: 'Référence', key: 'reference' },
        { header: 'Élève', key: 'invoice.student', format: (val: any) => val ? `${val.lastName} ${val.firstName} (${val.matricule})` : '-' },
        { header: 'Classe', key: 'invoice.enrollment.classroom.name' },
        { header: 'Facture', key: 'invoice.title' },
        { header: 'Montant (FCFA)', key: 'amount', format: (val: any) => val ? val.toLocaleString() : '0' },
        { header: 'Mode', key: 'paymentMethod' },
        { header: 'Caissier', key: 'createdByUser.username', format: (val: any) => val || 'Système' }
      ]
    };
  }
}
