import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { GetInvoicesDocument, GetUsedFeeCategoriesDocument } from '../../graphql/finance.generated';
import { Apollo } from 'apollo-angular';

import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { ClassRoomService } from '@features/structure/services/classroom.service';

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
    UiToolbarComponent,
    UiSelectComponent
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

      <div filters class="flex flex-col gap-4">
        <!-- Barre de filtres par catégorie -->
        <div class="px-6 py-3 border-b border-slate-100 bg-white overflow-x-auto rounded-xl shadow-sm">
          <div class="flex items-center gap-2 min-w-max">
             <button 
               (click)="setCategory(null)"
               [class]="!filterForm.value.search ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'"
               class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-transparent flex items-center gap-2">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
               Tout
             </button>
             <button 
               *ngFor="let cat of dynamicCategories"
               (click)="setCategory(cat.value)"
               [class]="filterForm.value.search === cat.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50'"
               class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-slate-100 flex items-center gap-2">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="cat.svg"></svg>
               {{ cat.label }}
             </button>
          </div>
        </div>

        <!-- Autres filtres -->
        <div [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
           <app-ui-select 
              label="Filtrer par Classe" 
              formControlName="classroomId" 
              [options]="classroomOptions"
              placeholder="Toutes les classes">
           </app-ui-select>
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
  searchControl = new FormControl<string | null>('');
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private classroomService = inject(ClassRoomService);

  dynamicCategories: any[] = [];
  classroomOptions: any[] = [];

  categoryIcons: any = {
    'REGISTRATION': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
    'TUITION': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>',
    'CANTEEN': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>',
    'TRANSPORT': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>',
    'OTHER': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>'
  };

  @ViewChild('statusCell') statusCell!: TemplateRef<any>;
  @ViewChild('studentCell') studentCell!: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  override ngOnInit() {
    super.ngOnInit();
    this.loadUsedCategories();
    this.loadClassrooms();
    
    // Sync Search
    this.searchControl.valueChanges.pipe(
        takeUntil(this.destroy$)
    ).subscribe((val: string | null) => {
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

  override initFilterForm() {
    return this.fb.group({
      search: [''],
      studentId: [null],
      status: [null],
      category: [null],
      classroomId: [null]
    });
  }

  loadClassrooms() {
    this.classroomService.list().subscribe(classrooms => {
      this.classroomOptions = classrooms.map((c: any) => ({
        label: c.name,
        value: c.id
      }));
      this.cdr.detectChanges();
    });
  }

  loadUsedCategories() {
    this.apollo.query<any>({
      query: GetUsedFeeCategoriesDocument
    }).subscribe(res => {
      const data = res.data?.usedFeeCategories || [];
      this.dynamicCategories = data.map((item: any) => {
        const parsed = typeof item === 'string' ? JSON.parse(item) : item;
        return {
          label: parsed.label,
          value: parsed.value,
          svg: this.categoryIcons[parsed.category] || this.categoryIcons['OTHER']
        };
      });
      this.cdr.detectChanges();
    });
  }

  setCategory(val: string | null) {
    this.searchControl.setValue(val);
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
