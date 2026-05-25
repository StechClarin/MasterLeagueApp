import { computed } from '@angular/core';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { BaseFormComponent } from '@core/abstracts/base-form.component';
import { FeeService } from '../../services/fee.service';
import { LevelService } from '@features/structure/services/level.service';
import { AcademicYearService } from '@features/structure/services/academic_year.service';
import { ClassRoomService } from '@features/structure/services/classroom.service';
import { StudentService } from '@features/students/services/student.service';
import { OptionService } from '@features/structure/services/option.service';

import { UiFormComponent } from '@shared/components/ui-form/ui-form.component';
import { UiInputComponent } from '@shared/components/ui-input/ui-input.component';
import { UiSelectComponent } from '@shared/components/ui-select/ui-select.component';
import { UiMultiSelectComponent } from '@shared/components/ui-multi-select/ui-multi-select.component';
import { UiTabsComponent, Tab } from '@shared/components/ui-tabs/ui-tabs.component';
import { UiFormHeaderComponent } from '@shared/components/ui-form-header/ui-form-header.component';
import { UiFormActionsComponent } from '@shared/components/ui-form-actions/ui-form-actions.component';
import { UiFormErrorsComponent } from '@shared/components/ui-form-errors/ui-form-errors.component';

@Component({
  selector: 'app-fee-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    UiTabsComponent,
    UiFormHeaderComponent,
    UiFormActionsComponent,
    UiFormErrorsComponent,
    UiInputComponent,
    UiSelectComponent,
    UiMultiSelectComponent
  ],
  templateUrl: './fee-form.component.html'
})
export class FeeFormComponent extends BaseFormComponent implements OnInit {
  @Input() item: any;
  service = inject(FeeService);
  fb = inject(FormBuilder);
  levelService = inject(LevelService);
  yearService = inject(AcademicYearService);
  classroomService = inject(ClassRoomService);
  studentService = inject(StudentService);
  optionService = inject(OptionService);
  
  form!: FormGroup;
  levels = signal<any[]>([]);
  rawLevels = signal<any[]>([]); // To keep original objects with cycle info
  academicYears = signal<any[]>([]);
  classrooms = signal<any[]>([]);
  allOptions = signal<any[]>([]);
  students = signal<any[]>([]);
  isSearchingStudents = signal<boolean>(false);
  tranchesError = signal<string | null>(null);

