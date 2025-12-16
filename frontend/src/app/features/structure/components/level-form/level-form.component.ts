import { Component, inject, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { LevelService } from '../../services/level.service';
import { LevelType, GetAllCyclesGQL, CycleType } from '@app/graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';

@Component({
    selector: 'app-level-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent],
    templateUrl: './level-form.component.html'
})
export class LevelFormComponent extends BaseFormComponent implements OnChanges, OnInit {
    private fb = inject(FormBuilder);
    private service = inject(LevelService);
    private cyclesGQL = inject(GetAllCyclesGQL);
    private cdr = inject(ChangeDetectorRef); // Fixed: Injected properly

    @Input() level: LevelType | null = null;

    cycles: any[] = [];

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        shortName: ['', [Validators.required]],
        order: [0, [Validators.required]],
        cycleId: ['', [Validators.required]]
    });

    override ngOnInit() {
        super.ngOnInit();
        this.loadCycles();
    }

    loadCycles() {
        console.log('[LevelForm] Loading cycles...');
        // Fixed: Added network-only policy to ensure fresh data based on current context
        this.cyclesGQL.fetch({ page: 1, pageSize: 100 }, { fetchPolicy: 'network-only' }).subscribe(res => {
            console.log('[LevelForm] Cycles loaded:', res.data.cycles?.items);
            this.cycles = (res.data.cycles?.items || []).map((c: any) => ({
                value: c.id,
                label: c.name
            }));
            this.cdr.markForCheck(); // Fixed: Force CD update
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['level']) {
            if (this.level) {
                const patch = {
                    name: this.level.name || '',
                    shortName: this.level.shortName || '',
                    order: this.level.order || 0,
                    cycleId: this.level.cycle?.id || ''
                };
                this.form.patchValue(patch);
            } else {
                this.form.reset({ order: 0 });
            }
        }
    }

    save() {
        const payload: any = {
            name: this.form.getRawValue().name,
            short_name: this.form.getRawValue().shortName,
            order: this.form.getRawValue().order,
            cycle: this.form.getRawValue().cycleId // Serializer expects 'cycle'
        };

        if (this.level && this.level.id) {
            payload.id = this.level.id;
        }
        return this.service.save(payload);
    }
}
