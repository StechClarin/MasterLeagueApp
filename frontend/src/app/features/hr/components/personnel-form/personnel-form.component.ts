import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { PersonnelService } from '../../services/personnel.service';
import { RoleService } from '../../../profilmanagement/services/role.service';
import { map } from 'rxjs/operators';
import { EstablishmentService } from '../../../structure/services/establishment.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-personnel-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiModalComponent,
        UiInputComponent,
        UiSelectComponent
    ],
    templateUrl: './personnel-form.component.html'
})
export class PersonnelFormComponent extends BaseModalFormComponent implements OnInit {
    form!: FormGroup; // Implemented abstract property
    service = inject(PersonnelService);
    roleService = inject(RoleService);
    establishmentService = inject(EstablishmentService);

    roles$ = this.roleService.getAll().pipe(map((res: any) => res.data?.roles?.items || []));
    establishments$ = this.establishmentService.getAll().pipe(map((res: any) => res.data?.establishments?.items || []));

    constructor() {
        super();
    }

    get isEditMode(): boolean {
        return !!this.data;
    }

    initForm(): FormGroup {
        return this.fb.group({
            matricule: ['', Validators.required],
            job_title: ['', Validators.required],
            // roles: [[], Validators.required], // Removed as sticking to single role based on logic, or kept if multi-role?
            // "role" field is usually single in Personnel model (FK). 
            // The logic earlier had 'roles' and 'role'. I'll stick to 'role' (single) as per model.
            role: [null, Validators.required],
            establishment: [null, Validators.required],
            user: this.fb.group({
                first_name: ['', Validators.required],
                last_name: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
            }),
            email_pro: ['', [Validators.required, Validators.email]],
            phone_number: [''],
        });
    }

    save(): Observable<any> {
        const payload = {
            ...this.form.value,
            // Ensure ID is passed if editing, though check BaseService save logic
            id: this.data?.id
        };
        return this.service.save(payload);
    }

    // Override patchValue to handle nested user data mapping if names differ or structural issues
    override patchValue(data: any): void {
        if (!data) return;

        const formData = {
            ...data,
            role: data.role?.id,
            establishment: data.establishment?.id,
            user: {
                first_name: data.user?.firstName,
                last_name: data.user?.lastName,
                email: data.user?.email
            }
        };
        this.form.patchValue(formData);
    }
}
