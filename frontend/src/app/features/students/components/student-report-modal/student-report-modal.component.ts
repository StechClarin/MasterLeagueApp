import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexTitleSubtitle, ApexYAxis, ApexDataLabels, ApexStroke, ApexMarkers, ApexFill } from 'ng-apexcharts';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { GetAllAcademicPeriodsGQL } from '@features/structure/graphql/structure.generated';
import { GetAllGradesGQL } from '@features/evaluations/graphql/evaluations.generated';
import { firstValueFrom } from 'rxjs';

function decodeGraphqlId(id: any): string {
    if (!id) return '';
    const strId = String(id);
    
    try {
        const decoded = atob(strId);
        if (decoded.includes(':')) {
            return decoded.split(':')[1];
        }
    } catch {
        // Not a valid base64 or doesn't have ':'
    }
    return strId;
}

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    title: ApexTitleSubtitle;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    markers: ApexMarkers;
    fill: ApexFill;
};

@Component({
  selector: 'app-student-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgApexchartsModule, UiModalComponent, UiAvatarComponent],
  templateUrl: './student-report-modal.component.html',
  styleUrl: './student-report-modal.component.css'
})
export class StudentReportModalComponent implements OnInit, OnChanges {
    @Input() isOpen: boolean = false;
    @Input() student: any = null;
    @Input() enrollment: any = null;
    @Output() close = new EventEmitter<void>();

    academicYearService = inject(AcademicYearService);
    academicPeriodsQuery = inject(GetAllAcademicPeriodsGQL);
    gradesQuery = inject(GetAllGradesGQL);

    yearControl = new FormControl<string | null>(null);
    periodControl = new FormControl<string | null>(null);

    academicYears = signal<any[]>([]);
    academicPeriods = signal<any[]>([]);
    grades = signal<any[]>([]);
    isLoading = signal<boolean>(false);

    getPeriodName(): string {
        const pId = this.periodControl.value;
        if (!pId) return 'Toutes les périodes';
        const p = this.academicPeriods().find(x => x.id === pId);
        return p ? p.name : '';
    }

    verdict = signal<{ text: string, type: 'positive' | 'negative' | 'neutral' } | null>(null);
    weakSubjects = signal<{ name: string, avg: number }[]>([]);

    @ViewChild('chart') chart!: ChartComponent;
    public chartOptions: Partial<ChartOptions> | any = null;
    globalChartOptions: Partial<ChartOptions> | any;

