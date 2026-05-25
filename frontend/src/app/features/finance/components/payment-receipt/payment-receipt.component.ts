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
       <div class="flex flex-col items-center justify-center min-h-screen gap-3 p-4 text-center">
          <div class="p-4 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
             </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Préparation du reçu...</h2>
          <p class="text-sm text-slate-500 max-w-xs">La boîte de dialogue d'impression s'ouvre automatiquement. Redirection imminente.</p>
       </div>
    </div>

    <div class="receipt-container" *ngIf="payment()">
      
      <div class="receipt-paper">
        
        <div class="flex justify-between items-start border-b border-slate-300 pb-5 mb-6 relative z-10">
           <div class="flex gap-4 items-center">
              <img *ngIf="payment()?.establishment?.logo" [src]="payment()?.establishment?.logo" class="w-14 h-14 object-contain" alt="logo">
              <div>
                 <h1 class="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">{{ payment()?.establishment?.name || payment()?.invoice?.establishment?.name }}</h1>
                 <p class="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider mt-1 mb-2" *ngIf="payment()?.invoice?.establishment?.slogan || payment()?.establishment?.slogan">
                    « {{ payment()?.establishment?.slogan || payment()?.invoice?.establishment?.slogan }} »
                 </p>
                 <div class="text-xs text-slate-600 space-y-0.5 font-medium">
                    <p>{{ payment()?.establishment?.address || payment()?.invoice?.establishment?.address }} — {{ payment()?.establishment?.city || payment()?.invoice?.establishment?.city }}</p>
                    <p><span class="text-slate-400">Tél :</span> {{ payment()?.establishment?.phone || payment()?.invoice?.establishment?.phone }}</p>
                    <p *ngIf="payment()?.establishment?.email || payment()?.invoice?.establishment?.email">
                       <span class="text-slate-400">Email :</span> {{ payment()?.establishment?.email || payment()?.invoice?.establishment?.email }}
                    </p>
                 </div>
              </div>
           </div>
           <div class="text-right">
              <div class="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-4 py-1.5 rounded mb-3 inline-block">
                 Reçu de Versement
              </div>
              <p class="text-xs text-slate-500 font-medium">Date : <span class="text-slate-800 font-semibold">{{ payment()?.paymentDate | date:'dd/MM/yyyy à HH:mm' }}</span></p>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Réf Reçu : <span class="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{{ payment()?.reference }}</span></p>
           </div>
        </div>

        <div class="relative z-10">
           
           <div class="grid grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div class="border-r border-slate-200 pr-2">
                 <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Reçu de (Élève)</span>
                 <p class="font-bold text-sm text-slate-900 uppercase leading-tight">{{ payment()?.invoice?.student?.firstName }} {{ payment()?.invoice?.student?.lastName }}</p>
                 <div class="text-xs text-slate-600 space-y-0.5 mt-2 font-medium">
                    <p>Matricule : <span class="font-mono font-bold text-slate-900">{{ payment()?.invoice?.student?.matricule }}</span></p>
                    <p>Classe : <span class="text-slate-900 font-semibold">{{ payment()?.invoice?.enrollment?.classroom?.name }}</span></p>
                 </div>
              </div>

              <div class="border-r border-slate-200 px-2">
                 <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Détails de la Facture</span>
                 <p class="font-bold text-sm text-slate-900 uppercase truncate leading-tight">{{ payment()?.invoice?.title }}</p>
                 <div class="text-xs text-slate-600 space-y-0.5 mt-2 font-medium">
                    <p>Catégorie : <span class="text-slate-900 font-semibold">{{ payment()?.invoice?.category }}</span></p>
                    <p>Réf. Doc : <span class="font-mono text-slate-900 font-semibold">{{ payment()?.invoice?.reference }}</span></p>
                 </div>
              </div>

              <div class="pl-2">
                 <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Guichet & Traçabilité</span>
                 <p class="font-bold text-sm text-slate-900 uppercase leading-tight">Opération Caisse</p>
                 <div class="text-xs text-slate-600 space-y-0.5 mt-2 font-medium">
                    <p>Caissier : <span class="text-slate-900 font-mono font-bold">{{ payment()?.createdByUser?.username || 'Système' }}</span></p>
                    <p>Statut : <span class="text-emerald-600 font-semibold">Validé & Encaissé</span></p>
                 </div>
              </div>
           </div>

           <div class="mb-6 flex flex-col sm:flex-row items-stretch justify-between gap-6 bg-slate-50/50 border border-slate-150 rounded-xl p-4">
              <div class="flex-1 flex flex-col justify-center">
                 <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">Arrêté le présent reçu à la somme de :</span>
                 <p class="text-xs font-bold text-slate-700 italic bg-white px-3 py-2.5 rounded-lg border-l-4 border-indigo-600 shadow-sm leading-relaxed">
                    {{ amountInWords() }}
                 </p>
              </div>
              <div class="text-right flex flex-col justify-center items-end min-w-[180px]">
                 <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-0.5">Montant Versé</span>
                 <p class="text-2xl font-black text-slate-950 whitespace-nowrap leading-none">
                    {{ payment()?.amount ? (+payment().amount).toLocaleString() : '0' }} <span class="text-xs font-bold text-slate-500">FCFA</span>
                 </p>
                 <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-2 uppercase tracking-wide">
                    Mode : {{ payment()?.paymentMethod }}
                 </span>
              </div>
           </div>

           <div class="mb-6 p-3 bg-amber-50/40 border border-amber-100 rounded-lg text-xs" *ngIf="payment()?.note">
              <span class="text-[10px] font-bold uppercase text-amber-700 tracking-wider block mb-0.5">Observations / Note de caisse :</span>
              <p class="text-slate-600 italic font-medium">" {{ payment()?.note }} "</p>
           </div>

           <div class="mb-8">
              <table class="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                 <thead class="bg-slate-800 text-slate-200 font-bold text-center uppercase text-[10px] tracking-wider">
                    <tr>
                       <th class="py-2 px-4 border-r border-slate-700">Total Facture</th>
                       <th class="py-2 px-4 border-r border-slate-700">Total Payé (À date)</th>
                       <th class="py-2 px-4 bg-indigo-900 text-white">Reste à Payer</th>
                    </tr>
                 </thead>
                 <tbody class="text-center font-bold text-sm text-slate-900 divide-x divide-slate-200">
                    <tr>
                       <td class="py-3 px-4 bg-slate-50">{{ payment()?.invoice?.totalAmount?.toLocaleString() }}</td>
                       <td class="py-3 px-4 bg-slate-50 text-emerald-600">{{ financialStatus()?.total_paid?.toLocaleString() }}</td>
                       <td class="py-3 px-4 bg-indigo-50 text-indigo-700 font-black text-base">
                          {{ financialStatus()?.remaining_total?.toLocaleString() }}
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>

           <div class="grid grid-cols-2 gap-16 mt-10 mb-4">
              <div class="text-center">
                 <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-12">Le Parent / L'Élève</p>
                 <div class="w-44 border-b border-dashed border-slate-300 mx-auto mb-1"></div>
                 <span class="text-[9px] text-slate-400 italic block">Signature pour acquit</span>
              </div>
              <div class="text-center">
                 <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-12">L'Économe / La Caisse</p>
                 <div class="w-44 border-b border-dashed border-slate-300 mx-auto mb-1"></div>
                 <span class="text-[9px] text-slate-400 italic block">Cachet & Signature</span>
              </div>
           </div>
        </div>

        <div class="mt-12 pt-4 border-t border-dashed border-slate-200 text-center relative z-10">
           <p class="text-[10px] font-medium text-slate-400 italic">
             {{ establishment()?.print_footer || 'Les frais versés ne sont pas remboursables. Ce reçu est un document officiel, merci de le conserver.' }}
           </p>
           <p class="text-[8px] text-slate-400 font-mono tracking-widest uppercase mt-2">
              Généré par Yekola ERP • {{ now | date:'dd/MM/yyyy HH:mm' }}
           </p>
        </div>
      </div>
    </div>

    <ng-template #loading>
       <div class="print-overlay">
         <div class="flex flex-col items-center justify-center min-h-screen gap-3">
            <div class="w-10 h-10 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">Récupération des données...</p>
         </div>
       </div>
    </ng-template>

    <style>
      /* --- ÉCRAN ORDINAIRE --- */
      @media screen {
        .print-overlay {
          @apply bg-slate-100/80 backdrop-blur-sm min-h-screen fixed inset-0 z-50 flex items-center justify-center;
        }
        .receipt-container {
           position: absolute;
           left: -9999px;
           top: -9999px;
        }
      }

      /* --- STYLE GLOBAL DU PAPIER (Base Reçu Moderne) --- */
      .receipt-paper {
        @apply bg-white relative p-6 sm:p-8;
        font-family: 'Inter', system-ui, sans-serif;
      }

      /* --- CONFIGURATION COMPLÈTE IMPRESSION --- */
      @media print {
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        html, body {
          background: #fff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-overlay { display: none !important; }
        .receipt-container {
          position: static;
          display: block;
          background: transparent;
        }
        .receipt-paper {
          padding: 0;
          width: 100%;
          box-shadow: none;
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
    this.paymentService.getPaymentByGraphql(id).subscribe({
      next: (res: any) => {
        this.payment.set(res.data);
        // Fallback si l'établissement imbriqué est absent, on prend celui du state
        if (!res.data.establishment && res.data.invoice?.establishment) {
           res.data.establishment = res.data.invoice.establishment;
        }
        if (res.data.invoice?.student?.id) {
            this.loadFinancialStatus(res.data.invoice.student.id);
        }
      },
      error: () => this.router.navigate(['/finance/payments'])
    });
  }

  loadFinancialStatus(studentId: string) {
    this.paymentService.getFinancialStatus(studentId).subscribe({
      next: (res: any) => {
        this.financialStatus.set(res.data);
        setTimeout(() => this.print(), 800);
      },
      error: () => {
        setTimeout(() => this.print(), 800);
      }
    });
  }

  amountInWords(): string {
    const amount = this.payment()?.amount || 0;
    return this.numberToFrenchWords(Number(amount));
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