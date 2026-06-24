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
        this.yearService.listActive().subscribe((items: any[]) => {
            this.academicYearsOptions.set(items.map((y: any) => ({
                value: y.id,
                label: y.name
            })));
            if (items.length > 0 && !this.enrollmentGroup.get('academic_year_id')?.value) {
                this.enrollmentGroup.get('academic_year_id')?.setValue(items[0]?.id);
            }
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
    get familyGroup(): FormGroup { return this.form.get('family_input') as FormGroup; }

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
            rfid_uid: [''],

            // 2. Health (Nested)
            health_input: this.fb.group({
                blood_group: [''],
                allergies: [''],
                medical_conditions: [''],
                emergency_contact_name: [''],
                emergency_contact_phone: ['', [Validators.pattern(/^\+?[\d\s-]{4,}$/)]]
            }),

            // 3. Enrollment (Nested)
            enrollment_input: this.fb.group({
                classroom_id: [null, Validators.required],
                academic_year_id: [null, Validators.required],
                is_repeater: [false]
            }),

            // 4. Family (Nested)
            family_input: this.fb.group({
                is_parent_tutor: [true],
                father: this.createGuardianGroup('FATHER'),
                mother: this.createGuardianGroup('MOTHER'),
                tutor: this.createGuardianGroup('TUTOR')
            })
        });
        
        return this.form;
    }

    createGuardianGroup(role: string): FormGroup {
        return this.fb.group({
            id: [null],
            role: [role],
            first_name: [''],
            last_name: [''],
            phone_number: ['', [Validators.pattern(/^\+?[\d\s-]{4,}$/)]],
            profession: [''],
            email: ['', [Validators.email]],
            is_legal_guardian: [false]
        });
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
            } else if (this.familyGroup.invalid) {
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
            rfid_uid: data.rfidUid,
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
        const familyInput = {
            is_parent_tutor: true,
            father: { role: 'FATHER' },
            mother: { role: 'MOTHER' },
            tutor: { role: 'TUTOR' }
        };

        if (data.guardians && data.guardians.length > 0) {
            let hasTutor = false;
            data.guardians.forEach((g: any) => {
                const mapGuardian = (g: any) => ({
                    id: g.id,
                    role: g.role,
                    first_name: g.firstName || g.user?.firstName || '',
                    last_name: g.lastName || g.user?.lastName || '',
                    phone_number: g.phoneNumber || '',
                    profession: g.profession || '',
                    email: g.user?.email || '',
                    is_legal_guardian: g.isLegalGuardian !== undefined ? g.isLegalGuardian : true
                });

                if (g.role === 'FATHER') {
                    familyInput.father = mapGuardian(g);
                } else if (g.role === 'MOTHER') {
                    familyInput.mother = mapGuardian(g);
                } else if (g.role === 'TUTOR' || !g.role) {
                    familyInput.tutor = mapGuardian({ ...g, role: 'TUTOR' });
                    hasTutor = true;
                }
            });
            if (hasTutor) {
                familyInput.is_parent_tutor = false;
            }
        }
        
        // Ensure the form gets all parts properly
        this.familyGroup.patchValue(familyInput);
    }

    save() {
        const payload = { ...this.form.getRawValue() };
        if (this.isEditMode) {
            payload.id = this.data.id;
        }

        // Map family_input to parents_input for the backend
        const family = payload.family_input;
        const parents = [];
        if (family.father.first_name || family.father.last_name) {
            family.father.is_legal_guardian = family.is_parent_tutor;
            parents.push(family.father);
        }
        if (family.mother.first_name || family.mother.last_name) {
            family.mother.is_legal_guardian = family.is_parent_tutor;
            parents.push(family.mother);
        }
        if (!family.is_parent_tutor && (family.tutor.first_name || family.tutor.last_name)) {
            family.tutor.is_legal_guardian = true;
            parents.push(family.tutor);
        }
        payload.parents_input = parents;
        delete payload.family_input;

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
