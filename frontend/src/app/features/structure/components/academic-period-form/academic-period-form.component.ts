import { Component, inject, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { AcademicPeriodService } from '../../services/academic_period.service';
import { AcademicYearService } from '../../services/academic_year.service';
import { AcademicPeriodType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-academic-period-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiFormComponent,
        UiToggleComponent,
        UiSelectComponent
    ],
    templateUrl: './academic-period-form.component.html'
})
export class AcademicPeriodFormComponent extends BaseModalFormComponent implements OnInit, OnChanges {
    private service = inject(AcademicPeriodService);
    private academicYearService = inject(AcademicYearService);

    @Input() item: AcademicPeriodType | null = null;
    @Input() isReadOnly: boolean = false;

    academicYears$ = this.academicYearService.listActive().pipe(
        map(items => {
            if (items.length > 0 && !this.form.get('academic_year')?.value) {
                this.form.get('academic_year')?.setValue(items[0]?.id);
            }
            return items;
        })
    );

    override form = inject(FormBuilder).nonNullable.group({
        name: ['', [Validators.required]],
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]],
        academic_year: ['', [Validators.required]],
        is_active: [true]
    });

    override initForm(): FormGroup {
        return this.form;
    }

    override ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.form) return;

        if (changes['isReadOnly']) {
            this.isReadOnly ? this.form.disable() : this.form.enable();
        }

        if (changes['item'] && this.item) {
            this.form.patchValue({
                name: this.item.name,
                start_date: this.item.startDate,
                end_date: this.item.endDate,
                academic_year: this.item.academicYear?.id || '',
                is_active: this.item.isActive
            });
        } else if (changes['item'] && !this.item) {
            this.form.reset({ is_active: true });
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
