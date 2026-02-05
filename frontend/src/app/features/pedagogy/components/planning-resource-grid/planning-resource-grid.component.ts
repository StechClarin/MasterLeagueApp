import { Component, Input, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-planning-resource-grid',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Controls / Header -->
        <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
           <div class="flex items-center gap-4">
               <h3 class="font-bold text-lg text-gray-800">Vue Superviseur : Grille Professeurs</h3>
               <!-- Pagination de Semaine (Mockée pour l'instant) -->
               <div class="flex items-center bg-white rounded-md border border-gray-300 shadow-sm p-1">
                   <button class="p-1 hover:bg-gray-100 rounded text-gray-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
                   <span class="px-3 text-sm font-medium">Semaine 1</span>
                   <button class="p-1 hover:bg-gray-100 rounded text-gray-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
               </div>
           </div>
           
           <div class="flex items-center gap-2 text-sm text-gray-500">
               <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></span> Cours</span>
               <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-100 border border-red-300"></span> Conflit</span>
           </div>
        </div>

        <!-- Scrollable Grid Area -->
        <div class="flex-1 overflow-auto relative">
             <div class="min-w-max">
                <!-- Header Row: Days -->
                <div class="flex sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
                    <div class="w-48 p-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 sticky left-0 z-30">
                        Professeur
                    </div>
                    <div class="flex-1 grid" [style.grid-template-columns]="'repeat(' + days().length + ', minmax(150px, 1fr))'">
                        <div *ngFor="let day of days()" class="p-3 text-center border-r border-gray-100 bg-gray-50">
                            <div class="font-bold text-gray-900">{{ day.label }}</div>
                            <div class="text-xs text-gray-500">{{ day.date }}</div>
                        </div>
                    </div>
                </div>

                <!-- Body Rows: Teachers -->
                <div *ngFor="let teacher of teachers()" class="flex border-b border-gray-100 group hover:bg-gray-50/50 transition-colors">
                    <!-- Teacher Name (Sticky Left) -->
                    <div class="w-48 p-3 flex flex-col justify-center border-r border-gray-200 bg-white sticky left-0 z-10 group-hover:bg-gray-50 transition-colors">
                        <div class="font-bold text-gray-800">{{ teacher.name }}</div>
                        <div class="text-xs text-gray-400">{{ teacher.matricule || 'N/A' }}</div>
                        <div class="text-xs text-indigo-600 mt-1">{{ teacher.hours }}h cette semaine</div>
                    </div>

                    <!-- Days Cells -->
                    <div class="flex-1 grid" [style.grid-template-columns]="'repeat(' + days().length + ', minmax(150px, 1fr))'">
                        <div *ngFor="let day of days()" class="p-2 border-r border-gray-100 min-h-[100px] relative">
                             <!-- Events for this Teacher on this Day -->
                             <div class="flex flex-col gap-2">
                                 <div *ngFor="let evt of getEvents(teacher.id, day.date)" 
                                      class="p-2 rounded border text-xs shadow-sm cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                                      [style.background-color]="getColorForSubject(evt.matiere).bg"
                                      [style.border-color]="getColorForSubject(evt.matiere).border"
                                      [style.color]="getColorForSubject(evt.matiere).text"
                                 >
                                      <div class="font-bold mb-1">{{ evt.matiere?.name }}</div>
                                      <div class="flex items-center gap-1 opacity-90 mb-0.5">
                                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                          {{ evt.classe?.name }}
                                      </div>
                                      <div class="flex items-center gap-1 opacity-90">
                                           <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                           {{ evt.heureDebut }} - {{ evt.heureFin }}
                                      </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div *ngIf="teachers().length === 0" class="p-12 text-center text-gray-400">
                    Aucun enseignant trouvé dans ce planning.
                </div>
             </div>
        </div>
    </div>
  `,
    styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class PlanningResourceGridComponent implements OnChanges {
    @Input() planning: any;

    days = signal<any[]>([]);
    teachers = signal<any[]>([]);

    // Cache map for performance: key = "teacherId_date", value = events[]
    private eventMap = new Map<string, any[]>();

    ngOnChanges(changes: SimpleChanges) {
        if (changes['planning'] && this.planning) {
            this.initGrid();
        }
    }

    initGrid() {
        if (!this.planning?.dateStart || !this.planning?.dateEnd) return;

        // 1. Generate Days (Just first 6 days of the planning for now, to mimic a "Week" view)
        // TODO: Add real pagination later
        const start = new Date(this.planning.dateStart);
        // Display max 7 days for the MVP grid
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const dayList: any[] = [];
        const dt = new Date(start);

        while (dt <= end && dt <= new Date(this.planning.dateEnd)) {
            dayList.push({
                date: dt.toISOString().split('T')[0],
                label: dt.toLocaleDateString('fr-FR', { weekday: 'long' }),
            });
            dt.setDate(dt.getDate() + 1);
        }
        this.days.set(dayList);

        // 2. Extract Unique Teachers & Build Event Map
        this.eventMap.clear();
        const teacherMap = new Map<string, any>();

        if (this.planning.details) {
            this.planning.details.forEach((d: any) => {
                if (d.enseignant) {
                    // Register Teacher
                    if (!teacherMap.has(d.enseignant.id)) {
                        teacherMap.set(d.enseignant.id, {
                            id: d.enseignant.id,
                            name: d.enseignant.user ? `${d.enseignant.user.firstName} ${d.enseignant.user.lastName}` : `Prof ${d.enseignant.matricule}`,
                            matricule: d.enseignant.matricule,
                            hours: 0 // Will translate duration to hours later
                        });
                    }

                    // Map Event
                    const key = `${d.enseignant.id}_${d.date}`;
                    const current = this.eventMap.get(key) || [];

                    // Simple duration calc (approx)
                    const hStart = parseInt(d.heureDebut.split(':')[0]);
                    const hEnd = parseInt(d.heureFin.split(':')[0]);
                    const duration = hEnd - hStart;
                    teacherMap.get(d.enseignant.id).hours += duration;

                    current.push(d);
                    // Sort by time
                    current.sort((a: any, b: any) => a.heureDebut.localeCompare(b.heureDebut));
                    this.eventMap.set(key, current);
                }
            });
        }

        this.teachers.set(Array.from(teacherMap.values()));
    }

    getEvents(teacherId: string, date: string) {
        return this.eventMap.get(`${teacherId}_${date}`) || [];
    }

    getColorForSubject(subject: any) {
        // Theme generator based on Subject ID
        const themes = [
            { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }, // Blue
            { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' }, // Green
            { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }, // Red
            { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' }, // Orange
            { bg: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' }, // Violet
            { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239' }  // Pink
        ];

        if (!subject?.id) return themes[0];
        const idx = (typeof subject.id === 'number' ? subject.id : subject.id.charCodeAt(0)) % themes.length;
        return themes[idx];
    }
}
