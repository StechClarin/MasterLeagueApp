import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { UiModalComponent } from '@shared/components/ui-modal/ui-modal.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { PersonnelService } from '../../services/personnel.service';
import { RoleService } from '../../../profilmanagement/services/role.service';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { EstablishmentService } from '../../../structure/services/establishment.service';
import { Observable, of } from 'rxjs';
import { GetAllContractTypesGQL, GetAllPersonnelsGQL } from '@app/graphql/generated';

import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';

@Component({
    selector: 'app-personnel-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiModalComponent,
        UiConfirmModalComponent,
        UiInputComponent,
        UiSelectComponent,
        UiMultiSelectComponent,
        UiTabsComponent
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
    contractTypes$ = inject(GetAllContractTypesGQL).watch().valueChanges.pipe(map((res: any) => res.data?.contractTypes?.items || []));
    private getAllPersonnelsGQL = inject(GetAllPersonnelsGQL);

    // User Search
    userSearchControl = this.fb.control('');
    foundUsers$: Observable<any[]> = this.userSearchControl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(term => {
            if (!term || term.length < 3) return of([]);
            // Search Personnels instead of Users to get full details
            return this.getAllPersonnelsGQL.watch({ search: term, pageSize: 5 }).valueChanges.pipe(
                map((res: any) => res.data.personnels.items.map((p: any) => ({
                    ...p.user, // Spread user fields (username, firstName, lastName, email)
                    phoneNumber: p.phoneNumber,
                    address: p.address,
                    emailPro: p.emailPro,
                })))
            );
        })
    );
    tabs = [
        { id: 'identity', label: 'Identité' },
        { id: 'professional', label: 'Infos Professionnelles' }
    ];
    currentTab = signal('identity');

    constructor() {
        super();
    }

    get isEditMode(): boolean {
        return !!this.data;
    }

    initForm(): FormGroup {
        return this.fb.group({
            matricule: [''], // Auto-generated
            job_title: ['', Validators.required],
            roles: [[], Validators.required],
            contract_type: [null], // Optional or required? Model allows null, but UI might want it.
            establishment: [null, Validators.required],
            address: [''], // Moved to root (Personnel has address, User does not)
            date_hired: [null],
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

    /**
     * Select a user from the search results and populate the form
     */
    selectUser(user: any) {
        this.form.patchValue({
            user: {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email
            },
            email_pro: user.emailPro || user.email, // Use existing emailPro or fallback
            phone_number: user.phoneNumber,
            address: user.address,
            date_hired: user.dateHired // If personnel exists
        });

        // Clear search via control update which triggers the pipe to return []
        this.userSearchControl.setValue('');
    }

    // Override patchValue to handle nested user data mapping if names differ or structural issues
    override patchValue(data: any): void {
        if (!data) return;

        const formData = {
            ...data,
            job_title: data.jobTitle,
            email_pro: data.emailPro,
            phone_number: data.phoneNumber,
            date_hired: data.dateHired,
            roles: data.roles?.map((r: any) => r.id) || [],
            establishment: data.establishment?.id,
            contract_type: data.contractType?.id,
            address: data.address, // Address is on Personnel
            user: {
                first_name: data.user?.firstName,
                last_name: data.user?.lastName,
                email: data.user?.email
            }
        };
        this.form.patchValue(formData);
    }
    getInitials(user: any): string {
        if (!user || !user.username) return '??';
        return String(user.username).substring(0, 2).toUpperCase();
    }


}
