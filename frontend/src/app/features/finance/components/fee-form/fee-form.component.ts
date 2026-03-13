import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { FeeService } from '../../services/fee.service';
import { LevelService } from '@features/structure/services/level.service';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { StudentService } from '@features/students/services/student.service';

import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';

@Component({
  selector: 'app-fee-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    UiFormComponent,
    UiInputComponent,
    UiSelectComponent,
    UiMultiSelectComponent
  ],
  template: `
    <app-ui-form [formErrors]="formErrors" 
      [title]="(item?.id ? 'Modifier' : 'Ajouter') + ' un tarif'"
      [description]="'Gérez les paramètres financiers de l\\'établissement.'"
      [formGroup]="form" 
      (submitForm)="submit()" 
      (cancel)="onCancel()"
      [isLoading]="isSubmitting"
     >
      
      <div class="grid grid-cols-2 gap-4">
        <app-ui-input 
          label="Libellé du frais" 
          formControlName="name" 
          [required]="true">
        </app-ui-input>

        <app-ui-select 
          label="Catégorie" 
          formControlName="category" 
          [options]="categories"
          [required]="true">
        </app-ui-select>

        <app-ui-input 
          label="Montant (FCFA)" 
          type="number"
          formControlName="amount" 
          [required]="true">
        </app-ui-input>

        <app-ui-select 
          label="Statut" 
          formControlName="isActive" 
          [options]="statusOptions"
          [required]="true">
        </app-ui-select>

        <div class="flex items-center px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl">
          <label class="flex items-center cursor-pointer w-full group">
            <input type="checkbox" formControlName="isRequired" class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200">
            <span class="ml-3 text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Frais Obligatoire (Facturé à l'inscription)</span>
          </label>
        </div>

        <div class="flex items-center px-4 h-11 bg-indigo-50 border border-indigo-100 rounded-xl" *ngIf="!item?.id">
          <label class="flex items-center cursor-pointer w-full group">
            <input type="checkbox" formControlName="applyToExisting" class="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 transition-all duration-200">
            <span class="ml-3 text-sm font-semibold text-indigo-900 group-hover:text-indigo-700 transition-colors">Appliquer aux déjà inscrits 🚀</span>
          </label>
        </div>

        <app-ui-select 
          label="Niveau Scolaire" 
          formControlName="level" 
          [options]="levels()"
          [required]="true">
        </app-ui-select>

        <app-ui-select 
          label="Année Académique" 
          formControlName="academicYear" 
          [options]="academicYears()"
          [required]="true">
        </app-ui-select>

        <app-ui-select 
          label="Modalité de Paiement" 
          formControlName="paymentModality" 
          [options]="modalities"
          [required]="true">
        </app-ui-select>

        <div class="col-span-2 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300" 
             *ngIf="form.get('paymentModality')?.value === 'INSTALLMENTS'">
          <app-ui-input 
            label="Nombre de tranches" 
            type="number"
            formControlName="installmentCount" 
            [required]="true">
          </app-ui-input>

          <app-ui-select 
            label="Périodicité" 
            formControlName="installmentPeriod" 
            [options]="periods"
            [required]="true">
          </app-ui-select>
        </div>

        <div class="col-span-2 border-t border-slate-100 mt-4 pt-6">
          <h4 class="text-indigo-900 font-bold mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Configuration du Ciblage (Optionnel)
          </h4>
          
          <div class="grid grid-cols-2 gap-4">
            <app-ui-select 
              label="Type de Ciblage" 
              formControlName="targetType" 
              [options]="targetTypes">
            </app-ui-select>

            <app-ui-select 
              *ngIf="form.get('targetType')?.value === 'CLASSROOM'"
              label="Classe Spécifique" 
              formControlName="classroom" 
              [options]="classrooms()"
              [required]="true">
            </app-ui-select>

            <app-ui-multi-select 
              *ngIf="form.get('targetType')?.value === 'STUDENT'"
              label="Élèves Spécifiques" 
              formControlName="students" 
              [options]="students()"
              [isSearchable]="true"
              [isLoading]="isSearchingStudents()"
              bindLabel="label"
              bindValue="value"
              bindSubLabel="matricule"
              placeholder="Rechercher par nom ou matricule..."
              (search)="onStudentSearch($event)"
              [required]="true">
            </app-ui-multi-select>
          </div>
          <p class="mt-2 text-[11px] text-slate-500 italic">
            Par défaut, le tarif s'applique à tout le niveau scolaire. Utilisez ces champs pour restreindre à une classe ou un élève particulier.
          </p>
        </div>
      </div>
    </app-ui-form>
  `
})
export class FeeFormComponent extends BaseFormComponent implements OnInit {
  @Input() item: any;
  service = inject(FeeService);
  fb = inject(FormBuilder);
  levelService = inject(LevelService);
  yearService = inject(AcademicYearService);
  classroomService = inject(ClassRoomService);
  studentService = inject(StudentService);
  
