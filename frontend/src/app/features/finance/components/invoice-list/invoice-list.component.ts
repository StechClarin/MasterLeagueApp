import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
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
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
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
    UiSelectComponent,
    UiFilterPanelComponent,
    UiExportModalComponent
  ],
  template: `
    <app-ui-list-page 
      title="Gestion des Factures" 
      description="Suivez les paiements et factures des élèves."
      [isLoading]="isLoading()" 
      [isEmpty]="(items$ | async)?.length === 0">
      
      <ng-container header-actions>
        <div class="flex items-center gap-3">
           <app-ui-toolbar [searchControl]="searchControl" placeholder="Rechercher (Réf, Matricule)..."></app-ui-toolbar>
           <button (click)="openExportModal()"
              class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm flex items-center font-medium text-sm">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter
           </button>
        </div>
      </ng-container>

      <div filters class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <!-- Barre de filtres par catégorie -->
            <div class="flex items-center gap-2 overflow-x-auto min-w-max">
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
                 [class]="filterForm.value.search === cat.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-100'"
                 class="px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="cat.svg"></svg>
                 {{ cat.label }}
               </button>
            </div>
            
            <button (click)="toggleFilters()"
              class="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center font-medium text-sm group shrink-0">
              <svg class="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres Avancés
            </button>
        </div>

        <app-ui-filter-panel [isOpen]="isFiltersOpen()" [form]="filterForm" (reset)="resetFilters()">
           <div [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
              <!-- Filter: Class -->
              <div class="space-y-1.5 md:col-span-2">
                <label for="filter-class" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Classe</label>
                <div class="relative">
                   <select id="filter-class" formControlName="classroomId"
                    class="block w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                    <option [ngValue]="null">Toutes les classes</option>
                    <option *ngFor="let c of classroomOptions" [value]="c.value">{{ c.label }}</option>
                  </select>
                </div>
              </div>

              <!-- Filter: Seuil d'exclusion -->
              <div class="space-y-1.5 md:col-span-2">
                <label for="filter-amount" class="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Insolvables (Paiement inférieur à)</label>
                <input type="number" id="filter-amount" formControlName="maxPaidAmount" placeholder="Ex: 50000"
                  class="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-red-600 font-bold">
              </div>
           </div>
        </app-ui-filter-panel>
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

    <!-- Export Modal -->
    <app-ui-export-modal [isOpen]="showExportModal()" [isExporting]="isExporting()" (close)="closeExportModal()"
      (confirm)="confirmExport($event)">
    </app-ui-export-modal>

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
                  (click)="openPaymentModal(item)"
                  title="Encaisser un paiement">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Encaisser
          </button>
          
          <button *ngIf="item.paidAmount > 0" 
                  class="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-indigo-200" 
                  (click)="printInvoice(item)"
                  title="Imprimer le reçu/relevé">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimer
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
  router = inject(Router);

  isFiltersOpen = signal(false);

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
      classroomId: [null],
      maxPaidAmount: [null]
    });
  }

  toggleFilters() {
    this.isFiltersOpen.update((v: boolean) => !v);
  }

  resetFilters() {
    this.filterForm.reset();
    this.searchControl.setValue('');
  }

  protected override getExportConfig() {
      return {
          title: 'Liste des Factures / Insolvables',
          columns: [
              { header: 'Référence', key: 'reference' },
              { header: 'Libellé', key: 'title' },
              { header: 'Élève', key: 'student', format: (s: any) => `${s?.firstName} ${s?.lastName}` },
              { header: 'Matricule', key: 'student.matricule' },
              { header: 'Classe', key: 'enrollment.classroom.name' },
              { header: 'Total (FCFA)', key: 'totalAmount', format: (v: any) => v?.toLocaleString() },
              { header: 'Payé (FCFA)', key: 'paidAmount', format: (v: any) => v?.toLocaleString() },
              { header: 'Reste (FCFA)', key: 'remainingAmount', format: (v: any) => v?.toLocaleString() },
              { header: 'Statut', key: 'status', format: (v: string) => this.getStatusLabel(v) }
          ]
      };
  }

  override async confirmExport(format: 'excel' | 'pdf') {
      if (format === 'excel') {
          return super.confirmExport(format);
      }
      
      this.closeExportModal();
      this.isExporting.set(true);

      try {
          const result = await this.apollo.query({
              query: this.query,
              variables: { ...this.filterForm.value, page: 1, pageSize: 1000 },
              fetchPolicy: 'network-only'
          }).toPromise();

          const data = (result as any).data[this.responseKey];
          const items = data.items || data;

          if (!items || items.length === 0) {
              this.toastService.warning('Aucune donnée à exporter.');
              this.isExporting.set(false);
              return;
          }

          await this.generateDefaultersPDF(items);
          this.toastService.success(`Export PDF terminé.`);
      } catch (error) {
          console.error('Export error:', error);
          this.toastService.error("Erreur lors de l'export.");
      } finally {
          this.isExporting.set(false);
      }
  }

  private async generateDefaultersPDF(data: any[]) {
      const [jsPDFModule, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
      ]);
      const JsPDF = (jsPDFModule as any).default || jsPDFModule;
      const doc = new JsPDF();
      const autoTable = (autoTableModule as any).default || autoTableModule;

      // Grouper les données par classe
      const grouped: { [key: string]: any[] } = {};
      data.forEach(item => {
          const className = item.enrollment?.classroom?.name || 'Non Inscrit';
          if (!grouped[className]) {
              grouped[className] = [];
          }
          grouped[className].push(item);
      });

      const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      let firstPage = true;

      // Trier les classes par ordre alphabétique
      const sortedClasses = Object.keys(grouped).sort();

      for (const className of sortedClasses) {
          const items = grouped[className];
          
          if (!firstPage) {
              doc.addPage();
          }
          firstPage = false;

          doc.setFontSize(18);
          doc.setTextColor(40);
          doc.text(`Liste des Insolvables`, 14, 22);
          
          doc.setFontSize(12);
          doc.setTextColor(60);
          doc.text(`Classe : ${className}`, 14, 30);
          
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Généré le ${date}`, 14, 36);

          const headers = ['Libellé', 'Élève', 'Matricule', 'Total (FCFA)', 'Payé (FCFA)', 'Reste (FCFA)', 'Statut'];
          const rows = items.map(item => [
              item.title || '',
              `${item.student?.firstName || ''} ${item.student?.lastName || ''}`,
              item.student?.matricule || 'N/A',
              item.totalAmount?.toLocaleString() || '0',
              item.paidAmount?.toLocaleString() || '0',
              item.remainingAmount?.toLocaleString() || '0',
              this.getStatusLabel(item.status)
          ]);

          const tableConfig = {
              head: [headers],
              body: rows,
              startY: 42,
              theme: 'grid',
              headStyles: { fillColor: [79, 70, 229] },
              alternateRowStyles: { fillColor: [249, 250, 251] },
              styles: { fontSize: 9, cellPadding: 3 },
              didDrawPage: (data: any) => {
                  const str = 'Page ' + doc.getNumberOfPages();
                  doc.setFontSize(10);
                  const pageSize = doc.internal.pageSize;
                  const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                  doc.text(str, data.settings.margin.left, pageHeight - 10);
              }
          };

          if (typeof (doc as any).autoTable === 'function') {
              (doc as any).autoTable(tableConfig);
          } else if (typeof autoTable === 'function') {
              autoTable(doc, tableConfig);
          }
      }

      doc.save(`insolvables_${new Date().toISOString().slice(0, 10)}.pdf`);
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

  printInvoice(invoice: any) {
    if (this.router) {
      this.router.navigate(['/print/invoice', invoice.id]);
    }
  }
}
