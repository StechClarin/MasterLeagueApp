import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
    selector: 'app-establishment-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
    templateUrl: './establishment-form.component.html'
})
export class EstablishmentFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(EstablishmentService);

    @Input() establishment: EstablishmentType | null = null;

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        slogan: [''],
        website: [''],
        taxId: [''],
        phone: [''],
        email: ['', [Validators.email]],
        address: [''],
        city: ['', [Validators.required]], // Require city for uniqueness check
        country: ['']
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['establishment']) {
            if (this.establishment) {
                // Ensure no nulls are passed to non-nullable form
                const patch: any = {
                    ...this.establishment,
                    name: this.establishment.name || '',
                    slogan: this.establishment.slogan || '',
                    website: this.establishment.website || '',
                    taxId: this.establishment.taxId || '',
                    phone: this.establishment.phone || '',
                    email: this.establishment.email || '',
                    address: this.establishment.address || '',
                    city: this.establishment.city || '',
                    country: this.establishment.country || ''
                };
                this.form.patchValue(patch);
            } else {
                this.form.reset();
            }
        }
    }

    private structureState = inject(StructureStateService); // Injection du state

    save() {
        const payload: any = { ...this.form.value };
        if (this.establishment && this.establishment.id) {
            payload.id = this.establishment.id;
        }
        return this.service.save(payload).pipe(
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
