import { Component, inject, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { AcademicPeriodService } from '../../services/academic_period.service';
import { AcademicYearService } from '../../services/academic_year.service';
import { CycleService } from '../../services/cycle.service';
import { StructureStateService } from '@core/services/structure-state.service';
import { AcademicPeriodType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-academic-period-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UiInputComponent,
        UiFormComponent,
        UiToggleComponent,
        UiSelectComponent,
        UiMultiSelectComponent
    ],
    templateUrl: './academic-period-form.component.html'
})
export class AcademicPeriodFormComponent extends BaseModalFormComponent implements OnInit, OnChanges {
    private service = inject(AcademicPeriodService);
    private academicYearService = inject(AcademicYearService);
    private cycleService = inject(CycleService);
    private structureState = inject(StructureStateService);

    @Input() item: AcademicPeriodType | null = null;
    @Input() isReadOnly: boolean = false;

    override fieldLabels = {
        name: "Nom de la période",
        start_date: "Date de début",
        end_date: "Date de fin",
        academic_year: "Année scolaire",
        cycles: "Cycles concernés",
        is_active: "Période active"
    };

    academicYears$ = this.academicYearService.listActive().pipe(
        map(items => {
            if (items.length > 0 && !this.form.get('academic_year')?.value) {
                this.form.get('academic_year')?.setValue(items[0]?.id);
            }
            return items;
        })
    );

    cycles$ = toObservable(this.structureState.currentEstablishmentId).pipe(
        switchMap(estId => {
            if (!estId) return of({ data: { cycles: { items: [] } } });
            return this.cycleService.getAllCycles('', 1, 100, estId).valueChanges;
        }),
        map((res: any) => (res.data?.cycles?.items || []).filter((c: any) => !!c))
    );

    override form = inject(FormBuilder).nonNullable.group({
        name: ['', [Validators.required]],
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required, (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) return null;
            const start = this.form.get('start_date')?.value;
            const end = control.value;
            if (start && end && new Date(start) > new Date(end)) {
                return { serverError: 'La date de fin doit être postérieure à la date de début.' };
            }
            return null;
        }]],
        academic_year: ['', [Validators.required]],
        cycles: [[] as string[], [Validators.required]],
        is_active: [true]
    });

    override initForm(): FormGroup {
        return this.form;
    }

    override ngOnInit() {
        super.ngOnInit();
        // Reactive re-validation of end_date when start_date changes
        this.form.get('start_date')?.valueChanges.subscribe(() => {
            this.form.get('end_date')?.updateValueAndValidity();
        });
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
                cycles: this.item.cycles?.map((c: any) => c.id) || [],
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
