import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EstablishmentService } from '../../services/establishment.service';
import { EstablishmentType } from '@app/graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';

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
        // Removed non-existent fields
        phone: [''],
        email: [''],
        address: ['']
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['establishment']) {
            if (this.establishment) {
                // Ensure no nulls are passed to non-nullable form
                const patch = {
                    ...this.establishment,
                    name: this.establishment.name || '',
                    phone: this.establishment.phone || '',
                    email: this.establishment.email || '',
                    address: this.establishment.address || ''
                };
                this.form.patchValue(patch);
            } else {
                this.form.reset();
            }
        }
    }

    save() {
        const payload: any = { ...this.form.value };
        if (this.establishment && this.establishment.id) {
            payload.id = this.establishment.id;
        }
        return this.service.save(payload);
    }
}
