import { Component, inject, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { OptionService } from '../../services/option.service';
import { CycleService } from '../../services/cycle.service';
import { OptionType } from '@app/graphql/types';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-option-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiFormComponent, UiSelectComponent],
    templateUrl: './option-form.component.html'
})
export class OptionFormComponent extends BaseFormComponent implements OnChanges, OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private service = inject(OptionService);
    private cycleService = inject(CycleService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @Input() option: OptionType | null = null;
    @Input() isReadOnly = false;

    cycles: any[] = [];
    parentOptions: any[] = [];

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        code: ['', [Validators.required]],
        cycleId: [null as string | null],
        parentId: [null as string | null]
    });

    constructor() {
        super();
    }

    override ngOnInit() {
        super.ngOnInit();
        this.loadCycles();
        
        // Réagir au changement de cycle pour filtrer les parents
        this.form.controls.cycleId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.loadParentOptions();
            // Reset parent if cycle changes to avoid cross-cycle parents
            this.form.controls.parentId.setValue(null);
        });
    }

    private loadCycles() {
        this.cycleService.getAllCycles().valueChanges.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
            const items = res.data.cycles?.items || [];
            this.cycles = items
                .filter((c: any) => !!c)
                .map((c: any) => ({
                    value: c!.id,
                    label: c!.name
                }));
            this.cdr.markForCheck();
            this.loadParentOptions(); // Load initial parents
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadParentOptions() {
        const selectedCycleId = this.form.controls.cycleId.value;
        
        // Obtenir toutes les filières qui pourraient être parentes
        // On filtre par cycle pour garder une hiérarchie cohérente (parentId="", pour les racines)
        this.service.getAll(undefined, "", selectedCycleId || undefined).pipe(takeUntil(this.destroy$)).subscribe(res => {
            const items = res.data.options?.items || [];
            this.parentOptions = items
                .filter(o => !!o && !o.parent && o.id !== this.option?.id) 
                .map(o => ({
                    value: o!.id,
                    label: o!.name
                }));
            this.cdr.markForCheck();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['option'] && this.option) {
            this.form.patchValue({
                name: this.option.name || '',
                code: this.option.code || '',
                cycleId: this.option.cycle?.id || null,
                parentId: this.option.parent?.id || null
            } as any);
        } else if (changes['option'] && !this.option) {
            this.form.reset({ parentId: null, cycleId: null });
        }

        if (changes['isReadOnly']) {
            if (this.isReadOnly) {
                this.form.disable();
            } else {
                this.form.enable();
            }
        }
    }

    save() {
        const rawValues = this.form.getRawValue();
        const payload: any = {
            name: rawValues.name,
            code: rawValues.code?.toUpperCase(),
            cycle: rawValues.cycleId,
            parent: rawValues.parentId
        };

        if (this.option?.id) {
            payload.id = this.option.id;
        }
        return this.service.save(payload);
    }
}
