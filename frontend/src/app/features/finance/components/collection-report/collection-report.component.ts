import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';

import { StructureStateService } from '@core/services/structure-state.service';

@Component({
  selector: 'app-collection-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiSelectComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="p-6 bg-slate-50 min-h-screen">
      <!-- Header avec Filtres (Non imprimable) -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 no-print">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">État de Recouvrement</h1>
            <p class="text-slate-500 text-sm">Suivi des encaissements théoriques vs réels par classe.</p>
          </div>
          
          <form [formGroup]="filterForm" class="flex flex-wrap items-end gap-4">
            <app-ui-select 
              label="Classe" 
              formControlName="classroomId" 
              [options]="classrooms()" 
              class="w-64">
            </app-ui-select>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-slate-700">Du</label>
              <input 
                type="date" 
                formControlName="startDate" 
                class="h-[42px] px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-slate-700">Au</label>
              <input 
                type="date" 
                formControlName="endDate" 
                class="h-[42px] px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm">
            </div>

            <button 
              (click)="loadReport()"
              [disabled]="filterForm.invalid || isLoading()"
              class="h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
              <span *ngIf="isLoading()" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
              Générer l'état
            </button>

            <button 
              *ngIf="reportData()"
              (click)="printReport()"
              class="h-[42px] px-6 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Imprimer
            </button>
          </form>
        </div>
      </div>

      <!-- États des KPIs (Non imprimable) -->
      <div *ngIf="reportData() && !isLoading()" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 no-print">
         <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Attendu Période</p>
            <p class="text-2xl font-black text-slate-900">{{ reportData().totals.total_expected_period.toLocaleString() }} <span class="text-xs font-medium text-slate-400">FCFA</span></p>
         </div>
         <div class="bg-emerald-600 p-5 rounded-3xl shadow-xl shadow-emerald-100">
            <p class="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Encaissé Période</p>
            <p class="text-2xl font-black text-white">{{ reportData().totals.total_paid_period.toLocaleString() }} <span class="text-xs font-medium text-white/50">FCFA</span></p>
         </div>
         <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reste à Recouvrer (Global)</p>
            <p class="text-2xl font-black text-rose-600">{{ reportData().totals.total_remaining_global.toLocaleString() }} <span class="text-xs font-medium text-slate-400">FCFA</span></p>
         </div>
         <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Taux de Collecte (Période)</p>
            <p class="text-2xl font-black text-indigo-600">{{ reportData().totals.recovery_rate }}%</p>
            <div class="absolute bottom-0 left-0 h-1 bg-indigo-600 transition-all duration-1000" [style.width]="reportData().totals.recovery_rate + '%'"></div>
         </div>
      </div>

      <!-- Zone Imprimable -->
      <div id="print-area" *ngIf="reportData() && !isLoading()" class="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
        <!-- En-tête Établissement (Pro) -->
        <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6 relative z-10 hidden print:flex">
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
              <h2 class="text-2xl font-black uppercase tracking-widest border-2 border-black px-4 py-1 inline-block bg-black text-white">ÉTAT DE RECOUVREMENT</h2>
              <p class="text-xs font-bold mt-3">Édité le : {{ today | date:'dd/MM/yyyy HH:mm' }}</p>
           </div>
        </div>

        <!-- En-tête de l'impression (Classique pour l'écran, fusionné en Pro) -->
        <div class="flex justify-between items-start mb-6 print:hidden">
          <div>
            <h2 class="text-3xl font-black text-slate-900 uppercase tracking-tighter">État de Recouvrement</h2>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-slate-400 uppercase">Émis le</p>
            <p class="text-sm font-bold text-slate-900">{{ today | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
        </div>
        
        <!-- Info Classe et Période -->
        <div class="flex flex-col gap-1 mb-6 border-2 border-black p-4 bg-gray-50 print:bg-white">
           <div class="grid grid-cols-2 gap-4">
               <div>
                  <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Classe / Niveau</span>
                  <p class="text-lg font-black text-black uppercase">{{ reportData().classroom_name }}</p>
               </div>
               <div class="text-right">
                  <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Période analysée</span>
                  <p class="text-lg font-black text-black">Du <span class="font-mono">{{ reportData().start_date }}</span> au <span class="font-mono">{{ reportData().end_date }}</span></p>
               </div>
           </div>
        </div>

        <!-- Tableau Professionnel -->
        <div class="mb-8 overflow-x-auto">
          <table class="w-full text-[11px] border-collapse border-2 border-black print:text-[9px]">
            <thead class="bg-gray-100 text-gray-700 uppercase font-black">
              <tr>
                <th class="border border-black px-2 py-2 text-left" rowspan="2">Matricule</th>
                <th class="border border-black px-2 py-2 text-left" rowspan="2">Nom & Prénoms</th>
                <th class="border border-black px-2 py-1 text-center bg-gray-200" colspan="2">Annuel (Global)</th>
                <th class="border border-black px-2 py-1 text-center bg-gray-50" colspan="3">Période Analysée</th>
                <th class="border border-black px-2 py-2 text-right" rowspan="2">Reste Global</th>
                <th class="border border-black px-2 py-2 text-center" rowspan="2">À Jour</th>
              </tr>
              <tr>
                <th class="border border-black px-2 py-1 text-right bg-gray-200">Scolarité</th>
                <th class="border border-black px-2 py-1 text-right bg-gray-200">Déjà Payé</th>
                <th class="border border-black px-2 py-1 text-right bg-gray-50">Attendu</th>
                <th class="border border-black px-2 py-1 text-right bg-gray-50">Encaissé</th>
                <th class="border border-black px-2 py-1 text-right bg-gray-50">Reste (Pér.)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of reportData().items" class="font-medium hover:bg-slate-50 transition-colors">
                <td class="border border-black px-2 py-1.5 font-mono text-gray-700 font-bold whitespace-nowrap">{{ item.student.matricule }}</td>
                <td class="border border-black px-2 py-1.5 font-bold uppercase whitespace-nowrap">{{ item.student.lastName }} {{ item.student.firstName }}</td>
                
                <!-- Annuel -->
                <td class="border border-black px-2 py-1.5 text-right font-bold text-gray-600 bg-gray-100/50">{{ item.total_expected_global.toLocaleString() }}</td>
                <td class="border border-black px-2 py-1.5 text-right font-black text-emerald-700 bg-emerald-50/50">{{ item.total_paid_global.toLocaleString() }}</td>
                
                <!-- Période -->
                <td class="border border-black px-2 py-1.5 text-right font-bold">{{ item.expected_period.toLocaleString() }}</td>
                <td class="border border-black px-2 py-1.5 text-right font-black text-emerald-600">{{ item.paid_period.toLocaleString() }}</td>
                <td class="border border-black px-2 py-1.5 text-right font-bold" [class.text-red-600]="item.due_balance > 0">
                  {{ item.due_balance.toLocaleString() }}
                </td>

                <!-- Fin -->
                <td class="border border-black px-2 py-1.5 text-right font-black bg-gray-100/50" [class.text-red-600]="item.remaining_global > 0">
                  {{ item.remaining_global.toLocaleString() }}
                </td>
                <td class="border border-black px-2 py-1.5 text-center">
                  <span *ngIf="item.is_up_to_date" class="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[9px] uppercase rounded-sm print:bg-white print:border-none print:text-black">OUI</span>
                  <span *ngIf="!item.is_up_to_date" class="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold text-[9px] uppercase rounded-sm print:bg-white print:border-none print:text-black">NON</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-black text-white font-black text-[12px] print:text-[10px]">
                <td colspan="2" class="border border-black py-2 px-2 uppercase tracking-widest text-center">Totaux de la Classe</td>
                <td class="border border-black py-2 px-2 text-right">{{ reportData().totals.total_expected_global.toLocaleString() }}</td>
                <td class="border border-black py-2 px-2 text-right text-emerald-300">{{ reportData().totals.total_paid_global.toLocaleString() }}</td>
                <td class="border border-black py-2 px-2 text-right">{{ reportData().totals.total_expected_period.toLocaleString() }}</td>
                <td class="border border-black py-2 px-2 text-right text-emerald-300">{{ reportData().totals.total_paid_period.toLocaleString() }}</td>
                <td class="border border-black py-2 px-2 text-right text-red-300">{{ reportData().totals.total_remaining_period.toLocaleString() }}</td>
                <td class="border border-black py-2 px-2 text-right text-red-300">{{ reportData().totals.total_remaining_global.toLocaleString() }}</td>
                <td class="border border-black py-2 px-2 text-center text-emerald-300">{{ reportData().totals.recovery_rate }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Pied de page Impression -->
        <div class="mt-12 pt-4 border-t border-dashed border-gray-400 text-center relative z-10 hidden print:block">
           <div class="flex justify-between items-start mb-12 px-10">
              <div class="text-center">
                 <p class="text-xs font-black uppercase border-b border-black pb-8 mb-1 inline-block w-full max-w-[200px]">Visa Direction</p>
              </div>
              <div class="text-center">
                 <p class="text-xs font-black uppercase border-b border-black pb-8 mb-1 inline-block w-full max-w-[200px]">L'Économe / Caisse</p>
              </div>
           </div>
           <p class="text-[9px] text-gray-400 font-mono uppercase tracking-tighter">Généré par Yekola ERP • {{ today | date:'dd/MM/yyyy HH:mm' }} • Taux de recouvrement: {{ reportData().totals.recovery_rate }}%</p>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="!reportData() && !isLoading()" class="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
         <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
         </div>
         <p class="text-slate-900 font-bold">Sélectionnez une classe et une période pour générer le bilan.</p>
         <p class="text-slate-400 text-sm">Le calcul analyse les flux financiers entre les deux dates choisies (frais obligatoires uniquement).</p>
      </div>
    </div>

    <style>
      @media print {
        /* Forcer l'impression des couleurs d'arrière-plan */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Masquer les éléments d'UI globaux */
        app-sidebar, app-header, .no-print, app-ui-toast, header, nav, aside {
          display: none !important;
        }

        /* Réinitialiser les conteneurs de layout pour l'impression */
        body, main, app-layout, .h-screen, .min-h-screen, .ml-72, .overflow-hidden, .overflow-y-auto {
          display: block !important;
          height: auto !important;
          min-height: 0 !important;
          width: auto !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
        }

        .p-6 {
          padding: 0 !important;
        }

        /* Forcer le fond blanc et supprimer les ombres */
        body, .bg-slate-50, .bg-white {
          background-color: white !important;
        }

        /* Ajuster la zone d'impression */
        #print-area {
          display: block !important;
          margin: 0 auto !important;
          padding: 0 !important;
          width: 95% !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Ajuster le tableau pour qu'il ne soit pas coupé */
        table {
          width: 100% !important;
          page-break-inside: auto;
        }
        
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        @page {
          size: A4 portrait;
          margin: 10mm;
        }
      }
    </style>
  `
})
export class CollectionReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private classroomService = inject(ClassRoomService);
  private structureState = inject(StructureStateService);
  
  filterForm!: FormGroup;
  classrooms = signal<any[]>([]);
  reportData = signal<any>(null);
  isLoading = signal(false);
  today = new Date();
  establishment = signal<any>(null);

  ngOnInit() {
    this.initForm();
    this.loadClassrooms();
    
    // Fetch establishment for print layout
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


  initForm() {
    const now = new Date();
    // Premier jour du mois
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    // Aujourd'hui
    const today = now.toISOString().split('T')[0];
    
    this.filterForm = this.fb.group({
      classroomId: [null, Validators.required],
      startDate: [firstDay, Validators.required],
      endDate: [today, Validators.required]
    });
  }

  loadClassrooms() {
    this.classroomService.list().subscribe((items: any[]) => {
      this.classrooms.set(items.map(i => ({ label: i.name, value: i.id })));
    });
  }

  loadReport() {
    console.log('Load Report Triggered');
    console.log('Form Validity:', this.filterForm.valid);
    console.log('Form Values:', this.filterForm.value);

    if (this.filterForm.invalid) {
      console.warn('Form is invalid, stopping loadReport');
      return;
    }
    
    this.isLoading.set(true);
    const val = this.filterForm.value;
    
    this.paymentService.getCollectionReport(val.classroomId, val.startDate, val.endDate).subscribe({
      next: (res: any) => {
        console.log('Report Data Received:', res);
        this.reportData.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Report Loading Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  printReport() {
    window.print();
  }
}
