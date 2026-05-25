import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { ClassRoomService } from '../../services/classroom.service';
import { ClassRoomType } from '@app/graphql/types';
import { ClassRoomFormComponent } from '../classroom-form/classroom-form.component';
import { LevelService } from '../../services/level.service';
import { map } from 'rxjs/operators';

import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';

import { UiFilterPanelComponent } from '@shared/components/ui-filter-panel/ui-filter-panel.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

@Component({
    selector: 'app-classroom-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ClassRoomFormComponent,
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
    templateUrl: './classroom-list.component.html'
})
export class ClassRoomListComponent extends BaseModalListComponent<ClassRoomType> implements AfterViewInit {
    query = inject(ClassRoomService).getQuery();
    responseKey = 'classrooms';
    public service = inject(ClassRoomService);

    searchControl = new FormControl('');
    isFiltersOpen = signal(false);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('capacityCell') capacityCell!: TemplateRef<any>;
    @ViewChild('levelCell') levelCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom', template: this.nameCell },
                { header: 'Capacité', template: this.capacityCell },
                { header: 'Niveau', template: this.levelCell },
            ];
            this.cdr.detectChanges();
        });
    }

    override ngOnInit(): void {
        this.filterForm = this.initFilterForm();
        super.ngOnInit();
    }

    levelService = inject(LevelService);
    levels$ = this.levelService.getAll().pipe(map((res: any) => res.data?.levels?.items || []));

    initFilterForm() {
        return this.fb.group({
            levelId: [''],
            search: ['']
        });
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.isLoading.set(true);
            this.service.import(file).subscribe({
                next: () => {
                    this.toastService.success('Importation réussie.');
                    this.isLoading.set(false);
                    this.refresh();
                },
                error: (err: any) => {
                    this.toastService.error('Erreur lors de l\'importation.');
                    this.isLoading.set(false);
                    console.error(err);
                }
            });
        }
        event.target.value = '';
    }

    onDownloadTemplate() {
        this.isLoading.set(true);
        this.service.downloadTemplate().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `template_classrooms.xlsx`;
                link.click();
                window.URL.revokeObjectURL(url);
                this.isLoading.set(false);
                this.toastService.success('Modèle téléchargé avec succès');
            },
            error: (err) => {
                console.error('Template download error', err);
                this.isLoading.set(false);
                this.toastService.error('Erreur lors du téléchargement du modèle');
            }
        });
    }

    private downloadFile(blob: Blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `classrooms_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Classes',
            columns: [
                { header: 'Nom', key: 'name' },
                { header: 'Capacité', key: 'capacity' },
                { header: 'Niveau', key: 'level.name' }
            ]
        }
    }
}
