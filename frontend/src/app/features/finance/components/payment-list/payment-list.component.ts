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
        <app-ui-toolbar [searchControl]="searchControl" placeholder="Filtrer par facture ou élève..."></app-ui-toolbar>
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initFilterForm() {
    return this.fb.group({
      search: [''],
      invoiceId: [null]
    });
  }
}
