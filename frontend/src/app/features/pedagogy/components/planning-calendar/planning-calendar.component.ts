import { Component, Input, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-planning-calendar',
    standalone: true,
    imports: [CommonModule],
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
    .event-card:hover {
      z-index: 50;
      transform: scale(1.02);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class PlanningCalendarComponent implements OnChanges {
    @Input() planning: any;

    // Configuration
    startHour = 8;
    endHour = 18;

    days = signal<any[]>([]);
    hours = signal<number[]>([]);
    events = signal<any[]>([]);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['planning'] && this.planning) {
            this.initCalendar();
        }
    }

    initCalendar() {
        if (!this.planning?.dateStart || !this.planning?.dateEnd) return;

        // 1. Generate Days
        const start = new Date(this.planning.dateStart);
        const end = new Date(this.planning.dateEnd);
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
        if (this.planning.details) {
            const evtList = this.planning.details.map((d: any) => {
                const dayIndex = dayList.findIndex(day => day.date === d.date);
                if (dayIndex === -1) return null;

                // Parse times (HH:mm)
                const [startH, startM] = d.heureDebut.split(':').map(Number);
                const [endH, endM] = d.heureFin.split(':').map(Number);

                // Calculate Grid Position
                // Row 1 is Header. Row 2 starts at startHour.
                // Formula: (Hour - StartHour) + 2 + (Minute / 60)
                const startRow = (startH - this.startHour) + 2 + (startM / 60);
                const endRow = (endH - this.startHour) + 2 + (endM / 60);

                // Grid Column: Sidebar is 1. Days start at 2.
                const col = dayIndex + 2;

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
}
