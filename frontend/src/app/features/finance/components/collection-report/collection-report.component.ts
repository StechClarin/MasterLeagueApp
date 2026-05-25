import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
  selector: 'app-collection-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiSelectComponent, DatePipe],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="p-6 bg-slate-50 min-h-screen font-sans">
      
      <!-- ÉCRAN: Section Filtres (Masqué à l'impression) -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 no-print">
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">État de Recouvrement</h1>
            <p class="text-slate-500 text-sm mt-0.5">Analyse croisée des flux financiers, encaissements théoriques et réels.</p>
          </div>
          
          <form [formGroup]="filterForm" class="flex flex-wrap items-end gap-4 w-full xl:w-auto">
            <app-ui-select 
              label="Classe / Niveau" 
              formControlName="classroomId" 
              [options]="classrooms()" 
              class="w-full sm:w-64">
            </app-ui-select>

            <div class="flex flex-col gap-1 w-full sm:w-auto">
              <label class="text-xs font-bold text-slate-600 uppercase tracking-wider">Date de début</label>
              <input 
                type="date" 
                formControlName="startDate" 
                class="h-[42px] px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 bg-slate-50/50">
            </div>

            <div class="flex flex-col gap-1 w-full sm:w-auto">
              <label class="text-xs font-bold text-slate-600 uppercase tracking-wider">Date de fin</label>
              <input 
                type="date" 
                formControlName="endDate" 
                class="h-[42px] px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 bg-slate-50/50">
            </div>

            <div class="flex gap-3 w-full sm:w-auto pt-2 sm:pt-0">
              <button 
                (click)="loadReport()"
                [disabled]="filterForm.invalid || isLoading()"
                class="flex-1 sm:flex-none h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2">
                <span *ngIf="isLoading()" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                Générer l'état
              </button>

              <button 
                *ngIf="reportData()"
                (click)="printReport()"
                class="h-[42px] px-5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Imprimer
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ÉCRAN: Tableau de Bord KPIs (Masqué à l'impression) -->
      <div *ngIf="reportData() && !isLoading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 no-print">
         <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Attendu Période</p>
               <p class="text-2xl font-black text-slate-900">{{ reportData().totals.total_expected_period.toLocaleString() }} <span class="text-xs font-bold text-slate-400">FCFA</span></p>
            </div>
            <div class="p-3 bg-slate-50 text-slate-500 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg></div>
         </div>
         
         <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Encaissé Période</p>
               <p class="text-2xl font-black text-emerald-600">{{ reportData().totals.total_paid_period.toLocaleString() }} <span class="text-xs font-bold text-emerald-400">FCFA</span></p>
            </div>
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
         </div>

         <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Solde Restant Global</p>
               <p class="text-2xl font-black text-rose-600">{{ reportData().totals.total_remaining_global.toLocaleString() }} <span class="text-xs font-bold text-rose-400">FCFA</span></p>
            </div>
            <div class="p-3 bg-rose-50 text-rose-600 rounded-xl"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></div>
         </div>

         <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div class="flex justify-between items-start">
               <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Taux de Collecte</p>
                  <p class="text-2xl font-black text-indigo-600">{{ reportData().totals.recovery_rate }}%</p>
               </div>
               <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold font-mono">{{ reportData().totals.recovery_rate }}%</div>
            </div>
            <div class="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
               <div class="h-full bg-indigo-600 rounded-full transition-all duration-1000" [style.width]="reportData().totals.recovery_rate + '%'"></div>
            </div>
         </div>
      </div>

      <!-- DOCUMENT / ZONE IMPRIMABLE -->
      <div id="print-area" *ngIf="reportData() && !isLoading()" class="bg-white p-8 xl:p-12 rounded-3xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
        
        <!-- EN-TÊTE PRO: Marque de l'établissement (Visible au Print) -->
        <div class="justify-between items-start border-b border-slate-300 pb-5 mb-6 relative z-10 hidden print:flex">
           <div class="flex gap-4 items-center">
              <img *ngIf="establishment()?.logo" [src]="establishment()?.logo" class="w-14 h-14 object-contain" alt="logo">
              <div>
                 <h1 class="text-lg font-black tracking-tight text-slate-900 uppercase leading-none">{{ establishment()?.name }}</h1>
                 <p class="text-[9px] uppercase font-semibold text-indigo-600 tracking-wider mt-1 mb-1.5" *ngIf="establishment()?.slogan">« {{ establishment()?.slogan }} »</p>
                 <div class="text-[11px] text-slate-500 space-y-0.5 font-medium">
                    <p>{{ establishment()?.address }} — {{ establishment()?.city }}</p>
                    <p>Tél: {{ establishment()?.phone }} <span class="mx-1" *ngIf="establishment()?.email">•</span> {{ establishment()?.email }}</p>
                 </div>
              </div>
           </div>
           <div class="text-right">
              <div class="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1.5 rounded mb-3 inline-block">
                 État de Recouvrement
              </div>
              <p class="text-[11px] text-slate-500 font-medium">Édité le : <span class="text-slate-800 font-semibold">{{ today | date:'dd/MM/yyyy à HH:mm' }}</span></p>
           </div>
        </div>

        <!-- EN-TÊTE ÉCRAN (Alternative épurée) -->
        <div class="flex justify-between items-baseline mb-6 print:hidden">
          <h2 class="text-lg font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
             <span class="w-2 h-4 bg-indigo-600 rounded-sm"></span>Registre d'analyse financière
          </h2>
          <span class="text-xs font-medium text-slate-400 font-mono">Date d'édition : {{ today | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        
        <!-- Fiche descriptive des critères -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 print:bg-white print:border-slate-300">
           <div class="grid grid-cols-2 gap-4">
               <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Classe / Niveau concerné</span>
                  <p class="text-base font-black text-slate-900 uppercase">{{ reportData().classroom_name }}</p>
               </div>
               <div class="text-right">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Période comptable analysée</span>
                  <p class="text-sm font-bold text-slate-800">Du <span class="font-mono text-slate-900">{{ reportData().start_date }}</span> au <span class="font-mono text-slate-900">{{ reportData().end_date }}</span></p>
               </div>
           </div>
        </div>

        <!-- TABLEAU FINANCIER CORPORATE -->
        <div class="mb-8 overflow-x-auto rounded-xl border border-slate-200 print:border-slate-300">
          <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-3 py-3 border-r border-slate-200 font-black" rowspan="2" *ngIf="!reportData().is_global">Matricule</th>
                <th class="px-3 py-3 border-r border-slate-200 font-black" rowspan="2">{{ reportData().is_global ? 'Nom de la Classe' : 'Nom & Prénoms' }}</th>
                <th class="px-3 py-1.5 text-center bg-slate-100/60 border-r border-slate-200" colspan="2">Bilan Annuel (Global)</th>
                <th class="px-3 py-1.5 text-center bg-indigo-50/40 border-r border-slate-200 text-indigo-900" colspan="3">Activité de la Période</th>
                <th class="px-3 py-3 border-r border-slate-200 text-right font-black" rowspan="2">Solde Global</th>
                <th class="px-3 py-3 text-center font-black" rowspan="2">Régularité</th>
              </tr>
              <tr class="border-t border-slate-200">
                <th class="px-3 py-2 text-right bg-slate-100/40 border-r border-slate-200 font-medium">Attendu</th>
                <th class="px-3 py-2 text-right bg-slate-100/40 border-r border-slate-200 font-medium text-emerald-700">Encaissé</th>
                <th class="px-3 py-2 text-right bg-indigo-50/20 border-r border-slate-200 font-medium text-indigo-950">Dû</th>
                <th class="px-3 py-2 text-right bg-indigo-50/20 border-r border-slate-200 font-medium text-emerald-600">Perçu</th>
                <th class="px-3 py-2 text-right bg-indigo-50/20 border-r border-slate-200 font-medium">Reste</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-700 font-medium">
              <!-- Vue par Elève (is_global: false) -->
              <ng-container *ngIf="!reportData().is_global">
                 <tr *ngFor="let item of reportData().items" class="hover:bg-slate-50/60 transition-colors">
                   <td class="px-3 py-2.5 font-mono text-slate-900 font-bold whitespace-nowrap border-r border-slate-150">{{ item.student.matricule }}</td>
                   <td class="px-3 py-2.5 font-semibold text-slate-900 uppercase whitespace-nowrap border-r border-slate-150 max-w-[180px] truncate">
                      {{ item.student.lastName }} {{ item.student.firstName }}
                   </td>
                   
                   <!-- Annuel -->
                   <td class="px-3 py-2.5 text-right font-semibold text-slate-500 bg-slate-50/30 border-r border-slate-150">{{ item.total_expected_global.toLocaleString() }}</td>
                   <td class="px-3 py-2.5 text-right font-bold text-emerald-600 bg-emerald-50/20 border-r border-slate-150">{{ item.total_paid_global.toLocaleString() }}</td>
                   
                   <!-- Période -->
                   <td class="px-3 py-2.5 text-right font-semibold text-slate-600 border-r border-slate-150">{{ item.expected_period.toLocaleString() }}</td>
                   <td class="px-3 py-2.5 text-right font-bold text-emerald-600 border-r border-slate-150">{{ item.paid_period.toLocaleString() }}</td>
                   <td class="px-3 py-2.5 text-right font-bold border-r border-slate-150" [class.text-rose-600]="item.due_balance > 0">
                     {{ item.due_balance.toLocaleString() }}
                   </td>

                   <!-- Restes & Statuts -->
                   <td class="px-3 py-2.5 text-right font-black border-r border-slate-150 bg-slate-50/30" [class.text-rose-600]="item.remaining_global > 0">
                     {{ item.remaining_global.toLocaleString() }}
                   </td>
                   <td class="px-3 py-2.5 text-center whitespace-nowrap">
                     <span *ngIf="item.is_up_to_date" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase print:border-none print:text-black">
                        <span class="w-1 h-1 rounded-full bg-emerald-500 print:hidden"></span> Solvable
                     </span>
                     <span *ngIf="!item.is_up_to_date" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase print:border-none print:text-black">
                        <span class="w-1 h-1 rounded-full bg-amber-500 print:hidden"></span> Reliquat
                     </span>
                   </td>
                 </tr>
              </ng-container>

              <!-- Vue par Classe (is_global: true) -->
              <ng-container *ngIf="reportData().is_global">
                 <tr *ngFor="let item of reportData().items" class="hover:bg-slate-50/60 transition-colors">
                   <td class="px-3 py-2.5 font-black text-indigo-900 uppercase whitespace-nowrap border-r border-slate-150">
                      {{ item.classroom_name }}
                   </td>
                   
                   <!-- Annuel -->
                   <td class="px-3 py-2.5 text-right font-semibold text-slate-500 bg-slate-50/30 border-r border-slate-150">{{ item.total_expected_global.toLocaleString() }}</td>
                   <td class="px-3 py-2.5 text-right font-bold text-emerald-600 bg-emerald-50/20 border-r border-slate-150">{{ item.total_paid_global.toLocaleString() }}</td>
                   
                   <!-- Période -->
                   <td class="px-3 py-2.5 text-right font-semibold text-slate-600 border-r border-slate-150">{{ item.expected_period.toLocaleString() }}</td>
                   <td class="px-3 py-2.5 text-right font-bold text-emerald-600 border-r border-slate-150">{{ item.paid_period.toLocaleString() }}</td>
                   <td class="px-3 py-2.5 text-right font-bold border-r border-slate-150" [class.text-rose-600]="item.due_balance > 0">
                     {{ item.due_balance.toLocaleString() }}
                   </td>

                   <!-- Restes & Statuts -->
                   <td class="px-3 py-2.5 text-right font-black border-r border-slate-150 bg-slate-50/30" [class.text-rose-600]="item.remaining_global > 0">
                     {{ item.remaining_global.toLocaleString() }}
                   </td>
                   <td class="px-3 py-2.5 text-center whitespace-nowrap">
                     <span *ngIf="item.is_up_to_date" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase print:border-none print:text-black">
                        <span class="w-1 h-1 rounded-full bg-emerald-500 print:hidden"></span> OK
                     </span>
                     <span *ngIf="!item.is_up_to_date" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold uppercase print:border-none print:text-black">
                        <span class="w-1 h-1 rounded-full bg-rose-500 print:hidden"></span> Déficit
                     </span>
                   </td>
                 </tr>
              </ng-container>
            </tbody>
            
            <!-- Totaux Généraux Récapitulatifs -->
            <tfoot>
              <tr class="bg-slate-900 text-white font-bold text-[11px] divide-x divide-slate-800">
                <td [attr.colspan]="reportData().is_global ? 1 : 2" class="py-3 px-3 uppercase tracking-wider text-center font-black">Totaux Synthèse</td>
                <td class="py-3 px-3 text-right bg-slate-900/90">{{ reportData().totals.total_expected_global.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-emerald-400 bg-slate-900/90">{{ reportData().totals.total_paid_global.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right bg-slate-850">{{ reportData().totals.total_expected_period.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-emerald-400 bg-slate-850">{{ reportData().totals.total_paid_period.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-rose-400 bg-slate-850">{{ reportData().totals.total_remaining_period.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-rose-400 bg-slate-900/90">{{ reportData().totals.total_remaining_global.toLocaleString() }}</td>
                <td class="py-3 px-3 text-center text-indigo-400 font-black bg-slate-950">{{ reportData().totals.recovery_rate }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Bilan des Frais Non Obligatoires (Optionnels) -->
        <div class="mb-8 overflow-x-auto rounded-xl border border-slate-200 print:border-slate-300" *ngIf="reportData().totals.opt_total_expected_global > 0">
           <h3 class="text-sm font-bold text-slate-800 uppercase bg-slate-100 p-3 border-b border-slate-200">Bilan des Frais Optionnels (Non Obligatoires)</h3>
           <table class="w-full text-xs text-left border-collapse">
            <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-3 py-3 border-r border-slate-200" *ngIf="!reportData().is_global">Matricule</th>
                <th class="px-3 py-3 border-r border-slate-200">{{ reportData().is_global ? 'Nom de la Classe' : 'Nom & Prénoms' }}</th>
                <th class="px-3 py-2 text-right bg-slate-100/40 border-r border-slate-200 font-medium">Attendu Période</th>
                <th class="px-3 py-2 text-right bg-slate-100/40 border-r border-slate-200 font-medium text-emerald-700">Encaissé Période</th>
                <th class="px-3 py-2 text-right bg-indigo-50/20 border-r border-slate-200 font-medium text-rose-600">Reste Période</th>
                <th class="px-3 py-2 text-right bg-indigo-50/20 border-r border-slate-200 font-medium text-indigo-950">Solde Dû Global</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-700 font-medium">
               <tr *ngFor="let item of reportData().items" class="hover:bg-slate-50/60 transition-colors">
                  <td *ngIf="!reportData().is_global" class="px-3 py-2.5 font-mono text-slate-900 font-bold border-r border-slate-150">{{ item.student.matricule }}</td>
                  <td class="px-3 py-2.5 font-semibold text-slate-900 uppercase border-r border-slate-150">
                      <ng-container *ngIf="reportData().is_global">{{ item.classroom_name }}</ng-container>
                      <ng-container *ngIf="!reportData().is_global">{{ item.student.lastName }} {{ item.student.firstName }}</ng-container>
                  </td>
                  <td class="px-3 py-2.5 text-right font-semibold text-slate-600 border-r border-slate-150">{{ item.opt_expected_period.toLocaleString() }}</td>
                  <td class="px-3 py-2.5 text-right font-bold text-emerald-600 border-r border-slate-150">{{ item.opt_paid_period.toLocaleString() }}</td>
                  <td class="px-3 py-2.5 text-right font-bold text-rose-600 border-r border-slate-150">{{ item.opt_due_balance.toLocaleString() }}</td>
                  <td class="px-3 py-2.5 text-right font-black border-r border-slate-150 bg-slate-50/30">{{ item.opt_remaining_global.toLocaleString() }}</td>
               </tr>
            </tbody>
            <tfoot>
              <tr class="bg-slate-900 text-white font-bold text-[11px] divide-x divide-slate-800">
                <td [attr.colspan]="reportData().is_global ? 1 : 2" class="py-3 px-3 uppercase tracking-wider text-center font-black">Totaux Optionnels</td>
                <td class="py-3 px-3 text-right bg-slate-900/90">{{ reportData().totals.opt_total_expected_period.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-emerald-400 bg-slate-900/90">{{ reportData().totals.opt_total_paid_period.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-rose-400 bg-slate-850">{{ reportData().totals.opt_total_remaining_period.toLocaleString() }}</td>
                <td class="py-3 px-3 text-right text-rose-400 bg-slate-900/90">{{ reportData().totals.opt_total_remaining_global.toLocaleString() }}</td>
              </tr>
            </tfoot>
           </table>
        </div>        <!-- PIED DE PAGE: Visas administratifs (Visible uniquement au Print) -->
        <div class="mt-12 pt-5 border-t border-dashed border-slate-300 text-center relative z-10 hidden print:block">
           <div class="grid grid-cols-2 gap-20 mb-16 px-6">
              <div class="text-center">
                 <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-14">Visa de la Direction</p>
                 <div class="w-40 border-b border-dashed border-slate-300 mx-auto"></div>
              </div>
              <div class="text-center">
                 <p class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-14">L'Économe / La Caisse</p>
                 <div class="w-40 border-b border-dashed border-slate-300 mx-auto"></div>
              </div>
           </div>
           <p class="text-[8px] text-slate-400 font-mono uppercase tracking-widest">
              Généré par Yekola ERP • Global Recovery Rate : {{ reportData().totals.recovery_rate }}%
           </p>
        </div>
      </div>

      <!-- ÉCRAN: Vue d'attente (Empty State) -->
      <div *ngIf="!reportData() && !isLoading()" class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm no-print">
         <div class="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
         </div>
         <p class="text-slate-800 font-bold text-lg">Aucun bilan généré</p>
         <p class="text-slate-400 text-sm max-w-xs text-center mt-1">Sélectionnez un niveau scolaire ainsi qu'une période pour charger l'état de recouvrement.</p>
      </div>
    </div>

    <style>
      /* --- OPTIMISATIONS AVANCÉES IMPRESSION (A4 PORTRAIT) --- */
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Masquage des conteneurs transversaux globaux */
        app-sidebar, app-header, .no-print, header, nav, aside, .toast-container {
          display: none !important;
        }

        /* Remise à plat des boîtes de mise en page Angular */
        body, main, app-layout, .h-screen, .min-h-screen, .ml-72, .overflow-y-auto {
          display: block !important;
          height: auto !important;
          min-height: 0 !important;
          width: auto !important;
          overflow: visible !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
          background: #fff !important;
        }

        .p-6 {
          padding: 0 !important;
        }

        #print-area {
          display: block !important;
          margin: 0 auto !important;
          padding: 0 !important;
          width: 100% !important;
        }

        table {
          width: 100% !important;
          page-break-inside: auto;
          border-collapse: collapse !important;
        }
        
        tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }

        th, td {
          padding: 6px 8px !important;
          font-size: 9px !important;
          border: 1px solid #cbd5e1 !important; /* border-slate-300 */
        }

        tfoot tr td {
          background-color: #0f172a !important; /* slate-900 */
          color: #fff !important;
        }

        @page {
          size: A4 portrait;
          margin: 12mm;
        }
      }
    </style>
  `,
  providers: [DatePipe]
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
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    
    this.filterForm = this.fb.group({
      classroomId: [''], // Optionnel : si vide, l'état sera global
      startDate: [firstDay, Validators.required],
      endDate: [today, Validators.required]
    });
  }

  loadClassrooms() {
    this.classroomService.list().subscribe((items: any[]) => {
      const cls = items.map(i => ({ label: i.name, value: i.id }));
      cls.unshift({ label: '⭐ Toutes les classes (Bilan global)', value: '' });
      this.classrooms.set(cls);
    });
  }

  loadReport() {
    if (this.filterForm.invalid) return;
    
    this.isLoading.set(true);
    const val = this.filterForm.value;
    
    this.paymentService.getCollectionReport(val.classroomId, val.startDate, val.endDate).subscribe({
      next: (res: any) => {
        this.reportData.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  printReport() {
    window.print();
  }
}