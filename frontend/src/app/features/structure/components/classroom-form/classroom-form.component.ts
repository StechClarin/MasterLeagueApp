import { Component, inject, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { ClassRoomService } from '../../services/classroom.service';
import { LevelService } from '../../services/level.service';
import { ClassRoomType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { StructureStateService } from '@core/services/structure-state.service';
import { OptionService } from '../../services/option.service';
import { OptionType, LevelType } from '@app/graphql/types';

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
    private optionService = inject(OptionService);

    @Input() classroom: ClassRoomType | null = null;
    levels: LevelType[] = [];
    levelOptions: any[] = [];
    
    // Series/Options hierarchy
    hasOptions = false;
    parentOptions: any[] = [];
    subOptions: any[] = [];
    selectedParentId: string | null = null;

    override fieldLabels = {
        name: 'Nom de la classe',
        capacity: 'Capacité',
        levelId: 'Niveau'
    };

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        capacity: [30, [Validators.required, Validators.min(1)]],
        levelId: ['', [Validators.required]],
        parentId: [null as string | null],
        optionId: [null as string | null]
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

        // Level change listener
        this.form.controls.levelId.valueChanges.subscribe(levelId => {
            this.onLevelChange(levelId);
        });

        // Parent Option change listener
        this.form.controls.parentId.valueChanges.subscribe(parentId => {
            this.onParentOptionChange(parentId);
        });
    }

    private onLevelChange(levelId: string) {
        const selectedLevel = this.levels.find(l => l.id === levelId);
        this.hasOptions = selectedLevel?.cycle?.hasOptions || false;
        
        if (this.hasOptions) {
            this.loadParentOptions();
        } else {
            this.form.patchValue({ parentId: null, optionId: null });
        }
        this.cdr.markForCheck();
    }

    private onParentOptionChange(parentId: string | null) {
        this.selectedParentId = parentId;
        if (parentId) {
            this.loadSubOptions(parentId);
        } else {
            this.subOptions = [];
            this.form.patchValue({ optionId: null });
        }
        this.cdr.markForCheck();
    }

    loadLevels() {
        const estId = this.structureState.currentEstablishmentId();

        this.levelService.getAll(estId).subscribe((res: any) => {
            this.levels = res.data?.levels?.items || [];
            this.levelOptions = this.levels.map((l: any) => ({
                value: l.id,
                label: l.cycle?.establishment ? `${l.name} (${l.cycle.establishment.name})` : l.name
            }));
            
            // If editing, trigger level change manually after levels are loaded
            if (this.form.value.levelId) {
                this.onLevelChange(this.form.value.levelId);
            }
            this.cdr.markForCheck();
        });
    }

    private loadParentOptions() {
        const estId = this.structureState.currentEstablishmentId() ?? undefined;
        this.optionService.getAll(undefined, "", estId).subscribe(res => {
            this.parentOptions = (res.data.options?.items || [])
                .filter(o => !!o)
                .map(o => ({
                    value: o!.id,
                    label: o!.name
                }));
            this.cdr.markForCheck();
        });
    }

    private loadSubOptions(parentId: string) {
        this.optionService.getAll(undefined, parentId).subscribe(res => {
            this.subOptions = (res.data.options?.items || [])
                .filter(o => !!o)
                .map(o => ({
                    value: o!.id,
                    label: o!.name
                }));
            this.cdr.markForCheck();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['classroom']) {
            if (this.classroom) {
                // Edit Mode
                const patch: any = {
                    name: this.classroom.name || '',
                    capacity: this.classroom.capacity || 30,
                    levelId: this.classroom.level?.id || '',
                    parentId: this.classroom.option?.parent?.id || (this.classroom.option?.id && !this.classroom.option?.parent ? this.classroom.option?.id : null),
                    optionId: this.classroom.option?.parent ? this.classroom.option?.id : null
                };
                this.form.patchValue(patch);
                
                // If it's a main option without specialty
                if (patch.parentId && !patch.optionId) {
                    // Logic is already mostly handled by OnLevelChange but we ensure
                }
            } else {
                // Create Mode
                this.form.reset();
                this.form.patchValue({ capacity: 30 });
            }
        }
    }

    save() {
        const formVal = this.form.getRawValue();
        // Determine final option: if specialty is selected, use it, else use parent, else null
        const finalOptionId = formVal.optionId || formVal.parentId || null;

        const payload: any = {
            name: formVal.name,
            capacity: formVal.capacity,
            level: formVal.levelId,
            option: finalOptionId
        };

        if (this.classroom && this.classroom.id) {
            payload.id = this.classroom.id;
        }
        return this.service.save(payload);
    }
}
