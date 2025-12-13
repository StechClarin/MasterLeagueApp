import { Component, inject, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EvenementService } from '../../services/evenement.service';

@Component({
    selector: 'app-evenement-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent],
    templateUrl: './evenement-form.component.html'
})
export class EvenementFormComponent extends BaseFormComponent implements OnInit, OnChanges {
    private fb = inject(FormBuilder);
    private evenementService = inject(EvenementService);

    @Input() evenement: any | null = null;

    override form = this.fb.nonNullable.group({
        nom: ['', [Validators.required]],
        lieu: ['', [Validators.required]],
        dateDebut: ['', [Validators.required]],
        dateFin: ['', [Validators.required]]
    });

    override ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['evenement']) {
            if (this.evenement) {
                this.form.patchValue({
                    nom: this.evenement.nom,
                    lieu: this.evenement.lieu,
                    // Handle potential date format issues if needed, input type="date" expects YYYY-MM-DD
                    dateDebut: this.formatDate(this.evenement.dateDebut),
                    dateFin: this.formatDate(this.evenement.dateFin)
                });
            } else {
                this.form.reset();
            }
        }
    }

    private formatDate(dateStr: string): string {
        if (!dateStr) return '';
        return new Date(dateStr).toISOString().split('T')[0];
    }

    onSubmit() {
        super.submit();
    }

    save(): Observable<any> {
        const val = this.form.value;
        const payload: any = {
            nom: val.nom,
            lieu: val.lieu,
            date_debut: val.dateDebut, // Backend expects snake_case
            date_fin: val.dateFin
        };

        if (this.evenement && this.evenement.id) {
            payload.id = this.evenement.id;
        }

        return this.evenementService.save(payload);
    }
}
