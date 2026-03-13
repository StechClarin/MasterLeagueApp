import { Component, OnInit, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { RoleService } from '../../services/role.service';
import { ToastService } from '@core/services/toast.service';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';

import { BaseFormComponent } from '@core/abstracts/base-form.component';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, UiFormComponent],
    templateUrl: './role-form.component.html'
})
export class RoleFormComponent extends BaseFormComponent implements OnInit, OnChanges {
    fb = inject(FormBuilder);
    roleService = inject(RoleService);
    toast = inject(ToastService);

    @Input() role: any | null = null;
    @Output() override cancel = new EventEmitter<void>();
    @Output() override success = new EventEmitter<void>();

    form: FormGroup;
    isEditMode = false;
    roleId: number | null = null;

    // Permissions groupées par "tag" (module)
    permissionGroups: { tag: string, permissions: any[] }[] = [];

    // Liste plate des permissions cochées
    selectedPermissions: number[] = [];

    constructor() {
        super();
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
        });
    }

    override ngOnInit(): void {
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

    // ... existing properties
    searchTerm: string = '';
    collapsedGroups: Set<string> = new Set<string>();

    get filteredPermissionGroups() {
        if (!this.searchTerm.trim()) {
            return this.permissionGroups;
        }
        const term = this.searchTerm.toLowerCase();
        return this.permissionGroups.map(group => {
            // Check if group matches
            const groupMatches = group.tag.toLowerCase().includes(term);

            // Check if any permission matches
            const matchingPermissions = group.permissions.filter(p =>
                p.name.toLowerCase().includes(term) || groupMatches
            );

            if (matchingPermissions.length > 0) {
                return { ...group, permissions: matchingPermissions };
            }
            return null;
        }).filter(g => g !== null) as { tag: string, permissions: any[] }[];
    }

    toggleCollapse(tag: string) {
        if (this.collapsedGroups.has(tag)) {
            this.collapsedGroups.delete(tag);
        } else {
            this.collapsedGroups.add(tag);
        }
    }

    isCollapsed(tag: string): boolean {
        // If searching, force expand for better visibility
        if (this.searchTerm.trim()) return false;
        return this.collapsedGroups.has(tag);
    }

    expandAll() {
        this.collapsedGroups.clear();
    }

    collapseAll() {
        this.permissionGroups.forEach(g => this.collapsedGroups.add(g.tag));
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

    save(): Observable<any> {
        if (this.form.invalid) return new Observable(subscriber => subscriber.error('Form invalid'));

        const payload = {
            ...this.form.value,
            permissions: this.selectedPermissions
        };

        const request$ = this.isEditMode
            ? this.roleService.save({ ...payload, id: this.roleId }) // Update
            : this.roleService.save(payload); // Create

        return request$;
    }
}
