import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
  selector: 'app-payment-receipt',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="print-overlay" *ngIf="payment(); else loading">
       <div class="flex flex-col items-center justify-center min-h-screen gap-4">
          <svg class="w-16 h-16 text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          <h2 class="text-2xl font-black text-slate-800">Préparation de l'impression...</h2>
          <p class="text-slate-500 font-medium">Vous serez redirigé automatiquement après l'impression.</p>
       </div>
    </div>

    <div class="receipt-container" *ngIf="payment()">
      <!-- Watermark for background -->
      <div class="watermark" *ngIf="establishment()?.logo">
        <img [src]="establishment()?.logo" alt="logo watermark">
      </div>

      <!-- Main Receipt -->
      <div class="receipt-paper">
        
        <!-- Header: Establishment Branding -->
        <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6 relative z-10">
           <div class="flex gap-4">
              <img *ngIf="establishment()?.logo" [src]="establishment()?.logo" class="w-16 h-16 object-contain grayscale" alt="logo">
              <div>
                 <h1 class="text-xl font-black uppercase tracking-tight">{{ establishment()?.name }}</h1>
                 <p class="text-[10px] uppercase font-bold text-gray-600 tracking-widest mt-0.5 mb-2" *ngIf="establishment()?.slogan">{{ establishment()?.slogan }}</p>
                 <p class="text-xs font-medium">{{ establishment()?.address }} - {{ establishment()?.city }}</p>
                 <p class="text-xs font-medium">Tél: {{ establishment()?.phone }}</p>
                 <p class="text-xs font-medium" *ngIf="establishment()?.email">Email: {{ establishment()?.email }}</p>
              </div>
           </div>
           <div class="text-right">
              <h2 class="text-2xl font-black uppercase tracking-widest border-2 border-black px-4 py-1 inline-block bg-black text-white">REÇU</h2>
              <p class="text-xs font-bold mt-3">Date : {{ payment()?.paymentDate | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="text-xs font-bold mt-1">Réf : <span class="font-mono text-sm">{{ payment()?.reference }}</span></p>
           </div>
        </div>

        <!-- Receipt Content Body -->
        <div class="relative z-10">
           <!-- Recipient & Payer Info -->
           <div class="grid grid-cols-2 gap-8 border-b-2 border-black pb-6 mb-6">
              <div>
                 <p class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Reçu de :</p>
                 <p class="font-black text-lg uppercase leading-tight">{{ payment()?.invoice?.student?.firstName }} {{ payment()?.invoice?.student?.lastName }}</p>
                 <p class="text-sm font-bold mt-2">Matricule : <span class="font-mono bg-gray-100 px-1">{{ payment()?.invoice?.student?.matricule }}</span></p>
                 <p class="text-sm font-bold mt-1">Classe : <span>{{ payment()?.invoice?.enrollment?.classroom?.name }}</span></p>
              </div>

              <div>
                 <p class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Motif du versement :</p>
                 <p class="font-black text-sm uppercase leading-tight">{{ payment()?.invoice?.title }}</p>
                 <p class="text-sm font-bold mt-2">Catégorie : <span>{{ payment()?.invoice?.category }}</span></p>
                 <p class="text-sm font-bold mt-1">Réf. Facture : <span class="font-mono bg-gray-100 px-1">{{ payment()?.invoice?.reference }}</span></p>
              </div>
           </div>

           <!-- Amount Details -->
           <div class="mb-8 flex items-end justify-between">
              <div class="max-w-[70%]">
                 <p class="text-[10px] uppercase font-bold text-gray-500 mb-1">Arrêté le présent reçu à la somme de :</p>
                 <p class="text-sm font-black italic bg-gray-100 p-2 border-l-4 border-black">
                    {{ amountInWords() }}
                 </p>
              </div>
              <div class="text-right">
                 <p class="text-[10px] uppercase font-bold text-gray-500 mb-1">Montant Versé :</p>
                 <p class="text-3xl font-black whitespace-nowrap">{{ payment()?.amount?.toLocaleString() }} <span class="text-base font-bold">FCFA</span></p>
                 <p class="text-xs font-bold mt-1 border border-black inline-block px-2 py-0.5 rounded-md">Via {{ payment()?.paymentMethod }}</p>
              </div>
           </div>

           <!-- Financial Summary Table -->
           <div class="mb-10">
              <table class="w-full text-sm border-collapse border-2 border-black">
                 <tr class="bg-gray-100 text-center font-bold">
                    <td class="border border-black py-2 px-4 uppercase text-[10px]">Total Facture</td>
                    <td class="border border-black py-2 px-4 uppercase text-[10px]">Total Payé (à date)</td>
                    <td class="border border-black py-2 px-4 uppercase text-[10px]">Reste à Payer</td>
                 </tr>
                 <tr class="text-center font-black text-base">
                    <td class="border border-black py-3 px-4">{{ payment()?.invoice?.totalAmount?.toLocaleString() }}</td>
                    <td class="border border-black py-3 px-4">{{ financialStatus()?.total_paid?.toLocaleString() }}</td>
                    <td class="border border-black py-3 px-4">{{ financialStatus()?.remaining_total?.toLocaleString() }}</td>
                 </tr>
              </table>
           </div>

           <!-- Signatures -->
           <div class="grid grid-cols-2 gap-20 mt-12 mb-4">
              <div class="text-center">
                 <p class="text-xs font-black uppercase border-b border-black pb-12 mb-1 inline-block w-full max-w-[200px]">Le Parent / L'Élève</p>
                 <p class="text-[9px] text-gray-500 italic text-center w-full max-w-[200px] mx-auto">Signature & Date</p>
              </div>
              <div class="text-center">
                 <p class="text-xs font-black uppercase border-b border-black pb-12 mb-1 inline-block w-full max-w-[200px]">L'Économe / La Caisse</p>
                 <p class="text-[9px] text-gray-500 italic text-center w-full max-w-[200px] mx-auto">Signature & Cachet</p>
              </div>
           </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-4 border-t border-dashed border-gray-400 text-center relative z-10">
           <p class="text-[9px] font-medium text-gray-500 italic">
             {{ establishment()?.print_footer || 'Les frais versés ne sont pas remboursables. Ce reçu est un document officiel, merci de le conserver.' }}
           </p>
           <p class="text-[8px] text-gray-400 mt-1 font-mono uppercase tracking-tighter">Généré par Yekola ERP • {{ now | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>
      </div>
    </div>

    <ng-template #loading>
       <div class="print-overlay">
         <div class="flex flex-col items-center justify-center min-h-screen gap-4">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-slate-500 font-bold animate-pulse">Préparation du document en cours...</p>
         </div>
       </div>
    </ng-template>

    <style>
      @media screen {
        .print-overlay {
          @apply bg-slate-50 min-h-screen;
        }
        .receipt-container {
           position: absolute;
           left: -9999px;
           top: -9999px;
        }
      }

      .receipt-paper {
        @apply bg-white max-w-[210mm] mx-auto p-[15mm] relative z-10 font-sans;
        min-height: 148mm; /* A5 Landscape or similar */
      }
      .watermark {
        @apply absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none;
      }
      .watermark img {
        @apply w-[400px] h-[400px] object-contain grayscale;
      }

      @media print {
        @page {
          size: auto;
          margin: 15mm;
        }
        .print-overlay { display: none !important; }
        .receipt-container {
          position: static;
          background: white;
          padding: 0;
          display: block;
        }
        .receipt-paper {
          width: 90%;
          margin: 0 auto;
          padding: 0;
          box-shadow: none;
          max-width: none;
          min-height: auto;
        }
      }
    </style>
  `,
  providers: [DatePipe]
})
export class PaymentReceiptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private structureState = inject(StructureStateService);

  payment = signal<any>(null);
  establishment = signal<any>(null);
  financialStatus = signal<any>(null);
  now = new Date();

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadPayment(id);
    }

    if (this.structureState.establishments().length === 0) {
        this.structureState.fetchEstablishments();
    }
    this.updateEstablishment();
  }

  updateEstablishment() {
    const estId = this.structureState.currentEstablishmentId();
    const allEst = this.structureState.establishments();
    const current = allEst.find((e: any) => e.id === estId);
    if (current) {
        this.establishment.set(current);
    } else if (allEst.length > 0) {
        this.establishment.set(allEst[0]);
    }
  }

  loadPayment(id: string) {
    this.paymentService.get_by_id(id).subscribe({
      next: (res: any) => {
        this.payment.set(res.data);
        if (res.data.invoice?.student?.id) {
            this.loadFinancialStatus(res.data.invoice.student.id);
        }
      },
      error: () => this.router.navigate(['/finance/payments'])
    });
  }

  loadFinancialStatus(studentId: string) {
    this.paymentService.getFinancialStatus(studentId).subscribe(res => {
        this.financialStatus.set(res.data);
        setTimeout(() => this.print(), 1000);
    });
  }

  amountInWords(): string {
    const amount = this.payment()?.amount || 0;
    return this.numberToFrenchWords(amount);
  }

  private numberToFrenchWords(n: number): string {
    if (n === 0) return 'ZÉRO FRANCS CFA';
    if (!n) return '';

    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

    const convertTens = (num: number): string => {
      if (num < 20) return units[num];
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      
      if (ten === 7 || ten === 9) {
          const base = ten === 7 ? 'soixante' : 'quatre-vingt';
          const r = num - (ten === 7 ? 60 : 80);
          if (r === 11 && ten === 7) return `${base} et onze`;
          return `${base}-${units[r]}`;
      }
      
      let res = tens[ten];
      if (ten === 8 && unit === 0) return res; 
      if (ten === 8) res = 'quatre-vingt'; 
      
      if (unit === 1) return `${res} et un`;
      if (unit > 1) return `${res}-${units[unit]}`;
      return res;
    };

    const convertHundreds = (num: number): string => {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      let res = '';
      if (hundred === 1) res = 'cent';
      else if (hundred > 1) res = `${units[hundred]} cent${rest === 0 ? 's' : ''}`;
      
      if (rest > 0) res += (res ? ' ' : '') + convertTens(rest);
      return res;
    };

    const convertThousands = (num: number): string => {
      const thousand = Math.floor(num / 1000);
      const rest = num % 1000;
      let res = '';
      if (thousand === 1) res = 'mille';
      else if (thousand > 1) res = `${convertHundreds(thousand)} mille`;
      
      if (rest > 0) res += (res ? ' ' : '') + convertHundreds(rest);
      return res;
    };

    const convertMillions = (num: number): string => {
      const million = Math.floor(num / 1000000);
      const rest = num % 1000000;
      let res = '';
      if (million === 1) res = 'un million';
      else if (million > 1) res = `${convertHundreds(million)} millions`;
      
      if (rest > 0) res += (res ? ' ' : '') + convertThousands(rest);
      return res;
    };

    let result = '';
    if (n >= 1000000) result = convertMillions(n);
    else if (n >= 1000) result = convertThousands(n);
    else result = convertHundreds(n);

    return result.trim().toUpperCase() + ' FRANCS CFA';
  }

  print() {
    window.print();
  }

  @HostListener('window:afterprint')
  onafterprint() {
    this.close();
  }

  close() {
    this.router.navigate(['/finance/payments']);
  }
}
