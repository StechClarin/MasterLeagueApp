import { Component, inject, ViewChild, TemplateRef, AfterViewInit,signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { FinanceExpenseCategoryChoices, FinanceExpensePaymentMethodChoices } from '@app/graphql/types';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExpenseFormComponent,
    UiModalComponent,
    UiPaginationComponent,
    UiListPageComponent,
    UiToolbarComponent,
    UiConfirmModalComponent,
    UiTableComponent,
    UiDropdownComponent
  ],
  templateUrl: './expense-list.component.html'
})
export class ExpenseListComponent extends BaseModalListComponent<any> implements AfterViewInit {
  public service = inject(ExpenseService);
  query = this.service.getQuery();
  responseKey = 'expenses';

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  isFiltersOpen = signal(false);
  
  private cdr = inject(ChangeDetectorRef);
      private destroy$ = new Subject<void>();
  


  @ViewChild('titleCell') titleCell!: TemplateRef<any>;
  @ViewChild('categoryCell') categoryCell!: TemplateRef<any>;
  @ViewChild('amountCell') amountCell!: TemplateRef<any>;
  @ViewChild('dateCell') dateCell!: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

  tableColumns: UiTableColumn[] = [];

  // Options de filtre par catégorie
  categoryOptions = [
    { label: 'Toutes les catégories', value: '' },
    ...Object.values(FinanceExpenseCategoryChoices).map((value) => ({
      label: this.categoryLabel(value),
      value
    }))
  ];

  ngAfterViewInit() {
    setTimeout(() => {
      this.tableColumns = [
        { header: 'Libellé', template: this.titleCell },
        { header: 'Catégorie', template: this.categoryCell },
        { header: 'Montant', template: this.amountCell },
        { header: 'Date', template: this.dateCell }
      ];
      this.cdr.detectChanges();
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.searchControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.refresh();
    });
    this.categoryControl.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.refresh();
    });
  }

  initFilterForm(): FormGroup {
    
    return this.fb.group({
      search: [''],
    });
  }

  protected override getFilterVariables(): any {
    return {
      ...this.filterForm.value,
      search: this.searchControl.value || '',
      category: this.categoryControl.value || undefined
    };
  }

  // --- Helpers d'affichage ---
  categoryLabel(value: string): string {
    const labels: Record<string, string> = {
      SALARIES: 'Salaires',
      UTILITIES: 'Factures',
      MAINTENANCE: 'Entretien',
      SUPPLIES: 'Fournitures',
      TRANSPORT: 'Transport',
      COMMUNICATION: 'Communication',
      AUTRE: 'Autre'
    };
    return labels[value] || value || '—';
  }

  categoryBadgeClass(value: string): string {
    const classes: Record<string, string> = {
      SALARIES: 'bg-indigo-100 text-indigo-700',
      UTILITIES: 'bg-amber-100 text-amber-700',
      MAINTENANCE: 'bg-orange-100 text-orange-700',
      SUPPLIES: 'bg-emerald-100 text-emerald-700',
      TRANSPORT: 'bg-sky-100 text-sky-700',
      COMMUNICATION: 'bg-purple-100 text-purple-700',
      AUTRE: 'bg-slate-100 text-slate-600'
    };
    return classes[value] || 'bg-slate-100 text-slate-600';
  }

  paymentMethodLabel(value: string): string {
    const labels: Record<string, string> = {
      CASH: 'Espèces',
      MOBILE_MONEY: 'Mobile Money',
      BANK_TRANSFER: 'Virement',
      CHECK: 'Chèque'
    };
    return labels[value] || value || '—';
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatAmount(value: any): string {
    const n = Number(value) || 0;
    return n.toLocaleString('fr-FR') + ' FCFA';
  }
}
