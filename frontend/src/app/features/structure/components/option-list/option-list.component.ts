import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { OptionService } from '../../services/option.service';
import { OptionType } from '@app/graphql/types';
import { OptionFormComponent } from '../option-form/option-form.component';

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
    selector: 'app-option-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        OptionFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent
    ],
    templateUrl: './option-list.component.html'
})
export class OptionListComponent extends BaseModalListComponent<OptionType> implements AfterViewInit, OnDestroy {
    query = inject(OptionService).getQuery();
    responseKey = 'options';
    public service = inject(OptionService);

    searchControl = new FormControl('');
    @Input() showPagination = true;
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('parentCell') parentCell!: TemplateRef<any>;
    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    @Input() isEmbedded: boolean = false;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom / Spécialité', template: this.nameCell },
                { header: 'Code', key: 'code' },
                { header: 'Filière Parente', template: this.parentCell }
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
            parentId: ['']
        });
    }

    protected override getFilterVariables(): any {
        const values = { ...this.filterForm.value };
        values.search = this.searchControl.value || '';

        if (!values.parentId) delete values.parentId;

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
