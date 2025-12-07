import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './role-form.component.html'
})
export class RoleFormComponent implements OnInit {
    fb = inject(FormBuilder);
    roleService = inject(RoleService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    toast = inject(ToastService);

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

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.roleId = +params['id'];
                this.loadRole(this.roleId);
            }
        });
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

    loadRole(id: number) {
        this.roleService.get_by_id(id).subscribe({
            next: (role: any) => {
                this.form.patchValue({ name: role.name });
                // role.permissions est une liste d'IDs (grâce au Serializer)
                this.selectedPermissions = role.permissions || [];
            },
            error: (err: any) => {
                this.toast.error('Impossible de charger le rôle');
                this.router.navigate(['/profils/roles']); // Redirection si erreur
            }
        });
    }

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
                this.toast.success(`Rôle ${this.isEditMode ? 'modifié' : 'créé'} avec succès`);
                this.router.navigate(['/profils/roles']); // Retour liste (à adapter)
            },
            error: (err) => {
                console.error(err);
                this.toast.error('Erreur lors de la sauvegarde');
            }
        });
    }
}
