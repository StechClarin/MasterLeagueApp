import { Component, inject, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { ClassRoomService } from '../../services/classroom.service';
import { LevelService } from '../../services/level.service';
import { ClassRoomType } from '@app/graphql/generated';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { StructureStateService } from '@core/services/structure-state.service';

@Component({
    selector: 'app-classroom-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent],
    templateUrl: './classroom-form.component.html'
})
export class ClassRoomFormComponent extends BaseFormComponent implements OnChanges, OnInit {
    private fb = inject(FormBuilder);
    private service = inject(ClassRoomService);
    private levelService = inject(LevelService);
    private cdr = inject(ChangeDetectorRef);
    private structureState = inject(StructureStateService);

    @Input() classroom: ClassRoomType | null = null;
    levels: any[] = [];

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        capacity: [30, [Validators.required, Validators.min(1)]],
        levelId: ['', [Validators.required]]
    });

    constructor() {
        super();
        // Reactive Loading: Reload levels when establishment changes (or on init)
        effect(() => {
            const _ = this.structureState.currentEstablishmentId();
            this.loadLevels();
        });
    }

    override ngOnInit() {
        super.ngOnInit();
    }

    loadLevels() {
        // Get current establishment ID from state (or null)
        const estId = this.structureState.currentEstablishmentId();

        // Use service with explicit ID (if present)
        this.levelService.getAll(estId).subscribe((res: any) => {
            console.log('[ClassRoomForm] Levels loaded for', estId || 'ALL', ':', res.data?.levels?.items);
            this.levels = (res.data?.levels?.items || []).map((l: any) => ({
                value: l.id,
                label: l.cycle?.establishment ? `${l.name} (${l.cycle.establishment.name})` : l.name
            }));
            this.cdr.markForCheck();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['classroom']) {
            if (this.classroom) {
                // Edit Mode
                const patch = {
                    name: this.classroom.name || '',
                    capacity: this.classroom.capacity || 30,
                    levelId: this.classroom.level?.id || ''
                };
                this.form.patchValue(patch);
            } else {
                // Create Mode
                this.form.reset();
                this.form.patchValue({ capacity: 30 });
            }
        }
    }

    save() {
        const formVal = this.form.getRawValue();
        const payload: any = {
            name: formVal.name,
            capacity: formVal.capacity,
            level: formVal.levelId
        };

        if (this.classroom && this.classroom.id) {
            payload.id = this.classroom.id;
        }
        return this.service.save(payload);
    }
}