  form!: FormGroup;
  levels = signal<any[]>([]);
  academicYears = signal<any[]>([]);
  classrooms = signal<any[]>([]);
  students = signal<any[]>([]);
  isSearchingStudents = signal<boolean>(false);
  modalities = [
    { label: 'Paiement Unique', value: 'UNIQUE' },
    { label: 'Paiement par Tranches', value: 'INSTALLMENTS' }
  ];
  periods = [
    { label: 'Mensuel', value: 'MONTHLY' },
    { label: 'Trimestriel', value: 'TRIMESTRIAL' },
    { label: 'Semestriel', value: 'SEMESTRIAL' }
  ];

  override fieldLabels = {
    name: 'Libellé',
    category: 'Catégorie',
    amount: 'Montant',
    level: 'Niveau Scolaire',
    academicYear: 'Année Académique',
    isActive: 'Statut',
    isRequired: 'Frais Obligatoire',
    paymentModality: 'Modalité de Paiement',
    installmentCount: 'Nombre de tranches',
    installmentPeriod: 'Périodicité',
    targetType: 'Type de Ciblage',
    student: 'Élève Spécifique',
    classroom: 'Classe Spécifique',
    applyToExisting: 'Appliquer aux déjà inscrits'
  };

  targetTypes = [
    { label: 'Tout le niveau scolaire', value: 'GLOBAL' },
    { label: 'Une classe spécifique', value: 'CLASSROOM' },
    { label: 'Un élève spécifique', value: 'STUDENT' }
  ];

  categories = [
    { label: 'Scolarité', value: 'TUITION' },
    { label: 'Inscription', value: 'REGISTRATION' },
    { label: 'Cantine', value: 'CANTEEN' },
    { label: 'Transport', value: 'TRANSPORT' },
    { label: 'Autre', value: 'OTHER' }
  ];

  statusOptions = [
    { label: 'Actif', value: true },
    { label: 'Inactif', value: false }
  ];

  override ngOnInit() {
    this.initForm();
    this.loadData();
    super.ngOnInit();
  }

  loadData() {
    this.levelService.list().subscribe(items => {
       this.levels.set(items.map((i: any) => ({ label: i.name, value: i.id })));
    });
    this.yearService.list().subscribe((items: any[]) => {
       this.academicYears.set(items.map((i: any) => ({ label: i.name, value: i.id })));
    });
    this.classroomService.list().subscribe((items: any[]) => {
       this.classrooms.set(items.map((i: any) => ({ label: i.name, value: i.id })));
    });
    // Initial load empty or recent
    this.onStudentSearch('');
  }

  onStudentSearch(term: string) {
    this.isSearchingStudents.set(true);
    this.studentService.list({ search: term, pageSize: 20 }).subscribe({
      next: (items: any[]) => {
        this.students.set(items.map((i: any) => ({ 
          label: `${i.firstName} ${i.lastName}`, 
          value: i.id,
          matricule: i.matricule 
        })));
        this.isSearchingStudents.set(false);
      },
      error: () => this.isSearchingStudents.set(false)
    });
  }

  initForm() {
    this.form = this.fb.group({
      id: [this.item?.id || null],
      name: [this.item?.name || '', Validators.required],
      category: [this.item?.category || 'TUITION', Validators.required],
      amount: [this.item?.amount || 0, [Validators.required, Validators.min(0)]],
      isActive: [this.item?.isActive ?? true, Validators.required],
      isRequired: [this.item?.isRequired ?? true, Validators.required],
      level: [this.item?.level?.id || null, Validators.required],
      academicYear: [this.item?.academicYear?.id || null, Validators.required],
      paymentModality: [this.item?.paymentModality || 'UNIQUE', Validators.required],
      installmentCount: [this.item?.installmentCount || 1, [Validators.required, Validators.min(1)]],
      installmentPeriod: [this.item?.installmentPeriod || 'MONTHLY'],
      targetType: [this.item?.students?.length > 0 ? 'STUDENT' : (this.item?.classroom ? 'CLASSROOM' : 'GLOBAL')],
      students: [this.item?.students?.map((s: any) => s.id) || []],
      classroom: [this.item?.classroom?.id || null],
      applyToExisting: [false]
    });

    // Handle clearing targets when type changes
    this.form.get('targetType')?.valueChanges.subscribe(type => {
      if (type === 'GLOBAL') {
        this.form.patchValue({ students: [], classroom: null });
      } else if (type === 'CLASSROOM') {
        this.form.patchValue({ students: [] });
      } else if (type === 'STUDENT') {
        this.form.patchValue({ classroom: null });
      }
    });
  }

  save() {
    const val = this.form.value;
    // Map camlCase to snake_case for backend
    const payload = {
      ...val,
      is_active: val.isActive,
      is_required: val.isRequired,
      payment_modality: val.paymentModality,
      installment_count: val.installmentCount,
      installment_period: val.installmentPeriod,
      academic_year: val.academicYear,
      students_ids: val.targetType === 'STUDENT' ? val.students : [],
      classroom_id: val.targetType === 'CLASSROOM' ? val.classroom : null,
      apply_to_existing: val.applyToExisting
    };
    return this.service.save(payload);
  }
}
