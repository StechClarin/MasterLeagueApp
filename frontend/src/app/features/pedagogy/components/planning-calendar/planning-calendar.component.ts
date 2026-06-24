import { Component, Input, Output, EventEmitter, computed, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { PlanningService } from '../../services/planning.service';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-planning-calendar',
    standalone: true,
    imports: [CommonModule, FormsModule, UiConfirmModalComponent, UiModalComponent],
    templateUrl: './planning-calendar.component.html',
    styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: 60px repeat(var(--days-count), 1fr);
      /* Header 50px, then 15px per 15min slot */
      grid-template-rows: 50px repeat(calc(var(--hours-count) * 4), 20px); 
      overflow-x: auto;
      background: white;
      border-radius: 1rem;
      border: 1px solid #e5e7eb;
    }
    .time-slot {
      border-bottom: 1px solid #f3f4f6;
      border-right: 1px solid #f3f4f6;
    }
    .hour-marker {
      border-bottom: 1px solid #e5e7eb; /* Stronger line for hour */
    }
    .quarter-marker {
       border-bottom: 1px dashed #f9fafb; /* Weaker line for 15min */
    }
    .event-card {
      z-index: 10;
      overflow: hidden;
      font-size: 0.75rem;
      line-height: 1rem;
      border-left-width: 4px;
      transition: all 0.2s;
      margin: 1px;
      border-radius: 4px;
    }
    .event-card .action-buttons {
      display: none;
    }
    .event-card:hover .action-buttons {
      display: flex !important;
    }
  `]
})
export class PlanningCalendarComponent implements OnChanges {
    planningService = inject(PlanningService);
    toastService = inject(ToastService);

    @Input() dateStart?: string;
    @Input() dateEnd?: string;
    @Input() compiledDetails: any[] = [];
    @Input() planningName?: string;

    @Output() scheduleChanged = new EventEmitter<void>();

    // Modals state
    showCancelModal = signal(false);
    showRescheduleModal = signal(false);
    selectedEvent = signal<any>(null);
    newDate = signal<string>('');

    // Configuration
    startHour = 8;
    endHour = 18;

    days = signal<any[]>([]);
    hours = signal<number[]>([]);
    events = signal<any[]>([]);

    ngOnChanges(changes: SimpleChanges) {
        if ((changes['dateStart'] || changes['dateEnd'] || changes['compiledDetails']) && this.dateStart && this.dateEnd) {
            this.initCalendar();
        }
    }

    initCalendar() {
        if (!this.dateStart || !this.dateEnd) return;

        // 1. Generate Days
        const start = new Date(this.dateStart);
        const end = new Date(this.dateEnd);
        const dayList: any[] = [];
        const dt = new Date(start);

        while (dt <= end) {
            dayList.push({
                date: dt.toISOString().split('T')[0],
                label: dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                fullDate: new Date(dt)
            });
            dt.setDate(dt.getDate() + 1);
        }
        this.days.set(dayList);

        // 2. Generate Hours
        const hourList = [];
        for (let h = this.startHour; h <= this.endHour; h++) {
            hourList.push(h);
        }
        this.hours.set(hourList);

        // 3. Map Events
        if (this.compiledDetails && this.compiledDetails.length > 0) {
            const evtList = this.compiledDetails.map((d: any) => {
                const dayIndex = dayList.findIndex(day => day.date === d.date);
                if (dayIndex === -1) return null;
                const col = dayIndex + 2;

                // Handle Holidays specifically
                if (d.type === 'HOLIDAY') {
                    return {
                        ...d,
                        style: {
                            'grid-column': `${col} / span 1`,
                            'grid-row-start': 2,
                            'grid-row-end': (this.endHour - this.startHour + 1) * 4 + 2,
                            'background-color': '#f3f4f6',
                            'border': '2px dashed #9ca3af',
                            'opacity': '0.9',
                            'color': '#4b5563',
                            'display': 'flex',
                            'align-items': 'center',
                            'justify-content': 'center',
                            'font-size': '1.1rem',
                            'font-weight': 'bold'
                        }
                    };
                }

                // Parse times (HH:mm)
                const [startH, startM] = d.heureDebut.split(':').map(Number);
                const [endH, endM] = d.heureFin.split(':').map(Number);

                // Calculate Grid Position
                // Row 1 is Header. Row 2 starts at startHour.
                // Formula: (Hour - StartHour) + 2 + (Minute / 60)
                const startRow = (startH - this.startHour) + 2 + (startM / 60);
                const endRow = (endH - this.startHour) + 2 + (endM / 60);

                return {
                    ...d,
                    style: {
                        'grid-column': `${col} / span 1`,
                        'grid-row': `${startRow} / ${endRow}`,
                        // Adjust top/height for finer precision if not using direct grid fractions, 
                        // but here we use fractional grid-row which works in modern CSS if we use many tracks, 
                        // OR we use top/height percentages relative to a parent cell. 

                        // ACTUALLY: CSS Grid "fractions" in line numbers don't work like that.
                        // Better approach: "min-content" or predefined 15min slots.
                        // Let's use `calc` on top/height relative to the startRow integer anchor?
                        // No, easier: 
                        // grid-template-rows: repeat((endHour - startHour) * 4, 15px); (15min slots)

                        'grid-row-start': (startH - this.startHour) * 4 + 2 + (startM / 15),
                        'grid-row-end': (endH - this.startHour) * 4 + 2 + (endM / 15),
                        'background-color': this.getColorForSubject(d.matiere),
                    }
                };
            }).filter(Boolean);
            this.events.set(evtList);
        }
    }

    // Helper for colors
    getColorForSubject(subject: any): string {
        // Basic hash to pick a color
        const colors = ['#eff6ff', '#f0fdf4', '#fef2f2', '#fff7ed', '#f5f3ff', '#fff1f2']; // blue, green, red, orange, violet, pink (light backgrounds)
        const borderColors = ['#bfdbfe', '#bbf7d0', '#fecaca', '#fed7aa', '#ddd6fe', '#fecdd3']; // corresponding borders

        if (!subject?.id) return '#ffffff';
        const idx = (typeof subject.id === 'number' ? subject.id : subject.id.charCodeAt(0)) % colors.length;

        return colors[idx];
    }

    getBorderColor(subject: any) {
        const colors = ['#60a5fa', '#4ade80', '#f87171', '#fb923c', '#a78bfa', '#fb7185'];
        if (!subject?.id) return '#e5e7eb';
        const idx = (typeof subject.id === 'number' ? subject.id : subject.id.charCodeAt(0)) % colors.length;
        return colors[idx];
    }

    getTextColor(subject: any) {
        const colors = ['#1e40af', '#166534', '#991b1b', '#9a3412', '#5b21b6', '#9f1239'];
        if (!subject?.id) return '#374151';
        const idx = (typeof subject.id === 'number' ? subject.id : subject.id.charCodeAt(0)) % colors.length;
        return colors[idx];
    }

    // --- ACTIONS ---

    promptCancel(evt: any, event: Event) {
        event.stopPropagation();
        this.selectedEvent.set(evt);
        this.showCancelModal.set(true);
    }

    confirmCancel() {
        const evt = this.selectedEvent();
        if (!evt) return;

        this.planningService.cancelEvent(evt.real_id, evt.date, evt.type).subscribe({
            next: (res) => {
                this.toastService.success('Événement annulé avec succès.');
                this.showCancelModal.set(false);
                this.selectedEvent.set(null);
                this.scheduleChanged.emit();
            },
            error: (err) => {
                this.toastService.error('Impossible d\'annuler l\'événement.');
            }
        });
    }

    promptReschedule(evt: any, event: Event) {
        event.stopPropagation();
        this.selectedEvent.set(evt);
        this.newDate.set(evt.date); // Par défaut la même date
        this.showRescheduleModal.set(true);
    }

    confirmReschedule() {
        const evt = this.selectedEvent();
        const date = this.newDate();
        if (!evt || !date) return;

        this.planningService.rescheduleEvent(evt.real_id, evt.date, date, evt.type).subscribe({
            next: (res) => {
                this.toastService.success('Événement reporté avec succès.');
                this.showRescheduleModal.set(false);
                this.selectedEvent.set(null);
                this.scheduleChanged.emit();
            },
            error: (err) => {
                this.toastService.error('Impossible de reporter l\'événement.');
            }
        });
    }
}
