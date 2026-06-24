import { Component, inject, Input, OnChanges, SimpleChanges, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { SubjectGroupService } from '../../services/subject-group.service';
import { SubjectGroupType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';

@Component({
    selector: 'app-subject-group-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, 
        UiInputComponent, UiFormHeaderComponent, 
        UiFormActionsComponent, UiFormErrorsComponent
    ],
    templateUrl: './subject-group-form.component.html'
})
export class SubjectGroupFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(SubjectGroupService);

    @Input() subjectGroup: SubjectGroupType | null = null;
    @Input() isReadOnly = false;

    override form = this.fb.group({
        name: ['', [Validators.required]]
    });

    constructor() {
        super();
        effect(() => {
            if (this.isReadOnly) {
                this.form.disable();
            } else {
                this.form.enable();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['subjectGroup']) {
            if (this.subjectGroup) {
                this.form.patchValue({
                    name: this.subjectGroup.name || ''
                });
            } else {
                this.form.reset();
            }
        }
        if (changes['isReadOnly']) {
            if (this.isReadOnly) this.form.disable();
            else this.form.enable();
        }
    }

    save() {
        const formValue = this.form.getRawValue();
        const payload: any = {
            name: formValue.name
        };
        if (this.subjectGroup && this.subjectGroup.id) {
            payload.id = this.subjectGroup.id;
        }
        return this.service.save(payload);
    }
}
