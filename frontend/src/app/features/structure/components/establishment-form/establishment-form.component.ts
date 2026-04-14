import { Component, inject, Input, OnChanges, SimpleChanges, signal, computed, Output, EventEmitter } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { UserService } from '@features/profilmanagement/services/user.service';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiTabsComponent } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';
import { UiMediaInputComponent } from '@shared/components/ui-media-input/ui-media-input.component';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-establishment-form',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        UiInputComponent, 
        UiFormComponent, 
        UiSelectComponent, 
        UiTabsComponent, 
        UiFormHeaderComponent,
        UiFormErrorsComponent,
        UiMediaInputComponent
    ],
    templateUrl: './establishment-form.component.html'
})
export class EstablishmentFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(EstablishmentService);
    private userService = inject(UserService);
    private apollo = inject(Apollo);

    users$!: Observable<any[]>;

    @Input() establishment: EstablishmentType | null = null;
    @Output() close = new EventEmitter<void>();

    isEditMode = computed(() => !!this.establishment?.id);
    currentTab = signal('identity');

    tabs = [
        { 
            id: 'identity', 
            label: 'Identité', 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>` 
        },
        { 
            id: 'location', 
            label: 'Localisation', 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>` 
        },
        { 
            id: 'contact', 
            label: 'Contacts', 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>` 
        }
    ];

    override form = this.fb.nonNullable.group({
        user: ['' as any],
        name: ['', [Validators.required]],
        slogan: [''],
        website: [''],
        taxId: [''],
        logo: [null as any],
        phone: [''],
        email: ['', [Validators.email]],
        address: [''],
        city: ['', [Validators.required]], // Require city for uniqueness check
        country: ['']
    });

    get logoUrl(): string {
        return this.resolveMediaUrl(this.establishment?.logo);
    }

    override ngOnInit() {
        super.ngOnInit();
        // Charger les utilisateurs pour le sélecteur
        this.users$ = this.apollo.watchQuery<any>({
            query: this.userService.getQuery(),
            variables: { pageSize: 100 }
        }).valueChanges.pipe(
            map(result => result.data.users.items)
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['establishment']) {
            if (this.establishment) {
                // Ensure no nulls are passed to non-nullable form
                const patch: any = {
                    ...this.establishment,
                    user: this.establishment.user?.id || '',
                    name: this.establishment.name || '',
                    slogan: this.establishment.slogan || '',
                    website: this.establishment.website || '',
                    taxId: this.establishment.taxId || '',
                    phone: this.establishment.phone || '',
                    email: this.establishment.email || '',
                    address: this.establishment.address || '',
                    city: this.establishment.city || '',
                    country: this.establishment.country || '',
                    logo: this.logoUrl
                };
                this.form.patchValue(patch);
            } else {
                this.form.reset();
            }
        }
    }

    private structureState = inject(StructureStateService); // Injection du state

    save() {
        const formData = new FormData();
        const formValue = this.form.value;

        // Append basic fields in snake_case
        Object.keys(formValue).forEach(key => {
            if (key === 'logo') return; // Handled separately
            
            const value = (formValue as any)[key];
            if (value !== null && value !== undefined) {
                // Convert camelCase to snake_case for DRF
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                formData.append(snakeKey, value);
            }
        });

        if (this.establishment && this.establishment.id) {
            formData.append('id', this.establishment.id);
        }

        // Handle File Upload
        const logoFile = this.form.get('logo')?.value;
        if (logoFile instanceof File) {
            formData.append('logo', logoFile);
        }

        return this.service.save(formData).pipe(
            tap((res: any) => {
                // this.form.reset(); // [REMOVED] Géré globalement par BaseFormComponent
                this.establishment = null;

                // Si création (ou modification), on définit cet établissement comme actif
                // Cela évite l'erreur "Missing Establishment" sur les formulaires suivants
                if (res && res.id) {
                    this.structureState.setEstablishment(res.id);
                }
            })
        );
    }
}
