import { Component, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { RoomService } from '../../services/room.service';
import { RoomFormComponent } from '../room-form/room-form.component';

// Shared UI Imports
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';

@Component({
    selector: 'app-room-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RoomFormComponent,
        UiModalComponent,
        UiPaginationComponent,
        UiListPageComponent,
        UiToolbarComponent,
        UiConfirmModalComponent,
        UiTableComponent,
        UiDropdownComponent
    ],
    templateUrl: './room-list.component.html'
})
export class RoomListComponent extends BaseModalListComponent<any> implements AfterViewInit {
    public service = inject(RoomService);
    query = this.service.getQuery();
    responseKey = 'rooms';

    searchControl = new FormControl('');
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('nameCell') nameCell!: TemplateRef<any>;
    @ViewChild('capacityCell') capacityCell!: TemplateRef<any>;
    @ViewChild('roomTypeCell') roomTypeCell!: TemplateRef<any>;
    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom de la salle', template: this.nameCell },
                { header: 'Type de local', template: this.roomTypeCell },
                { header: 'Capacité (Élèves)', template: this.capacityCell }
            ];
            this.cdr.detectChanges();
        });
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.searchControl.valueChanges.subscribe(() => {
            this.currentPage.set(1);
            this.refresh();
        });
    }

    initFilterForm(): FormGroup {
        return this.fb.group({});
    }

    protected override getFilterVariables(): any {
        return {
            ...this.filterForm.value,
            search: this.searchControl.value || ''
        };
    }

    // --- Helpers d'affichage du type de local ---
    roomTypeLabel(value: string): string {
        const labels: Record<string, string> = {
            CLASSROOM: 'Salle de classe',
            OFFICE: 'Bureau',
            LABORATORY: 'Laboratoire',
            LIBRARY: 'Bibliothèque',
            STORAGE: 'Autre / Stockage'
        };
        return labels[value] || value || '—';
    }

    roomTypeBadgeClass(value: string): string {
        const classes: Record<string, string> = {
            CLASSROOM: 'bg-indigo-100 text-indigo-700',
            OFFICE: 'bg-emerald-100 text-emerald-700',
            LABORATORY: 'bg-amber-100 text-amber-700',
            LIBRARY: 'bg-purple-100 text-purple-700',
            STORAGE: 'bg-slate-100 text-slate-600'
        };
        return classes[value] || 'bg-slate-100 text-slate-600';
    }
}
