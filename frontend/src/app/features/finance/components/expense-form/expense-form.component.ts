import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { ExpenseService } from '../../services/expense.service';

import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { FinanceExpenseCategoryChoices, FinanceExpensePaymentMethodChoices } from '@app/graphql/types';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiFormComponent, UiInputComponent, UiSelectComponent],
  templateUrl: './expense-form.component.html'
})
export class ExpenseFormComponent extends BaseFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  public service = inject(ExpenseService);

  @Input() expense: any | null = null;

  // Options des selects (miroir des enums backend)
  categoryOptions = Object.values(FinanceExpenseCategoryChoices).map((value) => ({
    label: this.categoryLabel(value),
    value
  }));

  paymentMethodOptions = Object.values(FinanceExpensePaymentMethodChoices).map((value) => ({
    label: this.paymentMethodLabel(value),
    value
  }));

  override form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    category: ['AUTRE', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    expense_date: [new Date().toISOString().slice(0, 10), [Validators.required]],
    payment_method: ['CASH', [Validators.required]],
    reference: [''],
    description: ['']
  });

  private categoryLabel(value: FinanceExpenseCategoryChoices): string {
    const labels: Record<string, string> = {
      SALARIES: 'Salaires',
      UTILITIES: 'Factures (Eau, Élec, Internet)',
      MAINTENANCE: 'Entretien & Réparations',
      SUPPLIES: 'Fournitures',
      TRANSPORT: 'Transport',
      COMMUNICATION: 'Communication',
      AUTRE: 'Autre'
    };
    return labels[value] || value;
  }

  private paymentMethodLabel(value: FinanceExpensePaymentMethodChoices): string {
    const labels: Record<string, string> = {
      CASH: 'Espèces',
      MOBILE_MONEY: 'Mobile Money',
      BANK_TRANSFER: 'Virement Bancaire',
      CHECK: 'Chèque'
    };
    return labels[value] || value;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expense'] && this.expense) {
      this.form.patchValue({
        title: this.expense.title || '',
        category: this.expense.category || 'AUTRE',
        amount: this.expense.amount ?? 0,
        expense_date: (this.expense.expenseDate || new Date().toISOString().slice(0, 10)).slice(0, 10),
        payment_method: this.expense.paymentMethod || 'CASH',
        reference: this.expense.reference || '',
        description: this.expense.description || ''
      });
    }
  }

  save() {
    const payload: any = this.form.getRawValue();
    if (this.expense?.id) {
      payload.id = this.expense.id;
    }
    return this.service.save(payload);
  }
}
