import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { BaseModalFormComponent } from '@core/abstracts/base-modal-form.component';
import { StudentService } from '../../services/student.service';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { LevelService } from '@features/structure/services/level.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { StructureStateService } from '@core/services/structure-state.service';


@Component({
    selector: 'app-student-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule,
        UiTabsComponent, UiInputComponent, UiSelectComponent
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
        // Load Academic Years
        this.yearService.list().subscribe((items: any[]) => {
            this.academicYearsOptions.set(items.map((y: any) => ({
                value: y.id,
                label: y.name
            })));
        });

        // Load Classrooms
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

    structureState = inject(StructureStateService); // For establishment context if needed globally
    // levelService = inject(LevelService); // Not needed yet
    classService = inject(ClassRoomService);
    yearService = inject(AcademicYearService);

    // Signals for dropdown options
    academicYearsOptions = signal<{ value: any, label: string }[]>([]);
    classroomsOptions = signal<{ value: any, label: string }[]>([]);

    // Tabs Configuration
    tabs: Tab[] = [
        { id: 'identity', label: 'Identité' },
        { id: 'cursus', label: 'Scolarité' },
        { id: 'family', label: 'Famille' },
        { id: 'health', label: 'Santé' }
    ];
    currentTab = signal('identity');

    // Dropdown Sources (TODO: Load these dynamically)
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

    // Form Groups Types
    get healthGroup(): FormGroup { return this.form.get('health_input') as FormGroup; }
    get enrollmentGroup(): FormGroup { return this.form.get('enrollment_input') as FormGroup; }
    get parentsArray(): FormArray { return this.form.get('parents_input') as FormArray; }

    initForm(): FormGroup {
        this.form = this.fb.group({
            // 1. Identity
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            matricule: [{ value: '', disabled: true }], // Read-only, auto-generated
            gender: ['M', Validators.required],
            date_of_birth: [null],
            place_of_birth: [''],
            address: [''],
            // photo: [null], // Todo: File handling

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
                academic_year_id: [1, Validators.required], // TODO: Get current active year
                is_repeater: [false]
            }),

            // 4. Parents (Array)
            parents_input: this.fb.array([])
        });

        // Default: Add one parent form
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

    override submit() {
        console.log('--- SUBMIT TRIGGERED ---');
        console.log('Form Valid?', this.form.valid);

        if (this.form.invalid) {
            console.warn('Form is INVALID. Debugging errors:');
            // Log main errors
            Object.keys(this.form.controls).forEach(key => {
                const control = this.form.get(key);
                if (control?.errors) {
                    console.error(`Field '${key}' Error:`, control.errors);
                }
            });

            // Log Enrollment errors
            if (this.enrollmentGroup.invalid) {
                console.error('Enrollment Group Invalid:', this.enrollmentGroup.errors);
                Object.keys(this.enrollmentGroup.controls).forEach(k => {
                    if (this.enrollmentGroup.get(k)?.invalid) console.error(`Enrollment Field '${k}' custom error:`, this.enrollmentGroup.get(k)?.errors);
                });
            }

            // Log Parents errors
            if (this.parentsArray.invalid) {
                console.error('Parents Array Invalid');
                this.parentsArray.controls.forEach((c, index) => {
                    if (c.invalid) console.error(`Parent ${index} invalid`, c.errors);
                });
            }

            this.form.markAllAsTouched();

            // Auto-switch to invalid tab
            if (this.form.get('first_name')?.invalid || this.form.get('last_name')?.invalid || this.form.get('gender')?.invalid) {
                this.currentTab.set('identity');
            } else if (this.enrollmentGroup.invalid) {
                this.currentTab.set('cursus');
            } else if (this.parentsArray.invalid) {
                this.currentTab.set('family');
            } else if (this.healthGroup.invalid) {
                this.currentTab.set('health');
            }
            return;
        }
        console.log('Form VALID. Calling super.submit()...');
        super.submit();
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
            address: data.address
        });

        // 2. Health
        if (data.health) {
            // Mapping GraphQL Enum (Sanitized) -> Display Value (Standard)
            // Graphene sanitizes 'A+' to 'A_', 'A-' to 'A__1', etc.
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
                classroom_id: current.classroom?.id,
                academic_year_id: current.academicYear?.id,
                is_repeater: current.isRepeater
            });
        }

        // 4. Parents
        this.parentsArray.clear();
        if (data.guardians && data.guardians.length > 0) {
            data.guardians.forEach((g: any) => {
                const group = this.fb.group({
                    id: [g.id],
                    role: [g.role || 'TUTOR', Validators.required],
                    // Fallback to raw fields if User is not linked
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
        // Validation is handled in submit()
        const payload = { ...this.form.getRawValue() };
        if (this.isEditMode) {
            payload.id = this.data.id;
        }

        return this.service.save(payload);
    }

    close() {
        this.onCancel();
    }
}
