import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { PaymentService } from '../../services/payment.service';

import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    UiFormComponent,
    UiInputComponent,
    UiSelectComponent,
    DatePipe
  ],
  template: `
    <app-ui-form [formErrors]="formErrors" 
      title="Enregistrement de Paiement"
      [description]="'Validez l\\'encaissement pour la facture ' + item?.title"
      [formGroup]="form" 
      (submitForm)="submit()" 
      (cancel)="onCancel()"
      submitLabel="Confirmer l'Encaissement"
      [isLoading]="isSubmitting"
     >

      <div *ngIf="item" class="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
        <div>
          <h4 class="text-indigo-900 font-bold">{{ item.student?.firstName }} {{ item.student?.lastName }}</h4>
          <p class="text-[10px] text-indigo-600 uppercase tracking-widest font-bold mt-1">
            Matricule: {{ item.student?.matricule }} | {{ item.enrollment?.classroom?.name }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-black text-indigo-700">{{ item.remainingAmount?.toLocaleString() }} <span class="text-sm font-normal">FCFA</span></p>
          <p class="text-xs text-indigo-600 font-medium italic">Reste à payer</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <app-ui-input 
          label="Montant Versé" 
          type="number"
          formControlName="amount" 
          [required]="true">
        </app-ui-input>

        <div *ngIf="installmentBreakdown" class="col-span-2 -mt-2 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
           <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
              <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Détail du versement :
           </div>
           <p class="text-sm font-medium text-slate-900 mt-1">{{ installmentBreakdown }}</p>
        </div>

        <app-ui-select 
          label="Mode de Paiement" 
          formControlName="paymentMethod" 
          [options]="paymentMethods"
          [required]="true">
        </app-ui-select>

        <app-ui-input 
          label="Référence / Reçu" 
          formControlName="reference"
          placeholder="ex: CHQ-12345, MoMo Reff...">
        </app-ui-input>

        <app-ui-input 
          label="Note / Commentaire" 
          formControlName="note">
        </app-ui-input>
      </div>
    </app-ui-form>
  `
})
export class PaymentFormComponent extends BaseFormComponent implements OnInit {
  @Input() item: any;
  service = inject(PaymentService);
  fb = inject(FormBuilder);
  router: Router = inject(Router);

  form!: FormGroup;
  showReceipt = false;
  lastPayment: any = null;
  today = new Date();
  financialStatus = signal<any>(null);

  get installmentBreakdown(): string | null {
    const amount = this.form?.get('amount')?.value;
    const instCount = this.item?.installmentCount || 1;
    if (!amount || amount <= 0 || instCount <= 1) return null;

    const total = this.item.totalAmount;
    const instAmount = total / instCount;
    
    // Si c'est le montant total
    if (amount >= this.item.remainingAmount) {
        return "⚠️ Ce montant solde la totalité de la facture.";
    }

    const fullTranches = Math.floor(amount / instAmount);
    const remainder = amount % instAmount;

    let msg = `Couvre ${fullTranches} tranche(s) entière(s)`;
    if (remainder > 0) {
      msg += ` et constitue une avance de ${remainder.toLocaleString()} FCFA sur la tranche suivante`;
    }
    
    return msg;
  }

  paymentMethods = [
    { label: 'Espèces', value: 'CASH' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' },
    { label: 'Virement Bancaire', value: 'BANK_TRANSFER' },
    { label: 'Chèque', value: 'CHECK' }
  ];

  override fieldLabels = {
    amount: 'Montant Versé',
    paymentMethod: 'Mode de Paiement',
    reference: 'Référence',
    note: 'Note / Commentaire',
    invoice: 'Facture'
  };

  override ngOnInit() {
    this.initForm();
    super.ngOnInit();
  }

  initForm() {
    const totalAmount = this.item?.totalAmount || 0;
    const instCount = this.item?.installmentCount || 1;
    const remaining = this.item?.remainingAmount || 0;
    
    // On propose le montant d'une tranche si applicable, sinon le reste
    let proposedAmount = remaining;
    if (instCount > 1 && remaining > (totalAmount / instCount)) {
        proposedAmount = totalAmount / instCount;
    }

    this.form = this.fb.group({
      invoice: [this.item?.id, Validators.required],
      amount: [proposedAmount, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CASH', Validators.required],
      reference: [''],
      note: ['']
    });
  }

  override submit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.save().subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          const paymentId = res.data.id;
          this.toastService.success('Paiement enregistré avec succès.');
          
          // Redirection vers la page d'impression du reçu individuel
          this.router.navigate(['/print/receipt', paymentId]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.toastService.error('Erreur lors de l\'enregistrement du paiement.');
        }
      });
    }
  }

  save() {
    return this.service.save(this.form.value);
  }
}
