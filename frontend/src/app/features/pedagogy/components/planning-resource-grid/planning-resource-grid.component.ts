import { Component, Input, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-planning-resource-grid',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="flex flex-col h-full bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-sans relative">
        
        <!-- Top Toolbar -->
        <div class="px-6 py-5 bg-white/90 backdrop-blur-md border-b border-slate-200 flex flex-wrap justify-between items-center z-50 sticky top-0">
           <div class="flex items-center gap-6">
               <div class="flex flex-col">
                   <h2 class="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                       <span class="bg-indigo-600 text-white p-1.5 rounded-lg">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                       </span>
                       Planning Ressources
                   </h2>
                   <span *ngIf="planning && !planning.isGlobal" class="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1 ml-11">{{ planning.nom }}</span>
                   <span *ngIf="planning && planning.isGlobal" class="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 ml-11">Vue Globale Unifiée</span>
               </div>
               
               <div class="flex items-center bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm ring-4 ring-slate-50/50">
                   <button (click)="previousWeek()" class="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-indigo-600 transition-all active:scale-95 group">
                        <svg class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                   </button>
                   <div class="flex flex-col items-center justify-center px-6 min-w-[200px]">
                        <span class="text-sm font-black text-slate-800 uppercase tracking-tight">
                            {{ currentWeekStart() | date:'MMMM yyyy' }}
                        </span>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Semaine du {{ currentWeekStart() | date:'dd' }} au {{ getEndOfWeek() | date:'dd' }}
                        </span>
                   </div>
                   <button (click)="nextWeek()" class="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-indigo-600 transition-all active:scale-95 group">
                        <svg class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                   </button>
               </div>
           </div>
           
           <div class="hidden xl:flex items-center gap-4">
                <div class="relative group">
                    <select 
                        [ngModel]="selectedTeacherId()" 
                        (ngModelChange)="selectedTeacherId.set($event)"
                        class="pl-4 pr-10 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-64 shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="">Tous les enseignants</option>
                        <option *ngFor="let t of allTeachers()" [value]="t.id">{{ t.name }}</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                <button (click)="goToToday()" class="px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200">
                    Aujourd'hui
                </button>
           </div>
        </div>

        <!-- Main Grid Area -->
        <div class="flex-1 overflow-auto bg-white/50 custom-scrollbar relative">
             <div class="min-w-max pb-10">
                
                <!-- Days Header -->
                <div class="flex sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                    <div class="w-72 p-6 flex flex-col justify-end border-r border-slate-200 sticky left-0 z-50 bg-white/95 backdrop-blur-sm">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Personnel</span>
                        <div class="h-1 w-8 bg-indigo-500 rounded-full"></div>
                    </div>
                    <div class="flex-1 grid" [style.grid-template-columns]="'repeat(' + days().length + ', minmax(240px, 1fr))'">
                        <div *ngFor="let day of days()" 
                             class="p-4 flex flex-col items-center justify-center border-r border-slate-100 relative group transition-colors"
                             [class.bg-indigo-50]="day.isToday"
                             [class.bg-white]="!day.isToday">
                            
                            <div *ngIf="day.isToday" class="absolute top-0 inset-x-0 h-1 bg-indigo-500"></div>

                            <div class="text-[10px] font-bold uppercase tracking-widest mb-1" 
                                 [class.text-indigo-600]="day.isToday" 
                                 [class.text-slate-400]="!day.isToday">{{ day.label }}</div>
                            <div class="text-2xl font-black" 
                                 [class.text-indigo-900]="day.isToday" 
                                 [class.text-slate-700]="!day.isToday">{{ day.displayDate }}</div>
                        </div>
                    </div>
                </div>

                <!-- Teacher Rows -->
                <div *ngFor="let teacher of filteredTeachers(); let i = index" 
                     class="flex border-b border-slate-100 group transition-all duration-300 hover:bg-slate-50/30">
                    
                    <!-- Teacher Info (Sticky Left) -->
                    <div class="w-72 p-5 flex items-center gap-4 border-r border-slate-200 bg-white sticky left-0 z-30 group-hover:bg-slate-50/80 transition-colors shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-200 ring-4 ring-white">
                                {{ getInitials(teacher.name) }}
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                            </div>
                        </div>
                        <div class="flex flex-col min-w-0">
                            <div class="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-700 transition-colors">{{ teacher.name }}</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">{{ teacher.matricule || 'N/A' }}</div>
                            <div class="mt-1.5 flex items-center gap-1.5">
                                <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{{ teacher.hours }}h /sem</span>
                            </div>
                        </div>
                    </div>

                    <!-- Events Grid -->
                    <div class="flex-1 grid" [style.grid-template-columns]="'repeat(' + days().length + ', minmax(240px, 1fr))'">
                        <div *ngFor="let day of days()" 
                             class="p-3 border-r border-slate-50 min-h-[160px] relative transition-colors"
                             [ngClass]="{'bg-indigo-50/30': day.isToday}">
                             
                             <div class="flex flex-col gap-3 h-full">
                                 <div *ngFor="let evt of getEvents(teacher.id, day.date)" 
                                      class="relative p-3.5 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group/card overflow-hidden"
                                      [style.border-color]="getColorForSubject(evt.matiere).border">
                                      
                                      <!-- Left Accent Bar -->
                                      <div class="absolute left-0 top-0 bottom-0 w-1.5" [style.background-color]="getColorForSubject(evt.matiere).text"></div>

                                      <div class="flex justify-between items-start mb-2 pl-2">
                                          <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                              {{ evt.heureDebut }} - {{ evt.heureFin }}
                                          </div>
                                      </div>

                                      <div class="pl-2">
                                          <div class="font-black text-slate-800 text-sm leading-snug mb-1.5 line-clamp-2 group-hover/card:text-indigo-700 transition-colors">
                                              {{ evt.matiere?.name }}
                                          </div>
                                          
                                          <div class="flex items-center gap-2 mt-2">
                                              <span class="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                                  <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                  {{ evt.classe?.name }}
                                              </span>
                                              <span *ngIf="evt.salle" class="px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                                                  {{ evt.salle.name }}
                                              </span>
                                          </div>
                                      </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div *ngIf="filteredTeachers().length === 0" class="flex flex-col items-center justify-center py-20">
                    <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50 shadow-inner">
                        <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <h3 class="text-lg font-black text-slate-700 mb-1">Aucun Planning</h3>
                    <p class="text-sm text-slate-400 max-w-xs text-center">Aucun enseignant ou cours n'est plannifié pour cette période.</p>
                </div>

             </div>
        </div>
    </div>
  `,
    styles: [`
        :host { display: block; height: 100%; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    `]
})
export class PlanningResourceGridComponent implements OnChanges {
    @Input() planning: any;

    days = signal<any[]>([]);
    allTeachers = signal<any[]>([]);
    selectedTeacherId = signal<string>('');
    filteredTeachers = computed(() => {
        const id = this.selectedTeacherId();
        if (!id) return this.allTeachers();
        return this.allTeachers().filter(t => t.id === id);
    });
    private eventMap = new Map<string, any[]>();
    currentWeekStart = signal<Date>(this.getStartOfWeek(new Date()));

    ngOnChanges(changes: SimpleChanges) {
        if (changes['planning'] && this.planning) {
            // Respect de la logique "Vue Globale" vs "Vue Spécifique"
            if (this.planning.dateStart && !this.eventMap.size && !this.planning.isGlobal) {
                this.currentWeekStart.set(this.getStartOfWeek(new Date(this.planning.dateStart)));
            }
            this.updateGrid();
        }
    }

    private getStartOfWeek(date: Date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    getEndOfWeek() {
        const d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() + 5);
        return d;
    }

    previousWeek() {
        const d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() - 7);
        this.currentWeekStart.set(d);
        this.updateGrid();
    }

    nextWeek() {
        const d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() + 7);
        this.currentWeekStart.set(d);
        this.updateGrid();
    }

    goToToday() {
        this.currentWeekStart.set(this.getStartOfWeek(new Date()));
        this.updateGrid();
    }

    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    }

    updateGrid() {
        const start = this.currentWeekStart();
        const todayStr = new Date().toISOString().split('T')[0];
        const dayList: any[] = [];

        for (let i = 0; i < 6; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            dayList.push({
                date: dateStr,
                label: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
                displayDate: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
                isToday: dateStr === todayStr
            });
        }
        this.days.set(dayList);

        this.eventMap.clear();
        const teacherMap = new Map<string, any>();
        const details = this.planning?.details || [];

        details.forEach((d: any) => {
            if (d.enseignant) {
                if (!teacherMap.has(d.enseignant.id)) {
                    teacherMap.set(d.enseignant.id, {
                        id: d.enseignant.id,
                        name: d.enseignant.user ? `${d.enseignant.user.firstName} ${d.enseignant.user.lastName}` : `Prof ${d.enseignant.matricule}`,
                        matricule: d.enseignant.matricule,
                        hours: 0
                    });
                }

                // Filtrer les heures pour la semaine affichée
                const eventDate = new Date(d.date);
                const weekEnd = this.getEndOfWeek();
                if (eventDate >= start && eventDate <= weekEnd) {
                    const hStart = parseInt(d.heureDebut.split(':')[0]);
                    const hEnd = parseInt(d.heureFin.split(':')[0]);
                    teacherMap.get(d.enseignant.id).hours += (hEnd - hStart);
                }

                const key = `${d.enseignant.id}_${d.date}`;
                const current = this.eventMap.get(key) || [];
                current.push(d);
                current.sort((a: any, b: any) => a.heureDebut.localeCompare(b.heureDebut));
                this.eventMap.set(key, current);
            }
        });

        // Trier les profs par nom
        const sortedTeachers = Array.from(teacherMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
        this.allTeachers.set(sortedTeachers);
    }

    getEvents(teacherId: string, date: string) {
        return this.eventMap.get(`${teacherId}_${date}`) || [];
    }

    getColorForSubject(subject: any) {
        const themes = [
            { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
            { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
            { bg: '#fff1f2', border: '#fecdd3', text: '#e11d48' },
            { bg: '#fdf4ff', border: '#f5d0fe', text: '#a21caf' },
            { bg: '#fff7ed', border: '#ffedd5', text: '#ea580c' },
            { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' }
        ];
        const idx = (typeof subject?.id === 'number' ? subject.id : (subject?.id?.length || 0)) % themes.length;
        return themes[idx];
    }
}
