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
             <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0v-2.94a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.94zM21 11.25v.15" />
             </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Préparation de l'impression...</h2>
          <p class="text-sm text-slate-500 max-w-xs">La boîte de dialogue s'ouvre automatiquement. Vous serez redirigé juste après.</p>
       </div>
    </div>

    <!-- Conteneur du Reçu -->
    <div class="receipt-container w-full" *ngIf="invoice()">
      <!-- Filigrane DUPLICATA conditionnel pour l'Original si on le réimprime depuis l'historique -->
      <div class="watermark-duplicata" *ngIf="isDuplicate()"><span>RÉIMPRESSION</span></div>
      <ng-container *ngTemplateOutlet="receiptBlock; context: { type: 'ORIGINAL', souche: 'Original' }"></ng-container>
    </div>

    <!-- TEMPLATE DU REÇU -->
    <ng-template #receiptBlock let-type="type" let-souche="souche">
      <div class="receipt-paper flex flex-col p-8 min-h-[50vh]">
        
        <!-- En-tête : Identification de l'établissement -->
        <div class="flex justify-between items-start border-b border-slate-300 pb-3 mb-4 relative z-10">
           <div class="flex gap-3 items-center">
              <img *ngIf="invoice()?.establishment?.logo" [src]="invoice()?.establishment?.logo" class="w-12 h-12 object-contain" alt="logo">
              <div>
                 <h1 class="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{{ invoice()?.establishment?.name }}</h1>
                 <p class="text-[9px] uppercase font-semibold text-indigo-600 tracking-wider mt-1 mb-1" *ngIf="invoice()?.establishment?.slogan">« {{ invoice()?.establishment?.slogan }} »</p>
                 <div class="text-[10px] text-slate-600 space-y-0.5 mt-1 font-medium">
                    <p>{{ invoice()?.establishment?.address }}</p>
                    <p><span class="text-slate-400">Tél :</span> {{ invoice()?.establishment?.phone }}</p>
                 </div>
              </div>
           </div>
           <div class="text-right">
              <div class="text-xs font-black uppercase tracking-widest text-white px-3 py-1 rounded mb-1 inline-block"
                   [ngClass]="type === 'ORIGINAL' ? 'bg-indigo-700' : 'bg-slate-700'">
                 {{ type === 'ORIGINAL' ? 'Extrait de compte' : 'Duplicata' }}
              </div>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{{ souche }}</p>
              <p class="text-[10px] text-slate-500 font-medium">Édité le : <span class="text-slate-800 font-semibold">{{ now | date:'dd/MM/yyyy HH:mm' }}</span></p>
              <p class="text-[10px] text-slate-500 font-medium mt-0.5">Facture N° : <span class="font-mono font-bold text-slate-900 bg-slate-100 px-1 py-0.5 rounded">{{ invoice()?.reference }}</span></p>
           </div>
        </div>

        <!-- Corps du document -->
        <div class="relative z-10 flex-1 flex flex-col">
           
           <!-- Informations Élève & Objet -->
           <div class="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
              <div class="border-r border-slate-200 pr-2">
                 <span class="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Élève</span>
                 <p class="font-bold text-xs text-slate-900 uppercase leading-tight">{{ invoice()?.student?.firstName }} {{ invoice()?.student?.lastName }}</p>
                 <div class="text-[10px] text-slate-600 space-y-0.5 mt-1 font-medium">
                    <p>Matricule : <span class="font-mono font-bold text-slate-900">{{ invoice()?.student?.matricule }}</span></p>
                    <p>Classe : <span class="text-slate-900 font-semibold">{{ invoice()?.enrollment?.classroom?.name }}</span></p>
                 </div>
              </div>

              <div class="pl-2">
                 <span class="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Détails de la Facture</span>
                 <p class="font-bold text-xs text-slate-900 uppercase truncate leading-tight">{{ invoice()?.title }}</p>
                 <div class="text-[10px] text-slate-600 space-y-0.5 mt-1 font-medium">
                    <p>Catégorie : <span class="text-slate-900 font-semibold">{{ invoice()?.category }}</span></p>
                    <p>Tranches : <span class="font-mono font-bold text-slate-900">{{ invoice()?.installmentCount || 1 }}</span></p>
                 </div>
              </div>
           </div>

           <!-- Synthèse Financière (Tableau Récapitulatif) -->
           <div class="mb-4">
              <table class="w-full text-[10px] border border-slate-200 rounded-lg overflow-hidden">
                 <thead class="bg-slate-800 text-slate-200 font-bold text-center uppercase tracking-wider">
                    <tr>
                       <th class="py-1.5 px-3 border-r border-slate-700">Total à Payer</th>
                       <th class="py-1.5 px-3 border-r border-slate-700">Total Payé</th>
                       <th class="py-1.5 px-3 bg-indigo-900 text-white">Reste à Payer</th>
                    </tr>
                 </thead>
                 <tbody class="text-center font-bold text-xs text-slate-900 divide-x divide-slate-200">
                    <tr>
                       <td class="py-2 px-3 bg-slate-50">{{ invoice()?.total_amount?.toLocaleString() }}</td>
                       <td class="py-2 px-3 bg-slate-50 text-emerald-600">{{ invoice()?.paid_amount?.toLocaleString() }}</td>
                       <td class="py-2 px-3 bg-indigo-50 text-indigo-700 font-black text-sm">
                          {{ (+invoice()?.total_amount - +invoice()?.paid_amount).toLocaleString() }}
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>

           <!-- Historique des versements (Tableau) -->
           <div class="mb-4 flex-1" *ngIf="invoice()?.payments?.length > 0">
             <h3 class="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span class="w-1.5 h-2.5 bg-indigo-600 rounded-sm"></span> Historique des versements
             </h3>
             <table class="w-full text-[9px] text-left border border-slate-200 rounded-lg overflow-hidden">
               <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                 <tr>
                   <th class="px-3 py-1.5">Date & Heure</th>
                   <th class="px-3 py-1.5">Réf. Reçu</th>
                   <th class="px-3 py-1.5">Mode</th>
                   <th class="px-3 py-1.5 text-right">Montant (FCFA)</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-100 text-slate-700 font-medium">
                 <!-- Affichage complet des versements (plus de limite) -->
                 <tr *ngFor="let pay of invoice()?.payments">
                   <td class="px-3 py-1.5 whitespace-nowrap">{{ $any(pay).payment_date | date:'dd/MM/yyyy HH:mm' }}</td>
                   <td class="px-3 py-1.5 font-mono text-slate-900 font-semibold">{{ $any(pay).reference }}</td>
                   <td class="px-3 py-1.5 text-slate-500">{{ $any(pay).payment_method }}</td>
                   <td class="px-3 py-1.5 text-right font-bold text-slate-900">{{ $any(pay).amount?.toLocaleString() }}</td>
                 </tr>
               </tbody>
             </table>
           </div>
           
           <!-- État vide si aucun paiement -->
           <div class="mb-4 flex-1 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center" *ngIf="!invoice()?.payments?.length">
              <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aucun versement n'a encore été enregistré.</p>
           </div>

           <!-- Zone des Signatures -->
           <div class="grid grid-cols-2 gap-8 mt-2 mb-2">
              <div class="text-center">
                 <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-8">Le Parent / L'Élève</p>
                 <div class="w-32 border-b border-dashed border-slate-300 mx-auto"></div>
              </div>
              <div class="text-center">
                 <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-8">L'Économe / La Caisse</p>
                 <div class="w-32 border-b border-dashed border-slate-300 mx-auto"></div>
              </div>
           </div>
        </div>

        <!-- Pied de page -->
        <div class="mt-2 pt-2 border-t border-dashed border-slate-200 text-center relative z-10">
           <p class="text-[9px] font-medium text-slate-400 italic">
             {{ establishment()?.print_footer || 'Ce document est un extrait de compte officiel. Merci de le conserver.' }}
           </p>
           <p class="text-[8px] text-slate-300 font-mono tracking-widest uppercase mt-1">
              Généré par Yekola ERP • {{ now | date:'dd/MM/yyyy HH:mm' }}
           </p>
        </div>
      </div>
    </ng-template>

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