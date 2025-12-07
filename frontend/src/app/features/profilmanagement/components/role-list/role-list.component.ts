import { Component, OnInit, inject, signal } from '@angular/core';
// Trigger rebuild
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseListComponent } from '@core/abstracts/base-list.component';
import { RoleService } from '../../services/role.service';
import { GET_ALL_ROLES } from '../../graphql/user.queries';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiPaginationComponent } from '@shared/components/ui-pagination/ui-pagination.component';
import { UiDropdownComponent } from '@shared/components/ui-dropdown/ui-dropdown.component';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiModalComponent, UiPaginationComponent, UiDropdownComponent],
    templateUrl: './role-list.component.html'
})
export class RoleListComponent extends BaseListComponent<any> implements OnInit {

    query = GET_ALL_ROLES;
    responseKey = 'roles';

    public service = inject(RoleService);
    private router = inject(Router);
    // toastService inherited from BaseListComponent is protected, so we can use it.

    searchControl = new FormControl('');

    // Modal State
    isModalOpen = signal(false);
    modalMode = signal<'delete'>('delete');
    selectedRole = signal<any>(null);

    // Dropdown State
    activeMenuId = signal<number | null>(null);

    override ngOnInit(): void {
        super.ngOnInit();

        // Simple search filter (local filtering could be done if backend doesn't support it, 
        // but BaseListComponent sends it to query. If query ignores it, we're fine).
        this.searchControl.valueChanges.subscribe(val => {
            this.filterForm.patchValue({ name: val });
            this.refresh();
        });
    }

    initFilterForm(): FormGroup {
        return this.fb.group({
            name: [''] // Paramètre 'name' pour le filtrage éventuel
        });
    }

    // Actions
    onEdit(role: any) {
        this.closeMenu();
        this.router.navigate(['/profils/roles/edit', role.id]);
    }

    onDelete(role: any) {
        this.closeMenu();
        this.selectedRole.set(role);
        this.modalMode.set('delete');
        this.isModalOpen.set(true);
    }

    confirmDelete() {
        const role = this.selectedRole();
        if (!role) return;

        this.service.delete(role.id).subscribe({
            next: () => {
                this.refresh();
                this.closeModal();
                this.toastService.success(`Rôle "${role.name}" supprimé avec succès.`);
            },
            error: (err) => {
                console.error('Erreur suppression role', err);
                this.toastService.error('Impossible de supprimer ce rôle.');
            }
        });
    }

    // UI Helpers
    openModal() {
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.selectedRole.set(null);
    }

    toggleMenu(roleId: number, event?: Event) {
        if (event) event.stopPropagation();
        if (this.activeMenuId() === roleId) {
            this.closeMenu();
        } else {
            this.activeMenuId.set(roleId);
        }
    }

    closeMenu() {
        this.activeMenuId.set(null);
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
