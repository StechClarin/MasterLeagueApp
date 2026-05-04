import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GetEvaluationSessionGQL } from '../../graphql/evaluations.generated';
import { firstValueFrom } from 'rxjs';
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
    selector: 'app-evaluation-planning-print',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="print-overlay" *ngIf="session(); else loading">
       <div class="flex flex-col items-center justify-center min-h-screen gap-4">
          <svg class="w-16 h-16 text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          <h2 class="text-2xl font-black text-slate-800">Préparation du planning...</h2>
          <p class="text-slate-500 font-medium">Le document s'ouvrira automatiquement.</p>
       </div>
    </div>

    <div class="print-container" *ngIf="session()">
      <div class="print-paper">
        
        <!-- HEADER ETABLISSEMENT -->
        <div class="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
           <div class="flex gap-4">
              <img *ngIf="establishment()?.logo" [src]="establishment()?.logo" class="w-20 h-20 object-contain grayscale" alt="logo">
              <div>
                 <h1 class="text-xl font-black uppercase tracking-tight">{{ establishment()?.name }}</h1>
                 <p class="text-[10px] uppercase font-bold text-gray-600 tracking-widest mt-0.5 mb-2" *ngIf="establishment()?.slogan">{{ establishment()?.slogan }}</p>
                 <p class="text-xs font-medium">{{ establishment()?.address }} - {{ establishment()?.city }}</p>
                 <p class="text-xs font-medium">Tél: {{ establishment()?.phone }}</p>
              </div>
           </div>
           <div class="text-right text-xs font-bold uppercase">
              <p>République du Cameroun</p>
              <p>Paix - Travail - Patrie</p>
              <div class="my-1 border-t border-dotted border-gray-400 w-24 ml-auto"></div>
              <p>Ministère des Enseignements Secondaires</p>
           </div>
        </div>

        <!-- TITRE DOCUMENT -->
        <div class="text-center mb-8">
          <h2 class="text-2xl font-black uppercase underline decoration-2 underline-offset-8">
            CALENDRIER DE DÉROULEMENT DES ÉPREUVES
          </h2>
          <div class="mt-6 border-2 border-black inline-block px-6 py-2 bg-gray-50">
             <p class="text-sm font-bold uppercase tracking-widest">
               SESSION : <span class="text-indigo-700">{{ session().title }}</span>
             </p>
          </div>
        </div>

        <!-- TABLEAU DES EPREUVES -->
        <table class="w-full border-collapse border-2 border-black text-[11px]">
          <thead>
            <tr class="bg-gray-100 uppercase font-black text-center">
              <th class="border-2 border-black p-2 w-28">Date</th>
              <th class="border-2 border-black p-2 w-32">Horaires</th>
              <th class="border-2 border-black p-2">Matière / Épreuve</th>
              <th class="border-2 border-black p-2">Classes & Salles</th>
              <th class="border-2 border-black p-2 w-20">Durée</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let day of groupedPlannings()">
              <tr *ngFor="let p of day.plannings; let i = index">
                <td *ngIf="i === 0" [attr.rowspan]="day.plannings.length" class="border-2 border-black p-2 text-center font-bold bg-gray-50 align-middle">
                  {{ day.dateLabel }}
                </td>
                
                <td class="border-2 border-black p-2 text-center font-bold whitespace-nowrap">
                  {{ p.startTime ? p.startTime.substring(0, 5) : '--:--' }} - {{ getEndTime(p) }}
                </td>
                
                <td class="border-2 border-black p-2 font-black uppercase">
                  {{ p.subjectName }}
                </td>
                
                <td class="border-2 border-black p-2">
                  <div class="mb-1.5 flex flex-wrap gap-1">
                    <span *ngFor="let c of p.classrooms" class="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold border border-gray-300">
                      {{ c.name }}
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-1 pt-1 border-t border-dotted border-gray-300" *ngIf="p.rooms?.length">
                    <span *ngFor="let r of p.rooms" class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-200">
                      Salle: {{ r.name }}
                    </span>
                  </div>
                </td>
                
                <td class="border-2 border-black p-2 text-center font-bold">
                  {{ p.durationMinutes }}'
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>

        <!-- FOOTER / SIGNATURES -->
        <div class="mt-16 grid grid-cols-2 gap-12 px-8">
          <div class="text-center italic">
            <p class="mb-20 text-xs">Fait à {{ establishment()?.city || '................' }}, le {{ now | date:'dd/MM/yyyy' }}</p>
            <p class="font-black uppercase underline text-sm">Le Chef d'Établissement</p>
          </div>
          <div class="text-center italic">
            <p class="mb-20 text-xs">Visa de la hiérarchie</p>
            <p class="font-black uppercase underline text-sm">Le Responsable des Examens</p>
          </div>
        </div>

        <!-- System Footer -->
        <div class="mt-20 pt-4 border-t border-dashed border-gray-300 text-center opacity-50">
           <p class="text-[8px] font-mono uppercase tracking-tighter">Généré par Yekola ERP • {{ now | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>
      </div>

      <div class="no-print fixed bottom-8 right-8 flex gap-4">
        <button (click)="goBack()" class="bg-slate-800 text-white px-6 py-3 rounded-xl shadow-xl font-bold hover:scale-105 transition-all">
          Fermer
        </button>
        <button (click)="print()" class="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-xl font-black hover:scale-105 transition-all flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          LANCER L'IMPRESSION
        </button>
      </div>
    </div>

    <ng-template #loading>
      <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p class="text-lg font-bold text-slate-600">Initialisation du planning...</p>
      </div>
    </ng-template>
  `,
    styles: [`
    @media screen {
      .print-overlay { background-color: #f8fafc; }
      .print-container {
        position: absolute;
        left: -9999px;
        top: -9999px;
      }
    }
    
    .print-paper {
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      margin: 0 auto;
      font-family: 'Inter', system-ui, sans-serif;
    }

    @media print {
      @page { size: portrait; margin: 0; }
      .no-print { display: none !important; }
      .print-overlay { display: none !important; }
      .print-container {
        position: static;
        background: white;
        padding: 0;
        display: block;
      }
      .print-paper {
        width: 100%;
        margin: 0;
        padding: 10mm;
      }
      table { border-width: 1.5pt !important; }
      th, td { border-width: 1pt !important; }
    }
  `]
})
export class EvaluationPlanningPrintComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private getSessionGQL = inject(GetEvaluationSessionGQL);
    private structureState = inject(StructureStateService);

    session = signal<any>(null);
    establishment = signal<any>(null);
    now = new Date();

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        // Ensure establishments are loaded
        if (this.structureState.establishments().length === 0) {
            await this.structureState.fetchEstablishments();
        }
        this.updateEstablishment();

        try {
            const res = await firstValueFrom(this.getSessionGQL.fetch({ id }, { fetchPolicy: 'network-only' }));
            if (res.data.evaluationSession) {
                this.session.set(res.data.evaluationSession);
                setTimeout(() => this.print(), 1500);
            }
        } catch (e) {
            console.error('Error loading session for print', e);
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

    groupedPlannings() {
        const sess = this.session();
        if (!sess || !sess.subjects) return [];

        const allPlannings: any[] = [];
        sess.subjects.forEach((subj: any) => {
            if (subj.plannings) {
                subj.plannings.forEach((p: any) => {
                    allPlannings.push({ ...p, subjectName: subj.subject.name });
                });
            }
        });

        allPlannings.sort((a, b) => {
            const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (a.startTime || '').localeCompare(b.startTime || '');
        });

        const groups: { date: string, dateLabel: string, plannings: any[] }[] = [];
        allPlannings.forEach(p => {
            const dateLabel = new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            let group = groups.find(g => g.date === p.date);
            if (!group) {
                group = { date: p.date, dateLabel, plannings: [] };
                groups.push(group);
            }
            group.plannings.push(p);
        });

        return groups;
    }

    getEndTime(p: any): string {
        if (!p.startTime || !p.durationMinutes) return '--:--';
        const [h, m] = p.startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m, 0);
        date.setMinutes(date.getMinutes() + p.durationMinutes);
        return date.toTimeString().substring(0, 5);
    }

    print() {
        window.print();
    }

    @HostListener('window:afterprint')
    onafterprint() {
        this.goBack();
    }

    goBack() {
        window.close();
    }
}
