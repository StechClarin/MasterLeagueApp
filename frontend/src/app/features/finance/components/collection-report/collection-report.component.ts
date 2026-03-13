import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';

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
              <label class="text-sm font-medium text-slate-700">Mois de situation</label>
              <input 
                type="month" 
                formControlName="date" 
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
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Encaissement Attendu</p>
            <p class="text-2xl font-black text-slate-900">{{ reportData().totals.total_expected.toLocaleString() }} <span class="text-xs font-medium text-slate-400">FCFA</span></p>
         </div>
         <div class="bg-indigo-600 p-5 rounded-3xl shadow-xl shadow-indigo-100">
            <p class="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Total Perçu</p>
            <p class="text-2xl font-black text-white">{{ reportData().totals.total_paid.toLocaleString() }} <span class="text-xs font-medium text-white/50">FCFA</span></p>
         </div>
         <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reste à Recouvrer</p>
            <p class="text-2xl font-black text-rose-600">{{ reportData().totals.total_due.toLocaleString() }} <span class="text-xs font-medium text-slate-400">FCFA</span></p>
         </div>
         <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Taux de Collecte</p>
            <p class="text-2xl font-black text-indigo-600">{{ reportData().totals.recovery_rate }}%</p>
            <div class="absolute bottom-0 left-0 h-1 bg-indigo-600 transition-all duration-1000" [style.width]="reportData().totals.recovery_rate + '%'"></div>
         </div>
      </div>

      <!-- Zone Imprimable -->
      <div id="print-area" *ngIf="reportData() && !isLoading()" class="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
        <!-- En-tête de l'impression -->
        <div class="flex justify-between items-start mb-10">
          <div>
            <h2 class="text-3xl font-black text-slate-900 uppercase tracking-tighter">État de Recouvrement</h2>
            <div class="flex gap-4 mt-2">
              <span class="text-sm font-bold text-indigo-600">Classe: {{ reportData().classroom_name }}</span>
              <span class="text-sm font-bold text-slate-400 italic">Période de situation: {{ reportData().period }}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-slate-400 uppercase">Émis le</p>
            <p class="text-sm font-bold text-slate-900">{{ today | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>
        </div>

        <!-- Tableau -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-900">
                <th class="py-4 text-left text-xs font-black text-slate-900 uppercase tracking-widest">Matricule</th>
                <th class="py-4 text-left text-xs font-black text-slate-900 uppercase tracking-widest">Nom & Prénoms</th>
                <th class="py-4 text-right text-xs font-black text-slate-900 uppercase tracking-widest">Montant à Payer</th>
                <th class="py-4 text-right text-xs font-black text-slate-900 uppercase tracking-widest">Montant Payé</th>
                <th class="py-4 text-right text-xs font-black text-slate-900 uppercase tracking-widest">Reste Dû</th>
                <th class="py-4 text-center text-xs font-black text-slate-900 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of reportData().items" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-4 text-sm font-mono text-indigo-600 font-bold">{{ item.student.matricule }}</td>
                <td class="py-4 text-sm font-bold text-slate-900 uppercase">{{ item.student.lastName }} {{ item.student.firstName }}</td>
                <td class="py-4 text-sm font-bold text-right text-slate-700">{{ item.expected_amount.toLocaleString() }}</td>
                <td class="py-4 text-sm font-bold text-right text-indigo-600">{{ item.paid_amount.toLocaleString() }}</td>
                <td class="py-4 text-sm font-bold text-right" [class.text-rose-600]="item.due_amount > 0" [class.text-emerald-600]="item.due_amount === 0">
                  {{ item.due_amount.toLocaleString() }}
                </td>
                <td class="py-4 text-center">
                  <span 
                    [class]="'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ' + (item.due_amount === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')">
                    {{ item.due_amount === 0 ? 'En Règle' : 'Reliquat' }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-900 text-white font-bold">
                <td colspan="2" class="py-4 px-6 text-sm uppercase tracking-widest">Totaux de la Classe</td>
                <td class="py-4 text-right text-sm">{{ reportData().totals.total_expected.toLocaleString() }}</td>
                <td class="py-4 text-right text-sm">{{ reportData().totals.total_paid.toLocaleString() }}</td>
                <td class="py-4 text-right text-sm">{{ reportData().totals.total_due.toLocaleString() }}</td>
                <td class="py-4 text-center text-sm">{{ reportData().totals.recovery_rate }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Pied de page Impression -->
        <div class="mt-20 flex justify-between items-end print:mt-10">
          <div class="text-slate-400 text-[10px] italic">
            Document généré par le système de gestion scolaire ALPHA v1.0
          </div>
          <div class="border-t-2 border-slate-900 pt-2 w-64 text-center">
            <p class="text-xs font-black uppercase tracking-widest text-slate-900">Cachet & Signature</p>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="!reportData() && !isLoading()" class="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
         <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
         </div>
         <p class="text-slate-900 font-bold">Sélectionnez une classe et un mois pour générer le bilan.</p>
         <p class="text-slate-400 text-sm">Le calcul tiendra compte du prorata des tranches.</p>
      </div>
    </div>

    <style>
      @media print {
        /* Masquer les éléments d'UI globaux */
        app-sidebar, app-header, .no-print, app-ui-toast, header, nav, aside {
          display: none !important;
        }

        /* Réinitialiser les conteneurs de layout pour l'impression */
        body, .flex, .h-screen, .ml-72, .overflow-hidden, .overflow-y-auto, main {
          display: block !important;
          height: auto !important;
          width: auto !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
        }

        /* Forcer le fond blanc et supprimer les ombres */
        body, .bg-slate-50, .bg-white {
          background-color: white !important;
        }

        /* Ajuster la zone d'impression */
        #print-area {
          display: block !important;
          margin: 0 !important;
          padding: 1cm !important;
          width: 100% !important;
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
          size: landscape;
          margin: 0;
        }
      }
    </style>
  `
})
export class CollectionReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private classroomService = inject(ClassRoomService);
  
  filterForm!: FormGroup;
  classrooms = signal<any[]>([]);
  reportData = signal<any>(null);
  isLoading = signal(false);
  today = new Date();

  ngOnInit() {
    this.initForm();
    this.loadClassrooms();
  }

  initForm() {
    // Par défaut le mois actuel
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    this.filterForm = this.fb.group({
      classroomId: [null, Validators.required],
      date: [currentMonth, Validators.required]
    });
  }

  loadClassrooms() {
    this.classroomService.list().subscribe((items: any[]) => {
      this.classrooms.set(items.map(i => ({ label: i.name, value: i.id })));
    });
  }

  loadReport() {
    if (this.filterForm.invalid) return;
    
    this.isLoading.set(true);
    const val = this.filterForm.value;
    
    // On ajoute -01 pour avoir une date valide (YYYY-MM-01)
    const dateLimit = `${val.date}-01`;
    
    this.paymentService.getCollectionReport(val.classroomId, dateLimit).subscribe({
      next: (res: any) => {
        this.reportData.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  printReport() {
    window.print();
  }
}