  tabs: Tab[] = [
      { 
          id: 'info', 
          label: 'Informations Générales',
          icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
      },
      { 
          id: 'payment', 
          label: 'Paiement et Tranches',
          icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
      },
      { 
          id: 'targeting', 
          label: 'Ciblage Spécifique',
          icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>`
      }
  ];
  currentTab = signal('info');

  get customInstallments(): FormArray {
    return this.form.get('customInstallments') as FormArray;
  }

  // Computed signal for filtered options - Robust & Surgical
  filteredOptions = computed(() => {
    const levelId = this.form?.get('level')?.value;
    const levels = this.rawLevels();
    const options = this.allOptions();
    
    const selectedLevel = levels.find(l => l.id === levelId);
    if (selectedLevel?.cycle?.id) {
        return options.filter(o => o.cycleId === selectedLevel.cycle.id);
    }
    return options;
  });

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
    classrooms: 'Classes Spécifiques',
    applyToExisting: 'Appliquer aux déjà inscrits'
  };

  targetTypes = [
    { label: 'Tout le niveau scolaire', value: 'GLOBAL' },
    { label: 'Une filière spécifique', value: 'OPTION' },
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
       this.rawLevels.set(items);
       this.levels.set(items.map((i: any) => ({ label: i.name, value: i.id })));
    });
    this.yearService.list().subscribe((items: any[]) => {
       this.academicYears.set(items.map((i: any) => ({ label: i.name, value: i.id })));
    });
    this.classroomService.list().subscribe((items: any[]) => {
       this.classrooms.set(items.map((i: any) => ({ label: i.name, value: i.id })));
    });
    this.optionService.list().subscribe((items: any[]) => {
       this.allOptions.set(items.map((i: any) => ({ label: i.name, value: i.id, cycleId: i.cycle?.id })));
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
      installmentCount: [this.item?.installmentCount || 1],
      installmentPeriod: [this.item?.installmentPeriod || 'MONTHLY'],
      targetType: [this.item?.students?.length > 0 ? 'STUDENT' : (this.item?.classrooms?.length > 0 ? 'CLASSROOM' : (this.item?.option ? 'OPTION' : 'GLOBAL'))],
      classrooms: [this.item?.classrooms?.map((c: any) => c.id) || []],
      option: [this.item?.option?.id || null],
      students: [this.item?.students?.map((s: any) => s.id) || []],
      applyToExisting: [false],
      customInstallments: this.fb.array([])
    });

    this.initCustomInstallments(this.item?.custom_installments);

    // Handle clearing targets and dynamic validators when type changes
    this.form.get('targetType')?.valueChanges.subscribe(type => {
      // Clear values
      this.form.patchValue({ students: [], classrooms: [], option: null }, { emitEvent: false });
      
      // Clear validators
      this.form.get('classrooms')?.clearValidators();
      this.form.get('option')?.clearValidators();
      this.form.get('students')?.clearValidators();

      // Set specific validators
      if (type === 'CLASSROOM') {
        this.form.get('classrooms')?.setValidators([Validators.required]);
      } else if (type === 'OPTION') {
        this.form.get('option')?.setValidators([Validators.required]);
      } else if (type === 'STUDENT') {
        this.form.get('students')?.setValidators([Validators.required]);
      }

      this.form.get('classrooms')?.updateValueAndValidity();
      this.form.get('option')?.updateValueAndValidity();
      this.form.get('students')?.updateValueAndValidity();
    });

    // Handle dynamic validators for installmentCount based on paymentModality
    this.form.get('paymentModality')?.valueChanges.subscribe(modality => {
      const countCtrl = this.form.get('installmentCount');
      const periodCtrl = this.form.get('installmentPeriod');

      if (modality === 'UNIQUE') {
        countCtrl?.clearValidators();
        countCtrl?.setValue(1); // Default for unique
        periodCtrl?.clearValidators();
      } else {
        countCtrl?.setValidators([Validators.required, Validators.min(1)]);
        periodCtrl?.setValidators([Validators.required]);
      }
      
      countCtrl?.updateValueAndValidity();
      periodCtrl?.updateValueAndValidity();
    });

    this.form.get('installmentCount')?.valueChanges.subscribe(count => {
       if (this.form.get('paymentModality')?.value === 'INSTALLMENTS') {
           this.adjustInstallmentControls(count || 1);
       }
    });

    this.form.get('amount')?.valueChanges.subscribe(amount => {
       if (this.form.get('paymentModality')?.value === 'INSTALLMENTS') {
           this.recalculateInstallmentsFromAmount(amount || 0);
       }
    });
    
    // Trigger initial check for modalities
    this.form.get('paymentModality')?.updateValueAndValidity();
  }

  initCustomInstallments(existingTranches: any[] | null) {
      const count = this.form.get('installmentCount')?.value || 1;
      const amount = this.form.get('amount')?.value || 0;
      
      this.customInstallments.clear();
      
      if (existingTranches && existingTranches.length === count) {
          // Charger les tranches existantes
          const sorted = [...existingTranches].sort((a, b) => a.tranche - b.tranche);
          sorted.forEach(t => {
              const ctrl = this.fb.control(t.amount, [Validators.required, Validators.min(0)]);
              ctrl.markAsDirty(); // On les marque dirty pour qu'ils soient verrouillés par défaut
              this.customInstallments.push(ctrl);
          });
      } else {
          // Créer de nouvelles tranches équitables
          this.adjustInstallmentControls(count);
      }
  }

  adjustInstallmentControls(count: number) {
      const amount = this.form.get('amount')?.value || 0;
      const currentCount = this.customInstallments.length;
      
      if (count > currentCount) {
          for (let i = currentCount; i < count; i++) {
              this.customInstallments.push(this.fb.control(0, [Validators.required, Validators.min(0)]));
          }
      } else if (count < currentCount) {
          for (let i = currentCount - 1; i >= count; i--) {
              this.customInstallments.removeAt(i);
          }
      }

      this.recalculateInstallmentsFromAmount(amount, true);
  }

  recalculateInstallmentsFromAmount(totalAmount: number, forceReset = false) {
      const tranches = this.customInstallments.controls;
      if (tranches.length === 0) return;

      if (forceReset) {
          const perTranche = totalAmount / tranches.length;
          tranches.forEach(c => {
              c.setValue(Number(perTranche.toFixed(2)), { emitEvent: false });
              c.markAsPristine();
          });
      } else {
          // Si le montant global change, on recalcule seulement sur les champs non modifiés
          const cleanControls = tranches.filter(c => !c.dirty);
          const dirtySum = tranches.filter(c => c.dirty).reduce((sum, c) => sum + (c.value || 0), 0);
          
          if (cleanControls.length > 0) {
              const remaining = Math.max(0, totalAmount - dirtySum);
              const perClean = remaining / cleanControls.length;
              cleanControls.forEach(c => c.setValue(Number(perClean.toFixed(2)), { emitEvent: false }));
          } else {
              // Tous les champs ont été modifiés manuellement, on force un reset car le total a changé
              const perTranche = totalAmount / tranches.length;
              tranches.forEach(c => {
                  c.setValue(Number(perTranche.toFixed(2)), { emitEvent: false });
                  c.markAsPristine();
              });
          }
      }
      this.validateTranchesSum();
  }

  onTrancheChange(index: number) {
      const totalAmount = this.form.get('amount')?.value || 0;
      const tranches = this.customInstallments.controls;
      
      tranches[index].markAsDirty();

      const cleanControls = tranches.filter(c => !c.dirty);
      if (cleanControls.length === 0) {
          this.validateTranchesSum();
          return;
      }

      const dirtySum = tranches.filter(c => c.dirty).reduce((sum, c) => sum + (c.value || 0), 0);
      const remaining = Math.max(0, totalAmount - dirtySum);
      const perClean = remaining / cleanControls.length;

      cleanControls.forEach(c => {
          c.setValue(Number(perClean.toFixed(2)), { emitEvent: false });
      });
      
      this.validateTranchesSum();
  }

  validateTranchesSum() {
      if (this.form.get('paymentModality')?.value !== 'INSTALLMENTS') {
          this.tranchesError.set(null);
          return true;
      }
      const totalAmount = this.form.get('amount')?.value || 0;
      const sum = this.customInstallments.controls.reduce((s, c) => s + (c.value || 0), 0);
      
      // On tolère une petite différence due aux arrondis (ex: 33.33 * 3 = 99.99)
      if (Math.abs(sum - totalAmount) > 1) {
          this.tranchesError.set(`Attention: La somme des tranches (${sum}) ne correspond pas au montant global (${totalAmount}).`);
          return false;
      } else {
          this.tranchesError.set(null);
          return true;
      }
  }

  override submit() {
      // Validate depending on tab
      if (this.form.invalid) {
          if (this.form.get('name')?.invalid || this.form.get('category')?.invalid || this.form.get('amount')?.invalid || this.form.get('level')?.invalid || this.form.get('academicYear')?.invalid) {
              this.currentTab.set('info');
          } else if (this.form.get('paymentModality')?.invalid || this.form.get('installmentCount')?.invalid || this.form.get('installmentPeriod')?.invalid || this.tranchesError() !== null) {
              this.currentTab.set('payment');
          } else if (this.form.get('classrooms')?.invalid || this.form.get('option')?.invalid || this.form.get('students')?.invalid) {
              this.currentTab.set('targeting');
          }
      }

      if (!this.validateTranchesSum()) {
          this.currentTab.set('payment');
          return;
      }
      super.submit();
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
      classrooms_ids: val.targetType === 'CLASSROOM' ? val.classrooms : [],
      option_id: val.targetType === 'OPTION' ? val.option : null,
      apply_to_existing: val.applyToExisting,
      custom_installments: val.paymentModality === 'INSTALLMENTS' ? 
          val.customInstallments.map((amount: number, index: number) => ({ tranche: index + 1, amount: Number(amount) })) 
          : null
    };
    return this.service.save(payload);
  }
}
