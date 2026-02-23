import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanningService } from '../../../pedagogy/services/planning.service';
import { ClassRoomService } from '../../../structure/services/classroom.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-student-timetable',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="flex flex-col h-full bg-gray-50/50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
        
        <!-- HEADER / TOOLBAR -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm z-30 relative">
             
             <!-- Navigation Semaine -->
             <div class="flex items-center gap-4 bg-gray-50 rounded-lg p-1 border border-gray-200">
                 <button (click)="changeWeek(-1)" class="p-2 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-md transition-all text-gray-500">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                 </button>
                 
                 <div class="flex flex-col items-center min-w-[180px]">
                     <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Semaine du</span>
                     <span class="font-bold text-gray-800 text-lg">{{ currentWeekLabel() }}</span>
                 </div>

                 <button (click)="changeWeek(1)" class="p-2 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-md transition-all text-gray-500">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                 </button>
             </div>

             <!-- Filtres -->
             <div class="flex items-center gap-3">
                 <!-- Select Classe -->
                 <div class="relative group">
                     <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                     </div>
                     <select 
                        [ngModel]="selectedClassId()" 
                        (ngModelChange)="selectedClassId.set($event)"
                        class="pl-10 pr-10 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 shadow-sm appearance-none cursor-pointer hover:border-gray-300 transition-colors"
                     >
                        <option value="">Toutes les classes</option>
                        <option *ngFor="let c of classrooms()" [value]="c.id">{{ c.name }}</option>
                     </select>
                     <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                 </div>

                 <button (click)="resetDate()" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Revenir à aujourd'hui">
                     Aujourd'hui
                 </button>
             </div>
        </div>
        
        <!-- CALENDAR BODY -->
        <div class="flex-1 overflow-auto p-6 relative bg-gray-50/50">
            <div *ngIf="loading()" class="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
            </div>

            <div class="calendar-bg bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative min-w-[1000px]">
                <div class="calendar-grid" [style.--days-count]="days().length" [style.--hours-count]="endHour - startHour">
                    
                    <!-- Header: Days -->
                    <div class="col-start-1 row-start-1 sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm"></div>
                    <div *ngFor="let day of days(); let i = index" 
                         class="text-center py-5 sticky top-0 z-40 bg-white border-b-2 border-gray-100 border-r border-gray-50 flex flex-col justify-center transition-all hover:bg-gray-50/80 group/day"
                         [class.today-header]="isToday(day.date)"
                         [style.grid-column]="i + 2"
                         [style.grid-row]="1">
                        <span class="uppercase text-[10px] font-black tracking-[0.2em] mb-1" 
                              [class.text-indigo-600]="isToday(day.date)" 
                              [class.text-gray-400]="!isToday(day.date)">
                            {{ day.obj.toLocaleDateString('fr-FR', { weekday: 'long' }) }}
                        </span>
                        <span class="text-2xl font-black leading-none" 
                              [class.text-indigo-700]="isToday(day.date)" 
                              [class.text-gray-900]="!isToday(day.date)">
                            {{ day.obj.getDate() }}
                        </span>
                        <div *ngIf="isToday(day.date)" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-t-full"></div>
                    </div>

                    <!-- Sidebar: Hours -->
                    <div *ngFor="let h of hours(); let i = index" 
                         class="text-right pr-3 text-xs font-medium text-gray-400 h-full relative"
                         [ngClass]="{'-translate-y-1/2': i > 0}"
                         [style.grid-column]="1"
                         [style.grid-row]="(i * 4) + 2">
                        {{ h }}:00
                    </div>

                    <!-- Grid Lines -->
                    <ng-container *ngFor="let h of hours(); let i = index">
                        <div class="hour-marker col-span-full" [style.grid-row]="(i * 4) + 2" [style.grid-column]="'2 / -1'"></div>
                        <div class="quarter-marker col-span-full" [style.grid-row]="(i * 4) + 3" [style.grid-column]="'2 / -1'"></div>
                        <div class="quarter-marker col-span-full" [style.grid-row]="(i * 4) + 4" [style.grid-column]="'2 / -1'"></div>
                        <div class="quarter-marker col-span-full" [style.grid-row]="(i * 4) + 5" [style.grid-column]="'2 / -1'"></div>
                    </ng-container>

                    <!-- Vertical Lines -->
                    <div *ngFor="let day of days(); let i = index"
                         class="border-r border-gray-50 h-full row-span-full pointer-events-none"
                         style="grid-row: 2 / -1;"
                         [style.grid-column]="i + 2">
                    </div>

                    <!-- Events -->
                    <div *ngFor="let evt of events()" 
                         class="event-card p-2.5 flex flex-col cursor-pointer z-10 hover:z-50 group shadow-sm w-[96%] mx-auto"
                         [ngStyle]="evt.style"
                         [style.background]="getTheme(evt.matiere).bg"
                         [style.border-left-color]="getTheme(evt.matiere).accent"
                         [style.color]="getTheme(evt.matiere).text"
                         >
                         
                        <!-- Top Info: Subject & Time -->
                        <div class="flex justify-between items-start mb-1.5">
                            <span class="font-black text-[11px] uppercase tracking-wider truncate flex-1 pr-2">
                                {{ evt.matiere?.name }}
                            </span>
                            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/40 whitespace-nowrap">
                                {{ evt.heureDebut }} - {{ evt.heureFin }}
                            </span>
                        </div>
                        
                        <!-- Middle/Bottom Info -->
                        <div class="flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
                            <!-- Teacher -->
                            <div class="flex items-center gap-1.5 min-w-0">
                                <div class="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                                    <svg class="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                </div>
                                <span class="text-[10px] font-semibold truncate opacity-90 leading-tight">
                                    {{ evt.enseignant?.user?.firstName }} {{ evt.enseignant?.user?.lastName }}
                                </span>
                            </div>

                            <!-- Bottom Row: Room & Class -->
                            <div class="flex items-center justify-between gap-1 mt-auto">
                                <!-- Room -->
                                <div class="flex items-center gap-1 min-w-0">
                                    <div class="w-4 h-4 rounded bg-white/40 flex items-center justify-center shrink-0">
                                        <svg class="w-2.5 h-2.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <span class="text-[9px] font-bold truncate opacity-70">{{ evt.salle?.name || 'Salle NC' }}</span>
                                </div>

                                <!-- Class Badge (only if visible height allows) -->
                                <div class="text-[9px] bg-black/5 rounded-md px-1.5 py-0.5 font-bold shrink-0 shadow-inner">
                                    {{ evt.classe?.name }}
                                </div>
                            </div>
                        </div>

                        <!-- Hover Overlay -->
                        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none"></div>
                    </div>

                    <!-- No Data State (if empty grid) -->
                    <div *ngIf="!loading() && events().length === 0" class="col-span-full row-start-2 row-end-10 flex flex-col items-center justify-center pointer-events-none p-10">
                        <div class="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-400 mb-1">Aucun cours prévu</h3>
                        <p class="text-sm text-gray-300">Profitez de votre temps libre !</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [`
    .calendar-bg {
        background: white;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: 80px repeat(var(--days-count), 1fr);
      grid-template-rows: 70px repeat(calc(var(--hours-count) * 4), 20px); 
    }
    .hour-marker { border-bottom: 1px solid #f3f4f6; }
    .quarter-marker { border-bottom: 1px dotted #f9fafb; }
    
    .event-card {
      border-left-width: 5px;
      border-radius: 10px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      backdrop-filter: blur(8px);
    }
    .event-card:hover {
      z-index: 50;
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    .today-header {
      background: linear-gradient(to bottom, #f8fafc, white);
    }
    `]
})
export class StudentTimetableComponent implements OnInit {
    planningService = inject(PlanningService);
    classroomService = inject(ClassRoomService);

