import { Component, OnInit, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { ToastService } from '@core/services/toast.service';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiFormComponent],
    templateUrl: './role-form.component.html'
})
export class RoleFormComponent implements OnInit, OnChanges {
    fb = inject(FormBuilder);
    roleService = inject(RoleService);
    toast = inject(ToastService);

    @Input() role: any | null = null;
    @Output() cancel = new EventEmitter<void>();
    @Output() success = new EventEmitter<void>();

    form: FormGroup;
    isEditMode = false;
    roleId: number | null = null;

    // Permissions groupées par "tag" (module)
    permissionGroups: { tag: string, permissions: any[] }[] = [];

    // Liste plate des permissions cochées
    selectedPermissions: number[] = [];

    constructor() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            // Les permissions ne sont pas dans le FormGroup principal en tant que FormControl unique
            // On les gère à part ou via un FormArray si besoin, mais ici simple array d'IDs pour le payload
        });
    }

    ngOnInit(): void {
        this.loadPermissions();
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['role']) {
            this.initForm();
        }
    }

    initForm() {
        if (this.role) {
            this.isEditMode = true;
            this.roleId = this.role.id;
            this.form.patchValue({ name: this.role.name });
            // role.permissions est une liste d'objets, on veut les IDs
            this.selectedPermissions = this.role.permissions ? this.role.permissions.map((p: any) => p.id) : [];
        } else {
            this.isEditMode = false;
            this.roleId = null;
            this.form.reset();
            this.selectedPermissions = [];
        }
    }

    loadPermissions() {
        this.roleService.getPermissions().subscribe({
            next: (perms) => {
                this.groupPermissions(perms);
            },
            error: (err) => console.error('Erreur chargement permissions', err)
        });
    }

    groupPermissions(perms: any[]) {
        // Regrouper par 'tag'
        const groups: { [key: string]: any[] } = {};
        perms.forEach(p => {
            const tag = p.tag || 'Autre';
            if (!groups[tag]) groups[tag] = [];
            groups[tag].push(p);
        });

        this.permissionGroups = Object.keys(groups).map(tag => ({
            tag,
            permissions: groups[tag]
        }));
    }

    // loadRole removed as we use Input now

    togglePermission(permId: number, event: any) {
        const checked = event.target.checked;
        if (checked) {
            this.selectedPermissions.push(permId);
        } else {
            this.selectedPermissions = this.selectedPermissions.filter(id => id !== permId);
        }
    }

    isPermissionSelected(permId: number): boolean {
        return this.selectedPermissions.includes(permId);
    }

    save() {
        if (this.form.invalid) return;

        const payload = {
            ...this.form.value,
            permissions: this.selectedPermissions
        };

        const request$ = this.isEditMode
            ? this.roleService.save({ ...payload, id: this.roleId }) // Update
            : this.roleService.save(payload); // Create

        request$.subscribe({
            next: () => {
                // this.toast.success(`Rôle ${this.isEditMode ? 'modifié' : 'créé'} avec succès`); // Handled by parent
                this.success.emit();
            },
            error: (err) => {
                console.error(err);
                this.toast.error('Erreur lors de la sauvegarde');
            }
        });
    }
}
