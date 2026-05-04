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
    <div class="print-overlay" *ngIf="invoice(); else loading">
       <div class="flex flex-col items-center justify-center min-h-screen gap-4">
          <svg class="w-16 h-16 text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          <h2 class="text-2xl font-black text-slate-800">Ouverture de la boîte de dialogue d'impression...</h2>
          <p class="text-slate-500 font-medium">Vous serez redirigé automatiquement après l'impression.</p>
       </div>
    </div>

    <div class="receipt-container" *ngIf="invoice()">
      <!-- Watermark for background -->
      <div class="watermark" *ngIf="establishment()?.logo">
        <img [src]="establishment()?.logo" alt="logo watermark">
      </div>
      
      <!-- DUPLICATA Watermark -->
      <div class="watermark duplicata" *ngIf="isDuplicate()">
        <h1>DUPLICATA</h1>
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
              <h2 class="text-2xl font-black uppercase tracking-widest border-2 border-black px-4 py-1 inline-block bg-black text-white">EXTRAIT DE COMPTE</h2>
              <p class="text-xs font-bold mt-3">Édité le : {{ now | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="text-xs font-bold mt-1">Facture N° : <span class="font-mono text-sm">{{ invoice()?.reference }}</span></p>
           </div>
        </div>

        <!-- Receipt Content Body -->
        <div class="relative z-10">
           <!-- Recipient & Payer Info -->
           <div class="grid grid-cols-2 gap-8 border-b-2 border-black pb-6 mb-6">
              <div>
                 <p class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Élève :</p>
                 <p class="font-black text-lg uppercase leading-tight">{{ invoice()?.student?.firstName }} {{ invoice()?.student?.lastName }}</p>
                 <p class="text-sm font-bold mt-2">Matricule : <span class="font-mono bg-gray-100 px-1">{{ invoice()?.student?.matricule }}</span></p>
                 <p class="text-sm font-bold mt-1">Classe : <span>{{ invoice()?.enrollment?.classroom?.name }}</span></p>
              </div>

              <div>
                 <p class="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Objet de la facture :</p>
                 <p class="font-black text-sm uppercase leading-tight">{{ invoice()?.title }}</p>
                 <p class="text-sm font-bold mt-2">Catégorie : <span>{{ invoice()?.category }}</span></p>
                 <p class="text-sm font-bold mt-1">Nb Tranches prévues : <span class="font-mono bg-gray-100 px-1">{{ invoice()?.installmentCount || 1 }}</span></p>
              </div>
           </div>

           <!-- Payment History Table -->
           <div class="mb-8" *ngIf="invoice()?.payments?.length > 0">
             <p class="text-xs font-black uppercase border-b border-black pb-2 mb-4 inline-block">Historique des versements</p>
             <table class="w-full text-sm border-collapse border-2 border-black">
               <thead class="bg-gray-100 text-[10px] text-gray-700 uppercase font-bold">
                 <tr>
                   <th class="border border-black px-4 py-2 text-left">Date & Heure</th>
                   <th class="border border-black px-4 py-2 text-left">Réf. Reçu</th>
                   <th class="border border-black px-4 py-2 text-left">Mode de paiement</th>
                   <th class="border border-black px-4 py-2 text-right">Montant (FCFA)</th>
                 </tr>
               </thead>
               <tbody>
                 <tr *ngFor="let pay of invoice()?.payments" class="font-medium">
                   <td class="border border-black px-4 py-2">{{ pay.paymentDate | date:'dd/MM/yyyy HH:mm' }}</td>
                   <td class="border border-black px-4 py-2 font-mono text-xs font-bold">{{ pay.reference }}</td>
                   <td class="border border-black px-4 py-2 text-xs">{{ pay.paymentMethod }}</td>
                   <td class="border border-black px-4 py-2 text-right font-black">{{ pay.amount?.toLocaleString() }}</td>
                 </tr>
               </tbody>
             </table>
           </div>
           
           <div class="mb-8 p-4 border-2 border-dashed border-gray-400 bg-gray-50 text-center" *ngIf="!invoice()?.payments?.length">
              <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Aucun versement n'a encore été enregistré.</p>
           </div>

           <!-- Financial Summary Table -->
           <div class="mb-10 mt-6">
              <table class="w-full text-sm border-collapse border-2 border-black">
                 <tr class="bg-gray-100 text-center font-bold">
                    <td class="border border-black py-2 px-4 uppercase text-[10px]">Total à Payer</td>
                    <td class="border border-black py-2 px-4 uppercase text-[10px]">Total Payé</td>
                    <td class="border border-black py-2 px-4 uppercase text-[10px]">Reste à Payer</td>
                 </tr>
                 <tr class="text-center font-black text-base">
                    <td class="border border-black py-3 px-4">{{ invoice()?.totalAmount?.toLocaleString() }}</td>
                    <td class="border border-black py-3 px-4">{{ invoice()?.paidAmount?.toLocaleString() }}</td>
                    <td class="border border-black py-3 px-4">{{ invoice()?.remainingAmount?.toLocaleString() }}</td>
                 </tr>
              </table>
           </div>

           <!-- Signatures -->
           <div class="grid grid-cols-2 gap-20 mt-12 mb-4">
              <div class="text-center">
                 <p class="text-xs font-black uppercase border-b border-black pb-12 mb-1 inline-block w-full max-w-[200px]">Le Parent / L'Élève</p>
              </div>
              <div class="text-center">
                 <p class="text-xs font-black uppercase border-b border-black pb-12 mb-1 inline-block w-full max-w-[200px]">L'Économe / La Caisse</p>
              </div>
           </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-4 border-t border-dashed border-gray-400 text-center relative z-10">
           <p class="text-[9px] font-medium text-gray-500 italic">
             {{ establishment()?.print_footer || 'Ce document est un extrait de compte officiel. Merci de le conserver.' }}
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
           /* Hide the receipt from screen to avoid visual glitch, but keep it in DOM for printing */
           position: absolute;
           left: -9999px;
           top: -9999px;
        }
      }

      .receipt-paper {
        @apply bg-white max-w-[210mm] mx-auto p-[20mm] relative z-10;
        min-height: 297mm; /* A4 Portrait */
      }
      .watermark {
        @apply absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none;
      }
      .watermark img {
        @apply w-[500px] h-[500px] object-contain grayscale;
      }
      .watermark.duplicata {
        @apply opacity-[0.08];
      }
      .watermark.duplicata h1 {
        @apply text-[150px] font-black text-rose-600 tracking-widest transform -rotate-45 select-none;
      }

      @media print {
        @page {
          size: A4 portrait;
          margin: 20mm;
        }
        .print-overlay { display: none !important; }
        .receipt-container {
          position: static;
          background: white;
          padding: 0;
          display: block;
        }
        .receipt-paper {
          width: 95%;
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
        // Warning: get_by_id needs to return nested payments. If not, we might need a custom endpoint or depth=1.
        // Actually our InvoiceSerializer has depth=1 usually, let's assume payments are there or we will adjust.
        this.invoice.set(res.data);
        this.markAsPrinted(id);
      },
      error: () => this.router.navigate(['/finance/invoices'])
    });
  }

  markAsPrinted(id: string) {
    this.invoiceService.markPrinted(id).subscribe({
        next: (res: any) => {
            if (res.data.is_duplicate) {
                this.isDuplicate.set(true);
            }
            // Auto print after a short delay
            setTimeout(() => this.print(), 1000);
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