    // Filter States
    currentDate = signal(new Date());
    selectedClassId = signal<string>('');

    // Data States
    loading = signal(false);
    classrooms = signal<any[]>([]);

    // Derived Data
    days = computed(() => {
        const start = this.getStartOfWeek(this.currentDate());
        const days = [];
        for (let i = 0; i < 6; i++) { // Mon-Sat
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push({
                date: d.toISOString().split('T')[0],
                label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                obj: d
            });
        }
        return days;
    });

    currentWeekLabel = computed(() => {
        const days = this.days();
        if (!days.length) return '';
        const start = days[0].obj;
        const end = days[days.length - 1].obj;
        return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
    });

    // Calendar Config
    startHour = 7;
    endHour = 19;
    hours = signal<number[]>(Array.from({ length: 19 - 7 + 1 }, (_, i) => i + 7));

    // Raw Events from Backend
    rawEvents = signal<any[]>([]);

    // Filtered Events
    events = computed(() => {
        const classId = this.selectedClassId();
        let evts = this.rawEvents();

        if (classId) {
            evts = evts.filter(e => e.classe?.id === classId);
        }

        return this.mapEventsToGrid(evts);
    });

    constructor() {
        // React to Week or Class Change
        effect(() => {
            this.loadEventsForWeek(this.currentDate(), this.selectedClassId());
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.loadClassrooms();
    }

    async loadClassrooms() {
        try {
            const res: any = await firstValueFrom(this.classroomService.list());
            if (res) this.classrooms.set(res);
        } catch (e) {
            console.error('Failed to load classrooms', e);
        }
    }

    async loadEventsForWeek(date: Date, classId?: string) {
        this.loading.set(true);
        const start = this.getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Weekly range

        try {
            const res = await firstValueFrom(this.planningService.getDetailsGQL.fetch({
                minDate: start.toISOString().split('T')[0],
                maxDate: end.toISOString().split('T')[0],
                classeId: classId || null,
                pageSize: 200
            }));

            const details = res.data.planningDetails?.items || [];
            this.rawEvents.set(details);

        } catch (e) {
            console.error('Failed to load planning details', e);
        } finally {
            this.loading.set(false);
        }
    }

    mapEventsToGrid(details: any[]) {
        const days = this.days();
        return details.map(d => {
            const dayIndex = days.findIndex(day => day.date === d.date);
            if (dayIndex === -1) return null;

            const [startH, startM] = d.heureDebut.split(':').map(Number);
            const [endH, endM] = d.heureFin.split(':').map(Number);

            const rowStart = 1 + ((startH - this.startHour) * 4) + (startM / 15) + 1;
            const durationM = ((endH * 60) + endM) - ((startH * 60) + startM);
            const span = durationM / 15;

            return {
                ...d,
                style: {
                    'grid-column': `${dayIndex + 2} / span 1`,
                    'grid-row': `${rowStart} / span ${span}`,
                }
            };
        }).filter(Boolean);
    }

    // Helper: Monday of the week
    getStartOfWeek(d: Date) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(date.setDate(diff));
    }

    changeWeek(offset: number) {
        const newDate = new Date(this.currentDate());
        newDate.setDate(newDate.getDate() + (offset * 7));
        this.currentDate.set(newDate);
    }

    resetDate() {
        this.currentDate.set(new Date());
    }

    isToday(dateStr: string) {
        return dateStr === new Date().toISOString().split('T')[0];
    }

    getTheme(subject: any) {
        const themes = [
            { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', accent: '#3b82f6', text: '#1e40af' }, // Blue
            { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', accent: '#22c55e', text: '#15803d' }, // Green
            { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', accent: '#f97316', text: '#c2410c' }, // Orange
            { bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', accent: '#a855f7', text: '#7e22ce' }, // Purple
            { bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', accent: '#f43f5e', text: '#be123c' }, // Pink
            { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', accent: '#eab308', text: '#854d0e' }, // Yellow
        ];
        if (!subject?.id) return themes[0];
        const idx = (typeof subject.id === 'number' ? subject.id : subject.id.charCodeAt(0)) % themes.length;
        return themes[idx];
    }
}
