import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormUtils } from '../utils/form.utils';
import { ToastService } from '@core/services/toast.service';
import { LoggingService } from '../services/logging.service';

@Component({ template: '' })
export abstract class BaseFormComponent implements OnInit {
    @Output() cancel = new EventEmitter<void>();
    @Output() success = new EventEmitter<void>();

    abstract form: FormGroup;
    isSubmitting = false;
    errorMessage: string | null = null;

    protected toastService = inject(ToastService);
    protected logger = inject(LoggingService);
    protected componentName = this.constructor.name;

    abstract save(): Observable<any>;

    ngOnInit() {
        this.logger.logLifecycle(this.componentName, 'Initialized (Form)');
    }

    submit() {
        this.logger.logAction(this.componentName, 'Submit Attempt');
        if (this.form.valid) {
            this.isSubmitting = true;
            this.errorMessage = null;

            this.logger.logAction(this.componentName, 'Form Valid - Saving...');
            this.save().subscribe({
                next: (res) => {
                    this.isSubmitting = false;
                    this.logger.logAction(this.componentName, 'Save Success', res);
                    this.success.emit();
                },
                error: (err) => {
                    console.error('Erreur soumission formulaire:', err);
                    this.logger.logAction(this.componentName, 'Save Error', err);
                    this.isSubmitting = false;
                    // Injection automatique des erreurs dans les champs
                    this.errorMessage = FormUtils.setErrors(this.form, err);
                    if (this.errorMessage) {
                        this.toastService.error(this.errorMessage);
                    } else {
                        this.toastService.error('Une erreur est survenue lors de l\'enregistrement.');
                    }
                }
            });
        } else {
            this.logger.logAction(this.componentName, 'Form Invalid', this.form.errors);
            this.form.markAllAsTouched();
        }
    }

    onCancel() {
        this.logger.logAction(this.componentName, 'Click Cancel');
        this.cancel.emit();
    }
}
