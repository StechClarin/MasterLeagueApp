import { Component, OnInit, inject, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { BaseModalListComponent } from '@core/abstracts/base-modal-list.component';
import { RoleService } from '../../services/role.service';
import { UiListPageComponent } from '@shared/components/ui-list-page/ui-list-page.component';
import { UiExportModalComponent } from '@shared/components/ui-export-modal/ui-export-modal.component';
import { UiToolbarComponent } from '@shared/components/ui-toolbar/ui-toolbar.component';
import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiTableComponent, UiTableColumn } from '@shared/components/ui-table/ui-table.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { RoleFormComponent } from '../role-form/role-form.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component'; // Assuming UiModalComponent is needed and imported somewhere else, or it's a typo in the original imports. I'll keep it as it was in the original imports.
import { HasPermissionDirective } from '@core/guards/has-permission.directive';

import { PermissionService } from '@core/services/permission.service';

@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiPaginationComponent, UiDropdownComponent, UiModalComponent, RoleFormComponent, UiListPageComponent, UiExportModalComponent, UiToolbarComponent, UiConfirmModalComponent, UiTableComponent, HasPermissionDirective],
    templateUrl: './role-list.component.html'
})
export class RoleListComponent extends BaseModalListComponent<any> implements OnInit, AfterViewInit {

    query = inject(RoleService).getQuery(); // Dynamic Query
    responseKey = 'roles';

    public service = inject(RoleService);
    public permissionService = inject(PermissionService);

    searchControl = new FormControl('');

    override ngOnInit(): void {
        super.ngOnInit();

        this.searchControl.valueChanges.subscribe(val => {
            this.filterForm.patchValue({ name: val });
            this.refresh();
        });
    }

    @ViewChild('permissionsCell') permissionsCell!: TemplateRef<any>;
    @ViewChild('actionsCell') actionsCell!: TemplateRef<any>;

    tableColumns: UiTableColumn[] = [];

    initFilterForm(): FormGroup {
        return this.fb.group({
            name: ['']
        });
    }

    private cdr = inject(ChangeDetectorRef);

    ngAfterViewInit() {
        setTimeout(() => {
            this.tableColumns = [
                { header: 'Nom du Rôle', key: 'name', className: 'font-semibold text-gray-900' },
                { header: 'Permissions', template: this.permissionsCell }
            ];
            this.cdr.detectChanges();
        });
    }

    protected override getExportConfig() {
        return {
            title: 'Liste des Rôles',
            columns: [
                { header: 'ID', key: 'id' },
                { header: 'Nom', key: 'name' },
                { header: 'Permissions', key: 'permissions', format: (perms: any[]) => perms ? perms.length + ' permissions' : '0' }
            ]
        };
    }
}
