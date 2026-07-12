import { Component, inject, ViewChild, TemplateRef, ChangeDetectorRef, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { StudentService } from '../../services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { StudentDetailComponent } from '../student-detail/student-detail.component';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { StructureStateService } from '@core/services/structure-state.service';
import { EstablishmentService } from '@features/structure/services/establishment.service';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { UiStatusBadgeComponent } from '@shared/components/ui-status-badge/ui-status-badge.component';
import { UiAvatarComponent } from '@shared/components/ui-avatar/ui-avatar.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';

@Component({
    selector: 'app-student-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        StudentFormComponent,
        StudentDetailComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiDropdownComponent,
        UiStatusBadgeComponent,
        UiAvatarComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiExportModalComponent
    ],
    templateUrl: './student-list.component.html'
})
export class StudentListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit, OnDestroy {

    service = inject(StudentService);
    classService = inject(ClassRoomService);
    academicYearService = inject(AcademicYearService);
    enrollmentService = inject(EnrollmentService);
    establishmentService = inject(EstablishmentService);

    query = this.service.getQuery();
    responseKey = 'students';
    formComponent = StudentFormComponent;

    // Filters
    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    classrooms$ = this.classService.list();
    academicYears$ = this.academicYearService.list();
    


    private destroy$ = new Subject<void>();
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('studentCell') studentCell!: TemplateRef<any>;
    @ViewChild('classCell') classCell!: TemplateRef<any>;
    @ViewChild('statusCell') statusCell!: TemplateRef<any>;
    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    override initFilterForm(): FormGroup {
        return this.fb.group({
            search: [''],
            classroomId: [null],
            academicYearId: [null],
            status: [null],
            parentPhone: ['']
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();

        // Sync Search
        this.searchControl.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe((val: any) => {
            this.filterForm.patchValue({ search: val });
        });

        // Auto-refresh on filter change
        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Élève', template: this.studentCell },
                { header: 'Matricule', key: 'matricule' },
                { header: 'Classe Actuelle', template: this.classCell },
                { header: 'Statut', template: this.statusCell }
            ];
            this.cdr.detectChanges();
        });
    }







    getStatusLabel(status: string): string {
        const labels: any = {
            'REGISTERED': 'Inscrit',
            'LEFT': 'Parti',
            'EXPELLED': 'Renvoyé'
        };
        return labels[status] || 'Non inscrit';
    }

    getStatusClass(status: string): string {
        const base = 'px-2.5 py-1 rounded-full text-xs font-bold border ';
        const classes: any = {
            'REGISTERED': base + 'bg-green-50 text-green-700 border-green-100',
            'LEFT': base + 'bg-gray-50 text-gray-700 border-gray-100',
            'EXPELLED': base + 'bg-red-50 text-red-700 border-red-100'
        };
        return classes[status] || base + 'bg-gray-50 text-gray-400 border-gray-100';
    }

    isMode(mode: string): boolean {
        return (this.modalMode() as any) === mode;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.filterForm.reset();
        this.searchControl.setValue('');
    }

    // Import / Export

    onDownloadTemplate() {
        this.service.downloadTemplate().subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'import_template_eleves.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    onImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx, .csv';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                this.service.import(file).subscribe({
                    next: () => {
                        this.toastService.success('Import réussi');
                        this.refresh();
                    },
                    error: () => this.toastService.error('Erreur lors de l\'import')
                });
            }
        };
        input.click();
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Élèves',
            columns: [
                { header: 'Matricule', key: 'matricule' },
                { header: 'Prénom', key: 'firstName' },
                { header: 'Nom', key: 'lastName' },
                {
                    header: 'Sexe',
                    key: 'gender',
                    format: (v: string) => v === 'M' ? 'Masculin' : 'Féminin'
                },
                {
                    header: 'Date de Naissance',
                    key: 'dateOfBirth',
                    format: (v: string) => v ? new Date(v).toLocaleDateString('fr-FR') : '-'
                },
                { header: 'Lieu de Naissance', key: 'placeOfBirth' },
                { header: 'Classe', key: 'enrollments.0.classroom.name' },
                {
                    header: 'Téléphone Parent',
                    key: 'guardians',
                    format: (gs: any[]) => gs?.map(g => g.phoneNumber).join(', ') || '-'
                }
            ]
        };
    }

    // Helpers for Template
    getCurrentEnrollment(student: any) {
        if (!student.enrollments || student.enrollments.length === 0) return null;
        return student.enrollments[0];
    }
}
