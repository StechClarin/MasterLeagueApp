import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { AcademicYearService } from '../../services/academic_year.service';
import { CycleService } from '../../services/cycle.service';
import { AcademicCycleConfigService } from '../../services/academic_cycle_config.service';
import { AcademicYearType } from '@app/graphql/generated';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiToggleComponent } from '@shared/components/ui-toggle/ui-toggle.component';

@Component({
    selector: 'app-academic-year-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiToggleComponent],
    templateUrl: './academic-year-form.component.html'
})
export class AcademicYearFormComponent extends BaseFormComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private service = inject(AcademicYearService);
    private cycleService = inject(CycleService);
    private configService = inject(AcademicCycleConfigService);

    overrides = this.fb.group({});

    cycles$ = this.cycleService.getAllCycles().valueChanges.pipe(
        map(res => (res.data.cycles?.items || []).filter((c): c is NonNullable<typeof c> => !!c)),
        // Dynamically create controls for each cycle
        map(cycles => {
            cycles.forEach(c => {
                if (!this.overrides.contains(c.id)) {
                    this.overrides.addControl(c.id, this.fb.control(
                        { value: '', disabled: this.isReadOnly }
                    ));
                }
            });
            // Update values if we have an academic year loaded waiting for cycles
            if (this.academicYear) {
                this.updateOverridesFromYear();
            }
            return cycles;
        })
    );

    @Input() academicYear: AcademicYearType | null = null;
    @Input() isReadOnly: boolean = false;

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]],
        isActive: [false],
        isArchived: [false]
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isReadOnly']) {
            const action = this.isReadOnly ? 'disable' : 'enable';
            this.form[action]();
            this.overrides[action]();
        }

        if (changes['academicYear']) {
            if (this.academicYear) {
                this.form.patchValue({
                    name: this.academicYear.name,
                    start_date: this.academicYear.start_date,
                    end_date: this.academicYear.end_date,
                    isActive: this.academicYear.isActive,
                    isArchived: this.academicYear.isArchived
                });

                this.updateOverridesFromYear();

            } else {
                this.form.reset();
                this.overrides.reset();
                this.form.patchValue({ isActive: false, isArchived: false });
            }
        }
    }

    private updateOverridesFromYear() {
        if (!this.academicYear) return;

        const configs = (this.academicYear as any).cycleConfigs || [];
        const patchObj: any = {};

        configs.forEach((c: any) => {
            const cycleId = c.cycle?.id || c.cycle;
            if (cycleId && this.overrides.contains(cycleId)) {
                patchObj[cycleId] = c.startDate;
            }
        });

        this.overrides.patchValue(patchObj);
    }

    getOverrideControl(id: string): FormControl {
        return this.overrides.get(id) as FormControl;
    }

    save() {
        const payload: any = { ...this.form.getRawValue() };
        if (this.academicYear && this.academicYear.id) {
            payload.id = this.academicYear.id;
        }

        // 1. Save Year
        return this.service.save(payload).pipe(
            switchMap((savedYear: any) => {
                const yearId = savedYear.id || savedYear.data?.id;

                // 2. Save Configs
                const overrideValues: Record<string, any> = this.overrides.getRawValue();

                const configRequests = Object.keys(overrideValues).map(cycleId => {
                    const date = overrideValues[cycleId];
                    // Only save if we have a date or if we need to clear (but here we just skip if empty?)
                    // Actually if empty, do we delete? For now let's assume we save if present.
                    if (!date) return of(null); // or logic to delete? Simplified to save/update.

                    // Find existing config ID using camelCase from GraphQL
                    const existingConfig = ((this.academicYear as any)?.cycleConfigs || []).find((c: any) =>
                        (c.cycle.id === cycleId) || (c.cycle === cycleId)
                    );

                    const configPayload = {
                        id: existingConfig ? existingConfig.id : undefined,
                        academic_year: yearId,
                        cycle: cycleId,
                        start_date: date
                    };
                    return this.configService.save(configPayload);
                });

                const validRequests = configRequests.filter(req => req !== null); // Filter out skipped

                if (validRequests.length > 0) {
                    return forkJoin(validRequests).pipe(map(() => savedYear));
                }
                return of(savedYear);
            })
        );
    }
}
