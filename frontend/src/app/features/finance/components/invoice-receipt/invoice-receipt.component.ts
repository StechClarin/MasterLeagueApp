import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
  selector: 'app-invoice-receipt',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <!-- Overlay d'attente d'impression -->
    <div class="print-overlay" *ngIf="invoice(); else loading">
       <div class="flex flex-col items-center justify-center min-h-screen gap-3 p-4 text-center">
          <div class="p-4 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
             </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Préparation de l'impression...</h2>
          <p class="text-sm text-slate-500 max-w-xs">La boîte de dialogue s'ouvre automatiquement. Vous serez redirigé juste après.</p>
       </div>
    </div>

    <!-- Conteneur du Reçu -->
    <div class="receipt-container" *ngIf="invoice()">
      
      <!-- Filigrane DUPLICATA -->
      <div class="watermark-duplicata" *ngIf="isDuplicate()">
        <span>DUPLICATA</span>
      </div>

      <!-- Papier A4 -->
      <div class="receipt-paper">
        
        <!-- En-tête : Identification de l'établissement -->
        <div class="flex justify-between items-start border-b border-slate-300 pb-5 mb-6 relative z-10">
           <div class="flex gap-4 items-center">
              <img *ngIf="invoice()?.establishment?.logo" [src]="invoice()?.establishment?.logo" class="w-16 h-16 object-contain" alt="logo">
              <div>
                 <h1 class="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">{{ invoice()?.establishment?.name }}</h1>
                 <p class="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider mt-1 mb-2" *ngIf="invoice()?.establishment?.slogan">« {{ invoice()?.establishment?.slogan }} »</p>
                 <div class="text-xs text-slate-600 space-y-0.5 mt-1 font-medium">
                    <p>{{ invoice()?.establishment?.address }} — {{ invoice()?.establishment?.city }}</p>
                    <p><span class="text-slate-400">Tél :</span> {{ invoice()?.establishment?.phone }}</p>
                    <p *ngIf="invoice()?.establishment?.email"><span class="text-slate-400">Email :</span> {{ invoice()?.establishment?.email }}</p>
                 </div>
              </div>
           </div>
           <div class="text-right">
              <div class="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1.5 rounded mb-3 inline-block">
                 Extrait de compte
              </div>
              <p class="text-xs text-slate-500 font-medium">Édité le : <span class="text-slate-800 font-semibold">{{ now | date:'dd/MM/yyyy à HH:mm' }}</span></p>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Facture N° : <span class="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{{ invoice()?.reference }}</span></p>
           </div>
        </div>

        <!-- Corps du document -->
        <div class="relative z-10">
           
           <!-- Informations Élève & Objet -->
           <div class="grid grid-cols-2 gap-8 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div class="border-r border-slate-200 pr-4">
                 <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Informations Élève</span>
                 <p class="font-bold text-base text-slate-900 uppercase">{{ invoice()?.student?.firstName }} {{ invoice()?.student?.lastName }}</p>
                 <div class="text-xs text-slate-600 space-y-1 mt-2 font-medium">
                    <p>Matricule : <span class="font-mono font-bold text-slate-900">{{ invoice()?.student?.matricule }}</span></p>
                    <p>Classe : <span class="text-slate-900 font-semibold">{{ invoice()?.enrollment?.classroom?.name }}</span></p>
                 </div>
              </div>

              <div class="pl-2">
                 <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Détails de la Facture</span>
                 <p class="font-bold text-sm text-slate-900 uppercase truncate">{{ invoice()?.title }}</p>
                 <div class="text-xs text-slate-600 space-y-1 mt-2 font-medium">
                    <p>Catégorie : <span class="text-slate-900 font-semibold">{{ invoice()?.category }}</span></p>
                    <p>Tranches prévues : <span class="font-mono font-bold text-slate-900">{{ invoice()?.installmentCount || 1 }}</span></p>
                 </div>
              </div>
           </div>

           <!-- Historique des versements (Tableau) -->
           <div class="mb-6" *ngIf="invoice()?.payments?.length > 0">
             <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-2">
                <span class="w-1.5 h-3 bg-indigo-600 rounded-sm"></span> Historique des versements
             </h3>
             <table class="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
               <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                 <tr>
                   <th class="px-4 py-2.5">Date & Heure</th>
                   <th class="px-4 py-2.5">Réf. Reçu</th>
                   <th class="px-4 py-2.5">Mode de paiement</th>
                   <th class="px-4 py-2.5 text-right">Montant (FCFA)</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
                 <tr *ngFor="let pay of invoice()?.payments">
                   <td class="px-4 py-2.5 whitespace-nowrap">{{ pay.payment_date | date:'dd/MM/yyyy HH:mm' }}</td>
                   <td class="px-4 py-2.5 font-mono text-slate-900 font-semibold">{{ pay.reference }}</td>
                   <td class="px-4 py-2.5 text-slate-500">{{ pay.payment_method }}</td>
                   <td class="px-4 py-2.5 text-right font-bold text-slate-900">{{ pay.amount?.toLocaleString() }}</td>
                 </tr>
               </tbody>
             </table>
           </div>
           
           <!-- État vide si aucun paiement -->
           <div class="mb-6 p-5 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center" *ngIf="!invoice()?.payments?.length">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aucun versement n'a encore été enregistré.</p>
           </div>

           <!-- Synthèse Financière (Tableau Récapitulatif) -->
           <div class="mb-8">
              <table class="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                 <thead class="bg-slate-800 text-slate-200 font-bold text-center uppercase text-[10px] tracking-wider">
                    <tr>
                       <th class="py-2 px-4 border-r border-slate-700">Total à Payer</th>
                       <th class="py-2 px-4 border-r border-slate-700">Total Payé</th>
                       <th class="py-2 px-4 bg-indigo-900 text-white">Reste à Payer</th>
                    </tr>
                 </thead>
                 <tbody class="text-center font-bold text-sm text-slate-900 divide-x divide-slate-200">
                    <tr>
                       <td class="py-3 px-4 bg-slate-50">{{ invoice()?.total_amount?.toLocaleString() }}</td>
                       <td class="py-3 px-4 bg-slate-50 text-emerald-600">{{ invoice()?.paid_amount?.toLocaleString() }}</td>
                       <td class="py-3 px-4 bg-indigo-50 text-indigo-700 font-black text-base">
                          {{ (+invoice()?.total_amount - +invoice()?.paid_amount).toLocaleString() }}
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>

           <!-- Zone des Signatures -->
           <div class="grid grid-cols-2 gap-16 mt-10 mb-4">
              <div class="text-center">
                 <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-14">Le Parent / L'Élève</p>
                 <div class="w-48 border-b border-dashed border-slate-300 mx-auto"></div>
              </div>
              <div class="text-center">
                 <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-14">L'Économe / La Caisse</p>
                 <div class="w-48 border-b border-dashed border-slate-300 mx-auto"></div>
              </div>
           </div>
        </div>

        <!-- Pied de page -->
        <div class="mt-12 pt-4 border-t border-dashed border-slate-200 text-center relative z-10">
           <p class="text-[10px] font-medium text-slate-400 italic">
             {{ establishment()?.print_footer || 'Ce document est un extrait de compte officiel. Merci de le conserver.' }}
           </p>
           <p class="text-[8px] text-slate-400 font-mono tracking-widest uppercase mt-2">
              Généré par Yekola ERP • {{ now | date:'dd/MM/yyyy HH:mm' }}
           </p>
        </div>
      </div>
    </div>

    <!-- Squelette de chargement initial -->
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

      /* --- STYLE GLOBAL DU PAPIER (Base pour le Print) --- */
      .receipt-paper {
        @apply bg-white relative p-8;
        font-family: 'Inter', system-ui, sans-serif;
      }
      
      /* --- MARQUE DUPLICATA --- */
      .watermark-duplicata {
        @apply absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0 opacity-5;
      }
      .watermark-duplicata span {
        @apply text-[120px] font-black text-rose-600 tracking-widest transform -rotate-45 select-none uppercase;
      }

      /* --- CONFIGURATION FINALE IMPRESSION --- */
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
export class InvoiceReceiptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private structureState = inject(StructureStateService);

  invoice = signal<any>(null);
  establishment = signal<any>(null);
  isDuplicate = signal<boolean>(false);
  now = new Date();

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    
    if (this.structureState.establishments().length === 0) {
        this.structureState.fetchEstablishments();
    }
    this.updateEstablishment();

    if (id) {
      this.loadInvoice(id);
    }
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

  loadInvoice(id: string) {
    this.invoiceService.get_by_id(id).subscribe({
      next: (res: any) => {
        this.invoice.set(res.data);
        this.markAsPrinted(id);
      },
      error: () => this.router.navigate(['/finance/invoices'])
    });
  }

  markAsPrinted(id: string) {
    this.invoiceService.markPrinted(id).subscribe({
        next: (res: any) => {
            if (res.data?.is_duplicate) {
                this.isDuplicate.set(true);
            }
            setTimeout(() => this.print(), 800);
        },
        error: () => {
            // Sécurité : Lance quand même l'impression si le log d'édition échoue
            setTimeout(() => this.print(), 800);
        }
    });
  }

  print() {
    window.print();
  }

  @HostListener('window:afterprint')
  onafterprint() {
    this.close();
  }

  close() {
    this.router.navigate(['/finance/invoices']);
  }
}