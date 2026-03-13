import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
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
    <div *ngIf="!showReceipt">
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
    </div>

    <!-- View for Success & Print Receipt -->
    <div *ngIf="showReceipt" class="animate-in fade-in zoom-in-95 duration-500">
      <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-6 text-center">
        <div class="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="text-2xl font-black text-emerald-900 mb-2">Encaissement Réussi !</h3>
        <p class="text-emerald-700">Le paiement a été enregistré avec la référence <span class="font-mono font-bold">{{ lastPayment?.reference }}</span></p>
      </div>

      <div id="receipt-content" class="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm mb-6 print:border-none print:shadow-none">
        <!-- Header Receipt -->
        <div class="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h2 class="text-xl font-black text-slate-900 uppercase">Reçu de Paiement</h2>
            <p class="text-xs text-slate-500 font-bold font-mono uppercase">{{ lastPayment?.reference }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-700">{{ today | date:'dd/MM/yyyy' }}</p>
            <p class="text-[10px] text-slate-400 font-medium">Date d'émission</p>
          </div>
        </div>

        <!-- Student Details -->
        <div class="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h4 class="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Élève</h4>
            <p class="font-bold text-slate-900">{{ item.student?.firstName }} {{ item.student?.lastName }}</p>
            <p class="text-xs text-slate-500 font-medium">Matricule: {{ item.student?.matricule }}</p>
            <p class="text-xs text-slate-500 font-medium">Classe: {{ item.enrollment?.classroom?.name }}</p>
          </div>
          <div class="text-right">
            <h4 class="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Détails Facture</h4>
            <p class="font-bold text-slate-900">{{ item.title }}</p>
            <p class="text-xs text-slate-500 font-medium">Réf Facture: {{ item.reference }}</p>
          </div>
        </div>

        <!-- Payment Breakdown -->
        <table class="w-full text-left text-sm mb-6">
          <thead class="bg-slate-50 border-y border-slate-100">
            <tr>
              <th class="py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Description</th>
              <th class="py-2 px-3 text-right text-slate-500 font-bold uppercase text-[10px]">Montant</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="py-3 px-3 italic text-slate-600">Total de la facture</td>
              <td class="py-3 px-3 text-right font-medium text-slate-600">{{ item.totalAmount?.toLocaleString() }} FCFA</td>
            </tr>
            <tr>
              <td class="py-3 px-3 font-bold text-indigo-700">Versement Actuel ({{ lastPayment?.paymentMethod }})</td>
              <td class="py-3 px-3 text-right font-black text-indigo-700">{{ lastPayment?.amount?.toLocaleString() }} FCFA</td>
            </tr>
          </tbody>
        </table>

        <!-- Summary -->
        <div class="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center">
          <div>
            <p class="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Reste à payer total (Élève)</p>
            <p class="text-xs text-slate-300 font-medium italic">Calculé sur l'ensemble de ses frais obligatoires</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-black text-white">{{ financialStatus()?.remaining_total?.toLocaleString() }} FCFA</p>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <button (click)="printReceipt()" 
                class="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Imprimer le Reçu
        </button>
        <button (click)="onCancel()" 
                class="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
          Fermer
        </button>
      </div>
    </div>

    <style>
      @media print {
        body * { visibility: hidden; }
        #receipt-content, #receipt-content * { visibility: visible; }
        #receipt-content { 
          position: absolute; 
          left: 0; top: 0; 
          width: 100%; 
          border: none !important;
          padding: 0 !important;
        }
      }
    </style>
  `
})
export class PaymentFormComponent extends BaseFormComponent implements OnInit {
  @Input() item: any;
  service = inject(PaymentService);
  fb = inject(FormBuilder);

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
          this.lastPayment = res.data;
          
          // Fetch global financial status for the receipt
          if (this.item?.student?.id) {
            this.service.getFinancialStatus(this.item.student.id).subscribe(statusRes => {
                this.financialStatus.set(statusRes.data);
                this.showReceipt = true;
            });
          } else {
            this.showReceipt = true;
          }
          
          this.toastService.success('Paiement enregistré avec succès.');
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

  printReceipt() {
    window.print();
  }
}
