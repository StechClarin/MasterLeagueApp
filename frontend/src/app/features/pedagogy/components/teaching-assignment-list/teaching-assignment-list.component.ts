import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { TeachingAssignmentService } from '../../services/teaching-assignment.service';
import { TeachingAssignmentType } from '@app/graphql/generated';
import { TeachingAssignmentFormComponent } from '../teaching-assignment-form/teaching-assignment-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-teaching-assignment-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TeachingAssignmentFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent
    ],
    templateUrl: './teaching-assignment-list.component.html'
})
export class TeachingAssignmentListComponent extends BaseModalListComponent<TeachingAssignmentType> implements AfterViewInit, OnDestroy {
    query = inject(TeachingAssignmentService).getQuery();
    responseKey = 'teachingAssignments'; // Must match GraphQL query/response
    public service = inject(TeachingAssignmentService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @ViewChild('teacherCell') teacherCell!: TemplateRef<any>;
    @ViewChild('subjectCell') subjectCell!: TemplateRef<any>;
    @ViewChild('dateCell') dateCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Année', key: 'academicYear.name' },
                { header: 'Classe', key: 'classroom.name' },
                { header: 'Matière', template: this.subjectCell },
                { header: 'Enseignant', template: this.teacherCell },
                { header: 'Période', template: this.dateCell },
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

        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });

        this.filterForm.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }

    protected override getFilterVariables(): any {
        const values = { ...this.filterForm.value };
        values.search = this.searchControl.value || '';
        return values;
    }

    initFilterForm() {
        return this.fb.group({
            // Add specific filters here if needed (e.g. academic_year_id, classroom_id)
        });
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
        this.filterForm.reset();
    }
}
