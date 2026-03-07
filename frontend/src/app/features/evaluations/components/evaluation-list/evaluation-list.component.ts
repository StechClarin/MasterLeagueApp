import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { EvaluationService } from '../../services/evaluation.service';
import { EvaluationSessionFieldsFragment } from '../../graphql/evaluations.generated';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';

// Shared UI Imports
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Structure Services for Filters
import { AcademicPeriodService } from '../../../structure/services/academic_period.service';
import { LevelService } from '../../../structure/services/level.service';
import { ClassRoomService } from '../../../structure/services/classroom.service';
import { SubjectService as StructureSubjectService } from '../../../structure/services/subject.service';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-evaluation-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EvaluationFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiDropdownComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiSelectComponent
    ],
    templateUrl: './evaluation-list.component.html'
})
export class EvaluationListComponent extends BaseModalListComponent<EvaluationSessionFieldsFragment> implements AfterViewInit, OnDestroy {
    public service = inject(EvaluationService);
    private router = inject(Router);
    private periodService = inject(AcademicPeriodService);
    private levelService = inject(LevelService);
    private classroomService = inject(ClassRoomService);
    private subjectService = inject(StructureSubjectService);

    query = this.service.getQuery();
    responseKey = 'evaluationSessions';

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();
    private toast = inject(ToastService);

    statusConfirmMessage = '';
    targetStatus = '';

    // Filters Data
    periods$ = this.periodService.list();
    levels$ = this.levelService.list();
    classrooms$ = this.classroomService.list();
    subjects$ = this.subjects_list();

    private subjects_list() {
        return this.subjectService.list();
    }

    @ViewChild('titleCell') titleCell!: TemplateRef<any>;
    @ViewChild('evalTypeCell') evalTypeCell!: TemplateRef<any>;
    @ViewChild('periodCell') periodCell!: TemplateRef<any>;
    @ViewChild('scopeCell') scopeCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;
    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Titre de l\'examen', template: this.titleCell },
                { header: 'Type', template: this.evalTypeCell },
                { header: 'Période', template: this.periodCell },
                { header: 'Portée', template: this.scopeCell },
                { header: 'Statut', template: this.statusCell },
            ];
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    override ngOnInit(): void {
        this.filterForm = this.initFilterForm();
        super.ngOnInit();

        // Sync Search -> Refresh
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });

        // Sync Filters -> Refresh
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }

    initFilterForm() {
        return this.fb.group({
            period: [''],
            level: [''],
            classroom: [''],
            subject: [''],
            evaluationType: [''],
            status: ['']
        });
    }

    protected override getFilterVariables(): any {
        const values: any = { ...this.filterForm.value };
        values.search = this.searchControl.value || '';

        // Convert string IDs to Int if needed by backend
        if (values.period) values['periodId'] = parseInt(values.period as string);
        if (values.level) values['levelId'] = parseInt(values.level as string);
        if (values.classroom) values['classroomId'] = parseInt(values.classroom as string);
        if (values.subject) values['subjectId'] = parseInt(values.subject as string);
        if (values.evaluationType) values['evaluationTypeId'] = parseInt(values.evaluationType as string);

        delete values['period'];
        delete values['level'];
        delete values['classroom'];
        delete values['subject'];
        delete values['evaluationType'];

        return values;
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
        this.filterForm.reset();
    }

    exportPlanning(item: EvaluationSessionFieldsFragment) {
        const url = `/print/evaluation-planning/${item.id}`;
        window.open(url, '_blank');
        this.toast.success(`Génération du PDF du planning pour "${item.title}" en cours...`);
    }

    goToGrades(item: EvaluationSessionFieldsFragment) {
        // Sessions have multiple subjects now.
        console.log('Go to grades for session:', item.id);
    }

    getSubjectCount(item: any): number {
        return item.subjects?.length || 0;
    }

    getDateRange(item: any): string {
        if (!item.subjects || item.subjects.length === 0) return 'Dates non définies';

        let allDates: Date[] = [];

        for (const subject of item.subjects) {
            if (subject.plannings) {
                for (const planning of subject.plannings) {
                    if (planning.date) {
                        allDates.push(new Date(planning.date));
                    }
                }
            }
        }

        if (allDates.length === 0) return 'Dates non définies';

        // Sort dates
        allDates.sort((a, b) => a.getTime() - b.getTime());

        const minDate = allDates[0];
        const maxDate = allDates[allDates.length - 1];

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

        if (minDate.getTime() === maxDate.getTime()) {
            return `Le ${minDate.toLocaleDateString('fr-FR', options)}`;
        } else {
            return `Du ${minDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${maxDate.toLocaleDateString('fr-FR', options)}`;
        }
    }

    onChangeStatus(item: EvaluationSessionFieldsFragment, newStatus: string) {
        this.selectedItem.set(item);
        this.targetStatus = newStatus;

        const labels: { [key: string]: string } = {
            'IN_PROGRESS': 'Lancé',
            'COMPLETED': 'Clôturé',
            'CANCELLED': 'Annulé'
        };

        this.statusConfirmMessage = `Voulez-vous vraiment passer l'évaluation "${item.title}" au statut "${labels[newStatus]}" ?`;
        this.modalMode.set('change-status' as any);
        this.isModalOpen.set(true);
        this.closeMenu();
    }

    confirmStatusChange() {
        const item = this.selectedItem();
        if (!item || !this.targetStatus) return;

        this.service.changeStatus(item.id, this.targetStatus).subscribe({
            next: () => {
                this.toast.success('Statut mis à jour avec succès');
                this.closeModal();
                this.refresh();
            },
            error: () => this.toast.error('Erreur lors de la mise à jour du statut')
        });
    }
}
