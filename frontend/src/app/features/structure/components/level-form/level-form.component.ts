import { Component, inject, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { LevelService } from '../../services/level.service';
import { StructureStateService } from '@core/services/structure-state.service';
import { LevelType, GetAllCyclesGQL } from '@app/graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-level-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent],
    templateUrl: './level-form.component.html'
})
export class LevelFormComponent extends BaseFormComponent implements OnChanges, OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private service = inject(LevelService);
    public structureState = inject(StructureStateService);
    private cyclesGQL = inject(GetAllCyclesGQL);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @Input() level: LevelType | null = null;

    cycles: any[] = [];

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        shortName: ['', [Validators.required]],
        order: [0, [Validators.required]],
        cycleId: ['', [Validators.required]]
    });

    constructor() {
        super();
        effect(() => {
            // Monitor global establishment changes
            // Only trigger reload if we are in CREATE mode (no level input)
            // or if we want to support dynamic switching even in edit (though distinct logic usually applies)
            // Current logic: Create mode follows global. Edit mode follows local.
            // However, effects run initially. We need to handle that.
            const globalEstId = this.structureState.currentEstablishmentId();

            // We use untracked for this.level to avoid re-triggering if level input changes (handled by ngOnChanges)
            // Actually, we can just check if this.level is null
            if (!this.level) {
                this.loadCycles(globalEstId);
            }
        });
    }

    override ngOnInit() {
        super.ngOnInit();
        // Initial load is now handled by the effect for Create mode.
        // But for Edit mode, effect runs once too. 
        // If this.level is set, effect skips. We need to ensure Edit mode loads.
        if (this.level) {
            this.loadCyclesForContext();
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadCyclesForContext() {
        let establishmentId: string | null = null;
        if (this.level) {
            establishmentId = this.level.cycle?.establishment?.id || null;
            this.loadCycles(establishmentId);
        }
    }

    loadCycles(establishmentId: string | null) {
        console.log('[LevelForm] Loading cycles for establishment:', establishmentId || 'ALL');

        const variables: any = {
            page: 1,
            pageSize: 100
        };

        if (establishmentId) {
            variables.establishmentId = establishmentId;
        }

        this.cyclesGQL.fetch(variables, { fetchPolicy: 'network-only' }).subscribe(res => {
            console.log('[LevelForm] Cycles loaded:', res.data?.cycles?.items);
            this.cycles = (res.data?.cycles?.items || []).map((c: any) => ({
                value: c.id,
                label: c.name
            }));
            this.cdr.markForCheck();
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

                // Reload cycles based on the edited level's context
                this.loadCyclesForContext();

            } else {
                this.form.reset({ order: 0 });
                // Reload cycles based on global context (default)
                this.loadCyclesForContext();
            }
        }
    }

    save() {
        const payload: any = {
            name: this.form.getRawValue().name,
            short_name: this.form.getRawValue().shortName,
            order: this.form.getRawValue().order,
            cycle: this.form.getRawValue().cycleId
        };

        if (this.level && this.level.id) {
            payload.id = this.level.id;
        }
        return this.service.save(payload);
    }
}
