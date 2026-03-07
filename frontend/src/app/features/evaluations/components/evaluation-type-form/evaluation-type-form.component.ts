import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { EvaluationTypeService } from '../../services/evaluation_type.service';
import { EvaluationTypeType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';

@Component({
    selector: 'app-evaluation-type-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiSelectComponent,
        UiFormComponent
    ],
    templateUrl: './evaluation-type-form.component.html'
})
export class EvaluationTypeFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(EvaluationTypeService);

    @Input() item: EvaluationTypeType | null = null;
    @Input() isReadOnly: boolean = false;

    // Predefined, industrial-standard evaluation types
    public EXAM_TYPES = [
        { id: 'Devoir', name: 'Devoir' },
        { id: 'Composition', name: 'Composition' },
        { id: 'Examen', name: 'Examen' },
        { id: 'Interrogation', name: 'Interrogation' },
        { id: 'Travaux Pratiques (TP)', name: 'Travaux Pratiques (TP)' },
        { id: 'Projet', name: 'Projet' }
    ];

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        description: ['']
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isReadOnly']) {
            this.isReadOnly ? this.form.disable() : this.form.enable();
        }

        if (changes['item'] && this.item) {
            this.form.patchValue({
                name: this.item.name,
                description: this.item.description || ''
            });
        } else if (changes['item'] && !this.item) {
            this.form.reset();
        }
    }

    save() {
        const payload: any = { ...this.form.getRawValue() };
        if (this.item?.id) {
            payload['id'] = this.item.id;
        }
        return this.service.save(payload);
    }
}
