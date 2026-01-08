import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { LevelService } from '../../services/level.service';
import { CycleService } from '../../services/cycle.service';
import { LevelType, CycleType } from '@app/graphql/generated';
import { LevelFormComponent } from '../level-form/level-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';

@Component({
    selector: 'app-level-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LevelFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent
    ],
    templateUrl: './level-list.component.html'
})
export class LevelListComponent extends BaseModalListComponent<LevelType> implements AfterViewInit, OnDestroy {
    query = inject(LevelService).getQuery();
    responseKey = 'levels';
    public service = inject(LevelService);
    private cycleService = inject(CycleService);

    searchControl = new FormControl('');
    @Input() showPagination = true;
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    // Cycles for filter dropdown
    cycles$ = this.cycleService.getAllCycles().valueChanges.pipe(
        map(result => result.data?.cycles?.items || [])
    );

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('cycleCell') cycleCell!: TemplateRef<any>;

    @Input() isEmbedded: boolean = false;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Abréviation', key: 'shortName' }, // Added this which was in export config but not in table
                { header: 'Ordre', key: 'order' },
                { header: 'Cycle', template: this.cycleCell },
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

    initFilterForm() {
        return this.fb.group({
            cycleId: ['']
        });
    }

    protected override getFilterVariables(): any {
        const values = { ...this.filterForm.value };
        values.search = this.searchControl.value || '';

        // Clean up empty filters
        if (!values.cycleId) delete values.cycleId;

        return values;
    }

    dispatchFilters() {
        this.refresh();
    }

    toggleFilters() {
        this.isFiltersOpen.update(v => !v);
    }

    resetFilters() {
        this.searchControl.setValue('');
        this.filterForm.reset();
    }
}
