import { Component, inject, Input, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { OptionService } from '../../services/option.service';
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
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    @Input() option: OptionType | null = null;
    @Input() isReadOnly = false;

    parentOptions: any[] = [];

    override form = this.fb.nonNullable.group({
        name: ['', [Validators.required]],
        code: ['', [Validators.required]],
        parentId: [null as string | null]
    });

    constructor() {
        super();
    }

    override ngOnInit() {
        super.ngOnInit();
        this.loadParentOptions();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadParentOptions() {
        // Obtenir toutes les options qui n'ont pas de parent (filières principales)
        this.service.getAll(undefined, undefined).pipe(takeUntil(this.destroy$)).subscribe(res => {
            const items = res.data.options?.items || [];
            this.parentOptions = items
                .filter(o => !!o && !o.parent && o.id !== this.option?.id) // Exclure les sous-options et soi-même
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
                parentId: this.option.parent?.id || null
            } as any);
        } else if (changes['option'] && !this.option) {
            this.form.reset({ parentId: null });
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
        const payload: any = {
            name: this.form.getRawValue().name,
            code: this.form.getRawValue().code,
            parent: this.form.getRawValue().parentId
        };

        if (this.option?.id) {
            payload.id = this.option.id;
        }
        return this.service.save(payload);
    }
}
