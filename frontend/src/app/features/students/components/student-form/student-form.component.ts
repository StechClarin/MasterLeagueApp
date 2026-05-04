import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { StudentService } from '../../services/student.service';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMediaInputComponent } from '@shared/components/ui-media-input/ui-media-input.component';
import { LevelService } from '@features/structure/services/level.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { StructureStateService } from '@core/services/structure-state.service';

import { DocumentUploadComponent } from '@features/documents/components/document-upload/document-upload.component';
import { environment } from 'src/environments/environment';


import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';

@Component({
    selector: 'app-student-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        UiTabsComponent, UiInputComponent, UiSelectComponent, UiMediaInputComponent,
        DocumentUploadComponent,
        UiFormHeaderComponent, UiFormActionsComponent, UiFormErrorsComponent
    ],
    templateUrl: './student-form.component.html'
})
export class StudentFormComponent extends BaseModalFormComponent {
    service = inject(StudentService);
    override form!: FormGroup;

    override ngOnInit(): void {
        super.ngOnInit();
        this.loadDropdowns();
    }

    loadDropdowns() {
        this.yearService.list().subscribe((items: any[]) => {
            this.academicYearsOptions.set(items.map((y: any) => ({
                value: y.id,
                label: y.name
            })));
        });

        this.classService.list().subscribe((items: any[]) => {
            this.classroomsOptions.set(items.map((c: any) => ({
                value: c.id,
                label: c.name
            })));
        });
    }

    get isEditMode(): boolean {
        return !!this.data;
    }

    structureState = inject(StructureStateService);
    classService = inject(ClassRoomService);
    yearService = inject(AcademicYearService);

    academicYearsOptions = signal<{ value: any, label: string }[]>([]);
    classroomsOptions = signal<{ value: any, label: string }[]>([]);

    tabs: Tab[] = [
        { 
            id: 'identity', 
            label: 'Identité',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`
        },
        { 
            id: 'cursus', 
            label: 'Scolarité',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>`
        },
        { 
            id: 'family', 
            label: 'Famille',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`
        },
        { 
            id: 'health', 
            label: 'Santé',
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>`
        }
    ];
    currentTab = signal('identity');

    genders = [
        { value: 'M', label: 'Masculin' },
        { value: 'F', label: 'Féminin' }
    ];
    bloodGroups = [
        { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }
    ];
    roles = [
        { value: 'FATHER', label: 'Père' },
        { value: 'MOTHER', label: 'Mère' },
        { value: 'TUTOR', label: 'Tuteur' }
    ];

    get healthGroup(): FormGroup { return this.form.get('health_input') as FormGroup; }
    get enrollmentGroup(): FormGroup { return this.form.get('enrollment_input') as FormGroup; }
    get parentsArray(): FormArray { return this.form.get('parents_input') as FormArray; }

    initForm(): FormGroup {
        this.form = this.fb.group({
            // 1. Identity
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            matricule: [{ value: '', disabled: true }],
            gender: ['M', Validators.required],
            date_of_birth: [null],
            place_of_birth: [''],
            address: [''],
            photo: [null],

            // 2. Health (Nested)
            health_input: this.fb.group({
                blood_group: [''],
                allergies: [''],
                medical_conditions: [''],
                emergency_contact_name: [''],
                emergency_contact_phone: ['']
            }),

            // 3. Enrollment (Nested)
            enrollment_input: this.fb.group({
                classroom_id: [null, Validators.required],
                academic_year_id: [null, Validators.required],
                is_repeater: [false]
            }),

            // 4. Parents (Array)
            parents_input: this.fb.array([])
        });

        this.addParent('FATHER');
        return this.form;
    }

    addParent(role: string = 'FATHER') {
        const group = this.fb.group({
            role: [role, Validators.required],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            phone_number: ['', Validators.required],
            profession: [''],
            email: [''],
            is_legal_guardian: [true]
        });
        this.parentsArray.push(group);
    }

    removeParent(index: number) {
        this.parentsArray.removeAt(index);
    }

