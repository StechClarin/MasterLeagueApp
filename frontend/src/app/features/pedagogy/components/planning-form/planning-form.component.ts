import { Component, computed, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule, Validators, FormGroup, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { PlanningService } from '../../services/planning.service';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

export function timeRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('heure_debut')?.value;
    const end = group.get('heure_fin')?.value;

    if (start && end && start >= end) {
        return { timeRange: true };
    }
    return null;
}

import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';

@Component({
    selector: 'app-planning-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiSelectComponent, UiTabsComponent, UiFormHeaderComponent, UiFormActionsComponent],
    templateUrl: './planning-form.component.html',
    styles: [`
    :host {
        display: block;
        animation: slideIn 0.4s cubic-bezier(0, 0, 0.2, 1);
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .tab-container {
        scrollbar-width: none;
    }
    .tab-container::-webkit-scrollbar {
        display: none;
    }
    .btn-gradient {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    }
    .btn-gradient:hover {
        background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
        transform: translateY(-1px);
        box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
    }
  `]
})
export class PlanningFormComponent extends BaseFormComponent implements OnInit {
    form!: FormGroup;

    service = inject(PlanningService);
    private fb = inject(FormBuilder);
    structureState = inject(StructureStateService);

    teachers = signal<any[]>([]);
    subjects = signal<any[]>([]);
    classrooms = signal<any[]>([]);
    rooms = signal<any[]>([]);

    // Form value signals for reactive tabs
    private dateStartSignal = signal<string>('');
    private dateEndSignal = signal<string>('');

    tabs = computed(() => {
        const start = this.dateStartSignal();
        const end = this.dateEndSignal();
        if (!start || !end) return [] as Tab[];
        return this.getDaysArray(new Date(start), new Date(end));
    });

    activeTab = signal<string>('');

    override ngOnInit() {
        this.initForm();
        super.ngOnInit();
        this.loadDependencies();

        // Listen to date changes manually to update signals
        this.form.get('date_start')?.valueChanges.pipe(startWith(this.form.get('date_start')?.value)).subscribe(v => {
            this.dateStartSignal.set(v);
            this.updateActiveTabFallback();
            this.calculateSmartName();
        });
        this.form.get('date_end')?.valueChanges.pipe(startWith(this.form.get('date_end')?.value)).subscribe(v => {
            this.dateEndSignal.set(v);
            this.updateActiveTabFallback();
        });
    }

    private updateActiveTabFallback() {
        const currentTabs = this.tabs();
        if (currentTabs.length > 0 && !this.activeTab()) {
            this.activeTab.set(currentTabs[0].id);
        }
    }

    activeYearStartDate: Date | null = null;
    currentWeekNumber = signal<number | null>(null);

