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

    protected fieldLabels: { [key: string]: string } = {};

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

            // Generic Error Message Generation
            const invalidFields: string[] = [];

            const findInvalidControls = (control: any, prefix = '') => {
                if (control.controls) {
                    if (Array.isArray(control.controls)) {
                        control.controls.forEach((child: any, index: number) => {
                            if (child.invalid) {
                                findInvalidControls(child, prefix ? `${prefix}[${index}]` : `[${index}]`);
                            }
                        });
                    } else {
                        Object.keys(control.controls).forEach(key => {
                            const child = control.get(key);
                            if (child && child.invalid) {
                                if (child.controls) {
                                    findInvalidControls(child, prefix ? `${prefix}.${key}` : key);
                                } else {
                                    const fieldKey = prefix ? `${prefix}.${key}` : key;
                                    const label = this.fieldLabels[fieldKey] || this.fieldLabels[key] || key;
                                    invalidFields.push(label);
                                }
                            }
                        });
                    }
                }
            };

            findInvalidControls(this.form);

            if (invalidFields.length > 0) {
                const uniqueFields = [...new Set(invalidFields)];
                this.errorMessage = `Veuillez remplir les champs obligatoires : ${uniqueFields.join(', ')}.`;
            } else {
                this.errorMessage = "Le formulaire contient des erreurs. Veuillez vérifier les champs.";
            }
        }
    }

    onCancel() {
        this.logger.logAction(this.componentName, 'Click Cancel');
        this.cancel.emit();
    }
}
