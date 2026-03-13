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
import { GetAllContractTypesGQL, GetAllPersonnelsGQL } from '../../graphql/hr.generated';

import { UiConfirmModalComponent } from '@shared/components/ui-confirm-modal/ui-confirm-modal.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';

@Component({
    selector: 'app-personnel-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiModalComponent,
        UiConfirmModalComponent,
        UiFormHeaderComponent,
        UiFormActionsComponent,
        UiInputComponent,
        UiSelectComponent,
        UiMultiSelectComponent,
        UiTabsComponent,
        UiFormErrorsComponent
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
    tabs: Tab[] = [
        { 
            id: 'identity', 
            label: 'Identité',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`
        },
        { 
            id: 'professional', 
            label: 'Infos Professionnelles',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`
        }
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
    
    override fieldLabels = {
        job_title: 'Intitulé du poste',
        roles: 'Rôles',
        establishment: 'Établissement',
        email_pro: 'Email professionnel',
        first_name: 'Prénom',
        last_name: 'Nom',
        email: 'Email personnel',
        address: 'Adresse',
        date_hired: 'Date de recrutement'
    };

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
