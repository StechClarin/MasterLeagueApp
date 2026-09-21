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
import { Observable, of, firstValueFrom } from 'rxjs';
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
    paymentModeOptions = [
        { id: 'BRUT', label: 'Salaire brut mensuel' },
        { id: 'POINTAGE', label: 'Rémunération horaire (pointage)' }
    ];
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
            label: 'Identité & Contact',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`
        },
        { 
            id: 'professional', 
            label: 'Poste & Affectation',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`
        },
        { 
            id: 'payroll_contract', 
            label: 'Rémunération & Contrat',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
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
        const group = this.fb.group({
            matricule: [''], // Auto-generated
            job_title: ['', Validators.required],
            roles: [[], Validators.required],
            contract_type: [null],
            attached_establishments: [[]],
            address: [''],
            date_hired: [null],
            gender: ['M', Validators.required],
            user: this.fb.group({
                first_name: ['', Validators.required],
                last_name: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
            }),
            email_pro: ['', [Validators.required, Validators.email]],
            phone_number: [''],
            // --- Rémunération / Paie ---
            payment_mode: ['BRUT'],
            gross_salary: [null],
            hourly_rate: [null],
            bank_name: [''],
            bank_account_number: [''],
            bank_iban: [''],
            social_security_number: [''],
        });

        // Validation dynamique selon la modalité de paiement :
        // BRUT -> salaire mensuel requis (et réinitialiser le taux horaire)
        // POINTAGE -> taux horaire requis (et réinitialiser le salaire brut)
        group.get('payment_mode')!.valueChanges.subscribe((mode: string | null) => {
            const selected = mode || 'BRUT';
            const gross = group.get('gross_salary');
            const hourly = group.get('hourly_rate');
            if (selected === 'POINTAGE') {
                gross?.clearValidators();
                gross?.setValue(null, { emitEvent: false });
                hourly?.setValidators([Validators.required, Validators.min(0)]);
            } else {
                hourly?.clearValidators();
                hourly?.setValue(null, { emitEvent: false });
                gross?.setValidators([Validators.required, Validators.min(0)]);
            }
            gross?.updateValueAndValidity({ emitEvent: false });
            hourly?.updateValueAndValidity({ emitEvent: false });
        });

        return group;
    }
    
    override fieldLabels = {
        job_title: 'Intitulé du poste',
        roles: 'Rôles',
        establishment: 'Établissement principal',
        attached_establishments: 'Établissements de rattachement',
        email_pro: 'Email professionnel',
        first_name: 'Prénom',
        last_name: 'Nom',
        email: 'Email personnel',
        address: 'Adresse',
        date_hired: 'Date de recrutement',
        gender: 'Genre',
        payment_mode: 'Modalité de paiement',
        gross_salary: 'Salaire brut mensuel',
        hourly_rate: 'Taux horaire',
        bank_name: 'Banque',
        bank_account_number: 'Numéro de compte',
        bank_iban: 'IBAN',
        social_security_number: 'N° Sécurité sociale (CNPS)',
        contract_file: 'Contrat signé',
    };

    override submit(): void {
        if (!this.form.valid) {
            this.focusFirstInvalidTab();
        }
        super.submit();
    }

    focusFirstInvalidTab(): void {
        const userGroup = this.form.get('user') as FormGroup;
        if (userGroup && userGroup.invalid) {
            this.currentTab.set('identity');
            return;
        }

        const identityFields = ['gender', 'phone_number', 'address'];
        if (identityFields.some(f => this.form.get(f)?.invalid)) {
            this.currentTab.set('identity');
            return;
        }

        const professionalFields = ['job_title', 'roles', 'contract_type', 'attached_establishments', 'date_hired'];
        if (professionalFields.some(f => this.form.get(f)?.invalid)) {
            this.currentTab.set('professional');
            return;
        }

        const payrollFields = ['payment_mode', 'gross_salary', 'hourly_rate', 'bank_name', 'bank_account_number', 'bank_iban', 'social_security_number'];
        if (payrollFields.some(f => this.form.get(f)?.invalid)) {
            this.currentTab.set('payroll_contract');
            return;
        }
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
            date_hired: user.dateHired, // If personnel exists
            gender: user.gender || 'M'
        });

        // Clear search via control update which triggers the pipe to return []
        this.userSearchControl.setValue('');
    }

    // Override patchValue to handle nested user data mapping if names differ or structural issues
    override patchValue(data: any): void {
        if (!data) return;

        const principalId: string | null = data.establishment?.id || null;
        const attached = Array.isArray(data.attachedEstablishments)
            ? data.attachedEstablishments.map((e: any) => e?.id).filter(Boolean)
            : [];
        const establishmentIds = Array.from(new Set<string>(
            attached.length > 0 ? attached : (principalId ? [principalId] : [])
        ));

        const numOrNull = (v: any): number | null => (v === null || v === undefined || v === '') ? null : Number(v);

        const formData = {
            ...data,
            job_title: data.jobTitle,
            email_pro: data.emailPro,
            phone_number: data.phoneNumber,
            date_hired: data.dateHired,
            roles: data.roles?.map((r: any) => r.id) || [],
            attached_establishments: establishmentIds,
            contract_type: data.contractType?.id,
            address: data.address, // Address is on Personnel
            gender: data.gender || 'M',
            payment_mode: data.paymentMode || 'BRUT',
            gross_salary: numOrNull(data.grossSalary),
            hourly_rate: numOrNull(data.hourlyRate),
            bank_name: data.bankName || '',
            bank_account_number: data.bankAccountNumber || '',
            bank_iban: data.bankIban || '',
            social_security_number: data.socialSecurityNumber || '',
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

    // ================= CONTRAT DE TRAVAIL =================
    isBusyContract = signal(false);

    get contractFileUrl(): string {
        const path = (this.data as any)?.contractFile;
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const baseUrl = environment.apiUrl.replace('/api', '');
        const clean = String(path).replace(/^\/+/, '');
        return `${baseUrl}/media/${clean}`;
    }

    contractFileName(): string {
        const path = (this.data as any)?.contractFile || '';
        const parts = String(path).split('/');
        return parts[parts.length - 1] || 'contrat.pdf';
    }

    onSelectContractFile(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files && input.files[0];
        if (!file) return;

        if (!this.data?.id) {
            this.toastService.error("Enregistrez d'abord le personnel avant d'importer son contrat.");
            input.value = '';
            return;
        }

        this.isBusyContract.set(true);
        this.service.uploadContract(this.data.id, file).subscribe({
            next: (res: any) => {
                this.isBusyContract.set(false);
                input.value = '';
                const updated = res?.data || res;
                if (updated && this.data) {
                    (this.data as any).contractFile = updated.contractFile;
                }
                this.toastService.success('Contrat signé importé avec succès.');
            },
            error: (err: any) => {
                this.isBusyContract.set(false);
                input.value = '';
                console.error('Erreur upload contrat', err);
                this.toastService.error("Erreur lors de l'import du contrat.");
            }
        });
    }

    async printContract() {
        const v = this.form.getRawValue();
        let ests: any[] = [];
        try {
            const res: any = await firstValueFrom(this.establishmentService.getAll());
            ests = res?.data?.establishments?.items || [];
        } catch { /* silencieux : le document restera générique */ }

        const attachedIds: string[] = v.attached_establishments || [];
        const attachedNames = ests.filter((e: any) => attachedIds.includes(e?.id)).map((e: any) => e?.name);
        const principalName = (this.data as any)?.establishment?.name || attachedNames[0] || '________________';

        const printPayload = {
            personnel: {
                firstName: v.user?.first_name || '',
                lastName: v.user?.last_name || '',
                email: v.user?.email || v.email_pro || '',
                matricule: v.matricule || '',
                jobTitle: v.job_title || '',
                gender: v.gender || 'M',
                dateHired: v.date_hired || null,
            },
            establishment: principalName,
            attachedEstablishments: attachedNames,
            contract: {
                contractTypeId: v.contract_type || null,
                paymentMode: v.payment_mode || 'BRUT',
                grossSalary: v.gross_salary,
                hourlyRate: v.hourly_rate,
                socialSecurityNumber: v.social_security_number || '',
            },
            generatedAt: new Date().toISOString()
        };

        localStorage.setItem('personnel_contract_print_data', JSON.stringify(printPayload));
        window.open('/print/personnel-contract', '_blank');
    }

}