    override fieldLabels = {
        first_name: 'Prénom',
        last_name: 'Nom',
        gender: 'Sexe',
        date_of_birth: 'Date de naissance',
        academic_year_id: 'Année Académique',
        classroom_id: 'Classe',
        phone_number: 'Téléphone',
        role: 'Rôle',
        blood_group: 'Groupe Sanguin'
    };

    override submit() {
        super.submit();

        if (this.form.invalid) {
            if (this.form.get('first_name')?.invalid || this.form.get('last_name')?.invalid || this.form.get('gender')?.invalid) {
                this.currentTab.set('identity');
            } else if (this.enrollmentGroup.invalid) {
                this.currentTab.set('cursus');
            } else if (this.parentsArray.invalid) {
                this.currentTab.set('family');
            } else if (this.healthGroup.invalid) {
                this.currentTab.set('health');
            }
        }
    }

    override patchValue(data: any): void {
        if (!this.form || !data) return;

        // 1. Identity
        this.form.patchValue({
            id: data.id,
            first_name: data.firstName,
            last_name: data.lastName,
            matricule: data.matricule,
            gender: data.gender,
            date_of_birth: data.dateOfBirth,
            place_of_birth: data.placeOfBirth,
            address: data.address,
            photo: this.getPhotoUrl(data.photo) // Bind Photo URL
        });

        // 2. Health
        if (data.health) {
            const bloodMap: { [key: string]: string } = {
                'AB_': 'AB+', 'AB__5': 'AB-',
                'A_': 'A+', 'A__1': 'A-',
                'B_': 'B+', 'B__3': 'B-',
                'O_': 'O+', 'O__7': 'O-'
            };

            const rawBg = data.health.bloodGroup;
            const bloodGroup = bloodMap[rawBg] || rawBg;

            this.healthGroup.patchValue({
                blood_group: bloodGroup,
                allergies: data.health.allergies,
                medical_conditions: data.health.medicalConditions,
                emergency_contact_name: data.health.emergencyContactName,
                emergency_contact_phone: data.health.emergencyContactPhone
            });
        }

        // 3. Enrollment
        if (data.enrollments && data.enrollments.length > 0) {
            const current = data.enrollments[0];
            this.enrollmentGroup.patchValue({
                classroom_id: current.classroom_id || current.classroom?.id,
                academic_year_id: current.academic_year_id || current.academicYear?.id || current.academic_year?.id,
                is_repeater: current.isRepeater || current.is_repeater
            });
        }

        // 4. Parents
        this.parentsArray.clear();
        if (data.guardians && data.guardians.length > 0) {
            data.guardians.forEach((g: any) => {
                const group = this.fb.group({
                    id: [g.id],
                    role: [g.role || 'TUTOR', Validators.required],
                    first_name: [g.firstName || g.user?.firstName || '', Validators.required],
                    last_name: [g.lastName || g.user?.lastName || '', Validators.required],
                    phone_number: [g.phoneNumber || '', Validators.required],
                    profession: [g.profession || ''],
                    email: [g.user?.email || ''],
                    is_legal_guardian: [true]
                });
                this.parentsArray.push(group);
            });
        } else {
            if (data.guardians?.length === 0) {
                this.addParent();
            }
        }
    }

    save() {
        const payload = { ...this.form.getRawValue() };
        if (this.isEditMode) {
            payload.id = this.data.id;
        }

        const formData = new FormData();

        Object.keys(payload).forEach(key => {
            const value = payload[key];
            if (value !== null && value !== undefined && key !== 'photo') { // Exclude photo from loop
                if (typeof value === 'object' && !(value instanceof Date) && key !== 'date_of_birth') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            }
        });

        // Gestion Photo via FormControl
        const photoProp = this.form.get('photo')?.value as any;
        if (photoProp instanceof File) {
            formData.append('photo', photoProp);
        }

        return this.service.save(formData);
    }

    getInitials(name: string): string {
        return name ? name.substring(0, 2).toUpperCase() : '??';
    }


}
