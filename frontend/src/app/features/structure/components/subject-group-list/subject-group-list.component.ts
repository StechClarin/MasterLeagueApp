import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { SubjectGroupService } from '../../services/subject-group.service';
import { SubjectGroupType } from '@app/graphql/types';
import { SubjectGroupFormComponent } from '../subject-group-form/subject-group-form.component';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';

import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

import { GetAllSubjectGroupsDocument } from '../../graphql/structure.generated';

@Component({
    selector: 'app-subject-group-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SubjectGroupFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiFilterPanelComponent,
        UiDropdownComponent,
        UiExportModalComponent
    ],
    templateUrl: './subject-group-list.component.html'
})
export class SubjectGroupListComponent extends BaseModalListComponent<SubjectGroupType> implements AfterViewInit {
    query = GetAllSubjectGroupsDocument;
    responseKey = 'subjectgroups';
    public service = inject(SubjectGroupService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom du Groupe/UE', template: this.nameCell }
            ];
            this.cdr.detectChanges();
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    initFilterForm() {
        return this.fb.group({});
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

    protected override getExportConfig() {
        return {
            title: 'Liste des Groupes et UEs',
            columns: [
                { header: 'Nom', key: 'name' }
            ]
        }
    }
}