    loadDependencies() {
        this.service.getDependencies().subscribe(res => {
            const rawTeachers = res.data.teachers?.items || [];
            // Filter only teachers (Role Check)
            const filteredTeachers = rawTeachers.filter((t: any) =>
                t.roles?.some((r: any) => {
                    const rName = r.name.toUpperCase();
                    return rName === 'TEACHER' || rName === 'ENSEIGNANT' || rName === 'PROFESSEUR';
                })
            );

            this.teachers.set(filteredTeachers.map((t: any) => ({
                id: t.id,
                fullName: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}` : t.matricule
            })));
            this.subjects.set(res.data.subjects?.items || []);
            this.classrooms.set(res.data.classrooms?.items || []);
            this.rooms.set(res.data.rooms?.items || []);

            // Active Year Logic
            const years = res.data.academicyears?.items || [];
            const active = years.find((y: any) => y.isActive);
            if (active && active.startDate) {
                this.activeYearStartDate = new Date(active.startDate);
                // Trigger calculation if date already set
                this.calculateSmartName();
            }
        });
    }

    private calculateSmartName() {
        if (!this.activeYearStartDate) return;

        const startStr = this.form.get('date_start')?.value;
        if (!startStr) return;

        const start = new Date(startStr);
        const diffTime = start.getTime() - this.activeYearStartDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNum = Math.floor(diffDays / 7) + 1;

        if (weekNum > 0) {
            this.currentWeekNumber.set(weekNum);

            // Auto-fill Name if empty or matches pattern
            const currentName = this.form.get('nom')?.value || '';
            const isAutoPattern = /^Semaine \d+/.test(currentName) || currentName === '';

            if (isAutoPattern && !this.form.get('id')?.value) { // Only on creation or if pattern
                // Get Year from active date?
                const year = this.activeYearStartDate.getFullYear();
                // If school year spans 2 years, maybe use Academic Year Name?
                // But let's stick to "Semaine N".
                this.form.patchValue({ nom: `Semaine ${weekNum}` });
            }
        }
    }

    initForm() {
        this.form = this.fb.group({
            id: [null],
            nom: ['', Validators.required],
            date_start: [null, Validators.required],
            date_end: [null, Validators.required],
            is_template: [false],
            establishment_id: [this.structureState.currentEstablishmentId()],
            details: this.fb.array([])
        });
    }

    get details() { return this.form.get('details') as FormArray; }

    getDetailsControlsForDate(dateStr: string) {
        if (!this.details) return [];
        return this.details.controls.filter(c => c.get('date')?.value === dateStr);
    }

    addDetail(dateStr: string) {
        const group = this.fb.group({
            id: [null],
            date: [dateStr],
            heure_debut: ['08:00', Validators.required],
            heure_fin: ['10:00', Validators.required],
            enseignant_id: [null, Validators.required],
            matiere_id: [null, Validators.required],
            classe_id: [null, Validators.required],
            salle_id: [null],
            establishment_id: [this.structureState.currentEstablishmentId()]
        }, { validators: [timeRangeValidator] });

        this.details.push(group);
    }

    removeDetailControl(control: AbstractControl) {
        const index = this.details.controls.indexOf(control);
        if (index > -1) {
            this.details.removeAt(index);
        }
    }

    getDaysArray(start: Date, end: Date): Tab[] {
        const arr: Tab[] = [];
        const dt = new Date(start);
        // Safety limit to 31 days to avoid browser crash on malformed dates
        let limit = 0;
        while (dt <= end && limit < 31) {
            const dateStr = dt.toISOString().split('T')[0];
            arr.push({
                id: dateStr,
                label: dt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
            });
            dt.setDate(dt.getDate() + 1);
            limit++;
        }
        return arr;
    }

    save() {
        const estId = this.structureState.currentEstablishmentId();
        this.form.patchValue({ establishment_id: estId });
        this.details.controls.forEach(c => {
            if (!c.get('establishment_id')?.value) {
                c.patchValue({ establishment_id: estId });
            }
        });
        return this.service.save(this.form.value);
    }

    @Input() set item(val: any) {
        if (val) {
            this.form.patchValue({
                id: val.id,
                nom: val.nom,
                date_start: val.dateStart,
                date_end: val.dateEnd,
                is_template: val.isTemplate,
                establishment_id: val.establishment?.id || this.structureState.currentEstablishmentId()
            });

            if (val.details && Array.isArray(val.details)) {
                this.details.clear();
                val.details.forEach((d: any) => {
                    this.details.push(this.fb.group({
                        id: d.id,
                        date: d.date,
                        heure_debut: d.heureDebut,
                        heure_fin: d.heureFin,
                        enseignant_id: d.enseignant?.id,
                        matiere_id: d.matiere?.id,
                        classe_id: d.classe?.id,
                        salle_id: d.salle?.id,
                        establishment_id: d.establishment?.id || this.structureState.currentEstablishmentId()
                    }, { validators: [timeRangeValidator] }));
                });

                this.updateActiveTabFallback();
            }
        }
    }
    get formattedActiveDate(): string {
        const dateStr = this.activeTab();
        if (!dateStr) return '';
        const date = new Date(dateStr);
        // Capitalize first letter of the full date string
        const str = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    get minDate(): string {
        return new Date().toISOString().split('T')[0];
    }
}
