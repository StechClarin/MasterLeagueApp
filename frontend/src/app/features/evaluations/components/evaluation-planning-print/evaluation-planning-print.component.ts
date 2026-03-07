import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GetEvaluationSessionGQL } from '../../graphql/evaluations.generated';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-evaluation-planning-print',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="print-container p-8 bg-white min-h-screen font-sans text-gray-900" *ngIf="session(); else loading">
      
      <!-- HEADER ETABLISSEMENT -->
      <div class="header flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div class="left text-sm font-bold uppercase">
          <p>République du Cameroun</p>
          <p>Paix - Travail - Patrie</p>
          <div class="my-2 border-t border-dotted border-gray-400 w-24 mx-0"></div>
          <p>Ministère des Enseignements Secondaires</p>
        </div>
        
        <div class="center flex flex-col items-center">
          <img *ngIf="logoUrl" [src]="logoUrl" class="w-20 h-20 object-contain mb-2 overflow-hidden" alt="Logo">
          <h1 class="text-xl font-black uppercase text-center leading-tight">
            {{ session().academicPeriod.name }}
          </h1>
        </div>

        <div class="right text-sm font-bold uppercase text-right">
          <p>Republic of Cameroon</p>
          <p>Peace - Work - Fatherland</p>
          <div class="my-2 border-t border-dotted border-gray-400 w-24 ml-auto"></div>
          <p>Ministry of Secondary Education</p>
        </div>
      </div>

      <!-- TITRE DOCUMENT -->
      <div class="doc-title text-center mb-8">
        <h2 class="text-2xl font-black uppercase underline decoration-2 underline-offset-8">
          CALENDRIER DE DÉROULEMENT DES ÉPREUVES
        </h2>
        <p class="text-lg font-bold mt-4 bg-gray-100 py-2 rounded-lg">
          SESSION : <span class="text-indigo-700">{{ session().title }}</span>
        </p>
      </div>

      <!-- TABLEAU DES EPREUVES -->
      <table class="w-full border-collapse border-2 border-black text-sm">
        <thead>
          <tr class="bg-gray-200 uppercase font-black text-center">
            <th class="border-2 border-black p-3 w-32">Date</th>
            <th class="border-2 border-black p-3 w-40">Horaires</th>
            <th class="border-2 border-black p-3">Matière / Épreuve</th>
            <th class="border-2 border-black p-3">Classes / Salles</th>
            <th class="border-2 border-black p-3 w-24">Durée</th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let day of groupedPlannings()">
            <tr *ngFor="let p of day.plannings; let i = index">
              <!-- Colonne Date fusionnée -->
              <td *ngIf="i === 0" [attr.rowspan]="day.plannings.length" class="border-2 border-black p-3 text-center font-bold bg-gray-50 align-middle">
                {{ day.dateLabel }}
              </td>
              
              <td class="border-2 border-black p-3 text-center font-semibold">
                {{ p.startTime ? p.startTime.substring(0, 5) : '--:--' }} - {{ getEndTime(p) }}
              </td>
              
              <td class="border-2 border-black p-3 font-bold uppercase">
                {{ p.subjectName }}
              </td>
              
              <td class="border-2 border-black p-3">
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let c of p.classrooms" class="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold border border-gray-300">
                    {{ c.name }}
                  </span>
                </div>
              </td>
              
              <td class="border-2 border-black p-3 text-center">
                {{ p.durationMinutes }} min
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>

      <!-- FOOTER / SIGNATURES -->
      <div class="footer mt-12 grid grid-cols-2 gap-8">
        <div class="text-center italic">
          <p class="mb-16">Fait à ......................., le .......................</p>
          <p class="font-bold underline">Le Chef d'Établissement</p>
        </div>
        <div class="text-center italic">
          <p class="mb-16">Visa du délégué (si applicable)</p>
          <p class="font-bold underline">Le Responsable des Examens</p>
        </div>
      </div>

      <!-- BOUTON PRINT (caché à l'impression) -->
      <div class="no-print fixed bottom-8 right-8 flex gap-4">
        <button (click)="goBack()" class="bg-gray-800 text-white px-6 py-3 rounded-full shadow-xl font-bold hover:scale-110 transition-transform">
          Retour
        </button>
        <button (click)="print()" class="bg-indigo-600 text-white px-8 py-3 rounded-full shadow-xl font-black hover:scale-110 transition-transform flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          IMPRIMER MAINTENANT
        </button>
      </div>

    </div>

    <ng-template #loading>
      <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p class="text-lg font-bold text-gray-600">Préparation de l'impression...</p>
      </div>
    </ng-template>
  `,
    styles: [`
    @media print {
      .no-print { display: none !important; }
      body { padding: 0 !important; margin: 0 !important; }
      .print-container { padding: 0 !important; min-height: auto !important; }
      table { border-width: 1.5pt !important; }
      th, td { border-width: 1.5pt !important; }
    }
    
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
  `]
})
export class EvaluationPlanningPrintComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private getSessionGQL = inject(GetEvaluationSessionGQL);

    session = signal<any>(null);
    logoUrl = '';

    async ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        try {
            const res = await firstValueFrom(this.getSessionGQL.fetch({ id }, { fetchPolicy: 'network-only' }));
            if (res.data.evaluationSession) {
                this.session.set(res.data.evaluationSession);
                this.prepareDocument();
            }
        } catch (e) {
            console.error('Error loading session for print', e);
        }
    }

    prepareDocument() {
        // Logic for logo if we had establishment context
        // For now use a default or empty
        // this.logoUrl = ...

        // Auto print after a short delay for rendering
        setTimeout(() => {
            // window.print(); // Commented for dev, user can click button
        }, 1000);
    }

    groupedPlannings() {
        const sess = this.session();
        if (!sess || !sess.subjects) return [];

        const allPlannings: any[] = [];

        sess.subjects.forEach((subj: any) => {
            if (subj.plannings) {
                subj.plannings.forEach((p: any) => {
                    allPlannings.push({
                        ...p,
                        subjectName: subj.subject.name
                    });
                });
            }
        });

        // Sort by date and time
        allPlannings.sort((a, b) => {
            const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return (a.startTime || '').localeCompare(b.startTime || '');
        });

        // Group by date
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

    goBack() {
        window.close();
    }
}
