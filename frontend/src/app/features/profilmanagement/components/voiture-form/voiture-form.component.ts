import { Component, inject, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { VoitureService } from '../../services/voiture.service';

@Component({
    selector: 'app-voiture-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
    templateUrl: './voiture-form.component.html'
})
export class VoitureFormComponent extends BaseFormComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private voitureService = inject(VoitureService);

    @Input() voiture: any | null = null;

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        matricule: ['', [Validators.required]],
        couleur: ['', [Validators.required]]
    });

    override ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['voiture']) {
            if (this.voiture) {
                this.form.patchValue({
                    name: this.voiture.name,
                    matricule: this.voiture.matricule,
                    couleur: this.voiture.couleur
                });
            } else {
                this.form.reset();
            }
        }
    }

    onSubmit() {
        super.submit();
    }

    save(): Observable<any> {
        const payload: any = {
            ...this.form.value
        };

        if (this.voiture && this.voiture.id) {
            payload.id = this.voiture.id;
        }

        return this.voitureService.save(payload);
    }
}