    ngOnInit() {
        this.loadYears();

        this.yearControl.valueChanges.subscribe(yearId => {
            if (yearId) {
                this.loadPeriods(yearId);
            } else {
                this.academicPeriods.set([]);
                this.periodControl.setValue(null);
            }
        });

        this.periodControl.valueChanges.subscribe(periodId => {
            if (periodId) {
                this.loadGrades(periodId);
            } else {
                this.grades.set([]);
                this.updateChart();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isOpen'] && changes['isOpen'].currentValue === true && this.student) {
            // Re-fetch or re-initialize if needed when opened
            if (this.yearControl.value && this.periodControl.value) {
                this.loadGrades(this.periodControl.value);
            }
        }
    }

    async loadYears() {
        try {
            const years = await firstValueFrom(this.academicYearService.list());
            this.academicYears.set(years);
            const activeYear = years.find((y: any) => y.isActive);
            if (activeYear) {
                this.yearControl.setValue(activeYear.id);
            }
        } catch (err) {
            console.error('Error loading years', err);
        }
    }

    async loadPeriods(yearId: string) {
        try {
            // Note: If the backend still expects Int, this might cause issues if UUID is passed.
            // But if it accepts ID/String, this will correctly pass the string.
            const parsedYearId = decodeGraphqlId(yearId);
            const res = await firstValueFrom(this.academicPeriodsQuery.fetch(
                { academicYearId: parsedYearId as any, page: 1, pageSize: 100 },
                { fetchPolicy: 'network-only' }
            ));
            const periods = res.data.academicPeriods?.items || [];
            this.academicPeriods.set(periods);
            
            const activePeriod = periods.find((p: any) => p.isActive);
            if (activePeriod) {
                this.periodControl.setValue(activePeriod.id);
            } else if (periods && periods.length > 0 && periods[0]) {
                this.periodControl.setValue(periods[0].id);
            } else {
                this.periodControl.setValue(null);
            }
        } catch (err) {
            console.error('Error loading periods', err);
        }
    }

    async loadGrades(periodId: string) {
        if (!this.student) return;

        this.isLoading.set(true);
        try {
            const parsedStudentId = decodeGraphqlId(this.student.id);
            const parsedPeriodId = decodeGraphqlId(periodId);
            
            const res = await firstValueFrom(this.gradesQuery.fetch(
                { 
                    studentId: parsedStudentId, 
                    academicPeriodId: parsedPeriodId,
                    page: 1, 
                    pageSize: 200 
                },
                { fetchPolicy: 'network-only' }
            ));
            const fetchedGrades = res.data.grades?.items || [];
            this.grades.set(fetchedGrades);
            this.updateChart();
        } catch (err) {
            console.error('Error loading grades', err);
        } finally {
            this.isLoading.set(false);
        }
    }

    updateChart() {
        const currentGrades = this.grades();
        
        // 1. Extraire toutes les sessions uniques pour l'axe X
        const sessionSet = new Set<string>();
        currentGrades.forEach(g => {
            const sessionTitle = g.evaluationSubject?.session?.title || 'Session Inconnue';
            sessionSet.add(sessionTitle);
        });
        const categories = Array.from(sessionSet);
        
        // 2. Grouper les notes par matière et par session
        // Map<SubjectName, Map<SessionTitle, number>>
        const subjectMap = new Map<string, Map<string, number>>();
        
        currentGrades.forEach(g => {
            const subjectName = g.evaluationSubject?.subject?.name || 'Inconnu';
            const sessionTitle = g.evaluationSubject?.session?.title || 'Session Inconnue';
            
            let finalValue: number | null = null;
            if (g.absenceStatus === 'UNJUSTIFIED') finalValue = 0;
            else if (g.absenceStatus === 'JUSTIFIED') finalValue = null;
            else if (g.value !== null && g.value !== undefined) finalValue = parseFloat(g.value);
            
            if (!subjectMap.has(subjectName)) {
                subjectMap.set(subjectName, new Map<string, number>());
            }
            
            if (finalValue !== null) {
                // S'il y a plusieurs notes pour une même matière dans la même session (ex: deux devoirs dans "Devoir 1"),
                // on pourrait faire une moyenne, mais ici on garde la dernière ou on écrase.
                subjectMap.get(subjectName)!.set(sessionTitle, finalValue);
            }
        });

        // 3. Construire les séries pour le graphique
        const series: any[] = [];
        subjectMap.forEach((sessionGrades, subjectName) => {
            const data = categories.map(cat => sessionGrades.has(cat) ? sessionGrades.get(cat) : null);
            series.push({
                name: subjectName,
                data: data
            });
        });

        this.chartOptions = {
            series: series,
            chart: {
                height: 400,
                type: "line",
                fontFamily: 'Inter, sans-serif',
                animations: { enabled: false },
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.05
                },
                toolbar: {
                    show: false
                }
            },
            colors: [
                '#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', 
                '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#0ea5e9'
            ],
            dataLabels: {
                enabled: true,
                background: {
                    foreColor: '#fff',
                    borderRadius: 2,
                    padding: 4,
                }
            },
            stroke: {
                curve: "smooth",
                width: 3
            },
            title: {
                text: "Évolution des Notes par Matière",
                align: "left",
                style: {
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1e293b'
                }
            },
            markers: {
                size: 6,
                colors: ["#fff"],
                strokeColors: "#4f46e5",
                strokeWidth: 3,
                hover: {
                    size: 8
                }
            },
            xaxis: {
                categories: categories,
                labels: {
                    style: { colors: '#64748b', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                min: 0,
                max: 20,
                tickAmount: 5,
                labels: {
                    style: { colors: '#64748b', fontSize: '12px', fontFamily: 'Inter, sans-serif' }
                }
            }
        };

        // 4. Construire la série globale (Moyenne générale par session)
        const globalData = categories.map(cat => {
            let sum = 0;
            let count = 0;
            subjectMap.forEach(sessionGrades => {
                if (sessionGrades.has(cat) && sessionGrades.get(cat) !== null) {
                    sum += sessionGrades.get(cat)!;
                    count++;
                }
            });
            return count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
        });

        this.globalChartOptions = {
            series: [{ name: "Moyenne Générale", data: globalData }],
            chart: {
                height: 300,
                type: "area",
                fontFamily: 'Inter, sans-serif',
                animations: { enabled: false },
                toolbar: { show: false },
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.05
                }
            },
            colors: ['#10b981'], // Emerald green
            dataLabels: { 
                enabled: true,
                background: {
                    foreColor: '#fff',
                    borderRadius: 2,
                    padding: 4,
                }
            },
            stroke: { curve: "smooth", width: 3 },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                    stops: [0, 90, 100]
                }
            },
            title: {
                text: "Évolution Globale (Moyenne)",
                align: "left",
                style: { fontSize: '16px', fontWeight: 600, color: '#1e293b' }
            },
            markers: {
                size: 6,
                colors: ["#fff"],
                strokeColors: "#10b981",
                strokeWidth: 3,
                hover: { size: 8 }
            }
        };

        // 5. Calculer le verdict et les stats
        const validScores = globalData.filter(v => v !== null) as number[];
        if (validScores.length > 0) {
            const firstScore = validScores[0];
            const lastScore = validScores[validScores.length - 1];
            
            if (validScores.length === 1) {
                this.verdict.set({ text: 'Données insuffisantes pour établir une tendance', type: 'neutral' });
            } else if (lastScore > firstScore + 0.5) {
                this.verdict.set({ text: 'En progression globale', type: 'positive' });
            } else if (lastScore < firstScore - 0.5) {
                this.verdict.set({ text: 'En baisse de régime', type: 'negative' });
            } else {
                this.verdict.set({ text: 'Évolution stable', type: 'neutral' });
            }
        } else {
            this.verdict.set(null);
        }

        const subjectAverages: {name: string, avg: number}[] = [];
        subjectMap.forEach((sessionGrades, subjectName) => {
            let sum = 0;
            let count = 0;
            sessionGrades.forEach(val => {
                if (val !== null) {
                    sum += val;
                    count++;
                }
            });
            if (count > 0) {
                subjectAverages.push({ name: subjectName, avg: sum / count });
            }
        });

        const weak = subjectAverages.filter(s => s.avg < 10).sort((a, b) => a.avg - b.avg).slice(0, 3);
        this.weakSubjects.set(weak);
    }
    
    printReport() {
        window.print();
    }

    closeModal() {
        this.close.emit();
    }
}
