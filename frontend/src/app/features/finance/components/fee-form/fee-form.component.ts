import { computed } from '@angular/core';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
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
import { UiButtonComponent } from '@shared/components/ui-button/ui-button.component';

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
    UiMultiSelectComponent,
    UiButtonComponent
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
  rawLevels = signal<any[]>([]); // Pour conserver la structure originale avec cycle
  academicYears = signal<any[]>([]);
  rawClassrooms = signal<any[]>([]);
  allOptions = signal<any[]>([]);
  students = signal<any[]>([]);
  isSearchingStudents = signal<boolean>(false);
  tranchesError = signal<string | null>(null);

  tabs: Tab[] = [
    { 
      id: 'tarif', 
      label: 'Tarif & Modalités',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    },
    { 
      id: 'targeting', 
      label: 'Population & Ciblage',
      icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`
    }
  ];
  currentTab = signal('tarif');

  get customInstallments(): FormArray {
    return this.form.get('customInstallments') as FormArray;
  }

  // Filtrage réactif des options par niveau / cycle
  filteredOptions = computed(() => {
    const levelId = this.form?.get('level')?.value;
    const levels = this.rawLevels();
    const options = this.allOptions();
    
    if (!levelId) return [];
    const selectedLevel = levels.find(l => l.id === levelId);
    if (selectedLevel?.cycle?.id) {
        return options.filter(o => o.cycleId === selectedLevel.cycle.id);
    }
    return options;
  });

  // Disponibilité des options / filières pour le niveau sélectionné
  hasOptionsForSelectedLevel = computed(() => {
    return this.filteredOptions().length > 0;
  });

  // Filtrage réactif des classes par niveau sélectionné
  filteredClassrooms = computed(() => {
    const levelId = this.form?.get('level')?.value;
    const classrooms = this.rawClassrooms();
    if (!levelId) return [];
    return classrooms.filter(c => c.levelId === levelId);
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
    amount: 'Montant Global',
    level: 'Niveau Scolaire',
    academicYear: 'Année Académique',
    isActive: 'Statut',
    isRequired: 'Frais Obligatoire',
    paymentModality: 'Modalités de Paiement',
    installmentCount: 'Nombre de tranches',
    installmentPeriod: 'Périodicité',
    targetType: 'Niveau de ciblage',
    student: 'Élèves Spécifiques',
    classrooms: 'Classes Spécifiques',
    applyToExisting: 'Appliquer aux déjà inscrits'
  };

  targetTypes = [
    { label: 'Tout le Niveau', value: 'GLOBAL', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', desc: 'S\'applique à tous les élèves du niveau' },
    { label: 'Une Filière', value: 'OPTION', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', desc: 'Restreindre à une option spécifique' },
    { label: 'Classes Précises', value: 'CLASSROOM', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', desc: 'Cibler des classes sélectionnées' },
    { label: 'Élèves Spécifiques', value: 'STUDENT', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', desc: 'Tarif personnalisé pour certains élèves' }
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
    this.yearService.listActive().subscribe((items: any[]) => {
       this.academicYears.set(items.map((i: any) => ({ label: i.name, value: i.id })));
       if (items.length > 0 && !this.form.get('academicYear')?.value) {
           this.form.get('academicYear')?.setValue(items[0]?.id);
       }
    });
    this.classroomService.list().subscribe((items: any[]) => {
       this.rawClassrooms.set(items.map((i: any) => ({ 
         label: i.name, 
         value: i.id, 
         levelId: i.level?.id || i.levelId 
       })));
    });
    this.optionService.list().subscribe((items: any[]) => {
       this.allOptions.set(items.map((i: any) => ({ label: i.name, value: i.id, cycleId: i.cycle?.id })));
    });
    this.onStudentSearch('');
  }

  onStudentSearch(term: string) {
    const selectedLevelId = this.form?.get('level')?.value;
    const selectedYearId = this.form?.get('academicYear')?.value;

    this.isSearchingStudents.set(true);
    this.studentService.list({ 
      search: term, 
      academicYearId: selectedYearId || undefined,
      pageSize: 100 
    }).subscribe({
      next: (items: any[]) => {
        let filtered = items;
        if (selectedLevelId) {
          filtered = items.filter((student: any) => {
            if (!student.enrollments || student.enrollments.length === 0) return false;
            return student.enrollments.some((e: any) => e.classroom?.level?.id === selectedLevelId);
          });
        }
        this.students.set(filtered.map((i: any) => ({ 
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
    const existingTargetType = this.item?.students?.length > 0 ? 'STUDENT' : 
      (this.item?.classrooms?.length > 0 ? 'CLASSROOM' : 
      (this.item?.option ? 'OPTION' : 'GLOBAL'));

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
      targetType: [existingTargetType],
      classrooms: [this.item?.classrooms?.map((c: any) => c.id) || []],
      option: [this.item?.option?.id || null],
      students: [this.item?.students?.map((s: any) => s.id) || []],
      applyToExisting: [false],
      customInstallments: this.fb.array([])
    });

    this.initCustomInstallments(this.item?.custom_installments);

    // Réagir aux changements de Niveau Scolaire
    this.form.get('level')?.valueChanges.subscribe(() => {
      // Réinitialiser les sélections dépendantes du niveau
      this.form.patchValue({ classrooms: [], option: null, students: [] }, { emitEvent: false });

      // Re-rechercher les élèves filtrés pour ce nouveau niveau
      this.onStudentSearch('');
    });

    // Écouteur du ciblage
    this.form.get('targetType')?.valueChanges.subscribe(type => {
      this.form.patchValue({ students: [], classrooms: [], option: null }, { emitEvent: false });
      
      this.form.get('classrooms')?.clearValidators();
      this.form.get('option')?.clearValidators();
      this.form.get('students')?.clearValidators();

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

    // Écouteur des modalités de paiement
    this.form.get('paymentModality')?.valueChanges.subscribe(modality => {
      const countCtrl = this.form.get('installmentCount');
      const periodCtrl = this.form.get('installmentPeriod');

      if (modality === 'UNIQUE') {
        countCtrl?.clearValidators();
        countCtrl?.setValue(1);
        periodCtrl?.clearValidators();
      } else {
        countCtrl?.setValidators([Validators.required, Validators.min(1)]);
        periodCtrl?.setValidators([Validators.required]);
        if ((countCtrl?.value || 1) <= 1) {
          countCtrl?.setValue(2);
        }
      }
      
      countCtrl?.updateValueAndValidity();
      periodCtrl?.updateValueAndValidity();
      this.resetEqualInstallments();
    });

    this.form.get('installmentCount')?.valueChanges.subscribe(() => {
       if (this.form.get('paymentModality')?.value === 'INSTALLMENTS') {
           this.resetEqualInstallments();
       }
    });

    this.form.get('amount')?.valueChanges.subscribe(() => {
       if (this.form.get('paymentModality')?.value === 'INSTALLMENTS') {
           this.resetEqualInstallments();
       }
    });
  }

  setTargetType(type: string) {
    this.form.get('targetType')?.setValue(type);
  }


  initCustomInstallments(existingTranches: any[] | null) {
      this.customInstallments.clear();
      
      if (existingTranches && existingTranches.length > 0) {
          const sorted = [...existingTranches].sort((a, b) => a.tranche - b.tranche);
          sorted.forEach((t, index) => {
              const group = this.fb.group({
                  amount: [t.amount, [Validators.required, Validators.min(0)]],
                  dueDate: [t.due_date || t.dueDate || this.getDefaultDueDate(index, sorted.length)]
              });
              this.customInstallments.push(group);
          });
          this.validateTranchesSum();
      } else {
          this.resetEqualInstallments();
      }
  }

  resetEqualInstallments() {
      if (this.form.get('paymentModality')?.value !== 'INSTALLMENTS') {
          this.customInstallments.clear();
          this.tranchesError.set(null);
          return;
      }

      const totalAmount = Math.max(0, Math.floor(Number(this.form.get('amount')?.value || 0)));
      const count = Math.max(1, Number(this.form.get('installmentCount')?.value || 1));
      
      const base = Math.floor(totalAmount / count);
      let remainder = totalAmount - (base * count);

      this.customInstallments.clear();
      for (let i = 0; i < count; i++) {
          const amountForTranche = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder--;

          const group = this.fb.group({
              amount: [amountForTranche, [Validators.required, Validators.min(0)]],
              dueDate: [this.getDefaultDueDate(i, count)]
          });
          this.customInstallments.push(group);
      }
      this.validateTranchesSum();
  }

  getDefaultDueDate(trancheIndex: number, totalTranches: number): string {
      const now = new Date();
      const period = this.form?.get('installmentPeriod')?.value || 'MONTHLY';
      let monthOffset = 0;

      if (period === 'MONTHLY') {
          monthOffset = trancheIndex;
      } else if (period === 'TRIMESTRIAL') {
          monthOffset = trancheIndex * 3;
      } else if (period === 'SEMESTRIAL') {
          monthOffset = trancheIndex * 6;
      }

      const dueDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 15);
      return dueDate.toISOString().split('T')[0];
  }

  onTrancheAmountChange() {
      this.validateTranchesSum();
  }

  validateTranchesSum(): boolean {
      if (this.form.get('paymentModality')?.value !== 'INSTALLMENTS') {
          this.tranchesError.set(null);
          return true;
      }
      const totalAmount = Math.round(Number(this.form.get('amount')?.value || 0));
      const tranches = this.customInstallments.controls;
      const sum = tranches.reduce((s, g) => s + Math.round(Number(g.get('amount')?.value || 0)), 0);
      
      if (sum !== totalAmount) {
          this.tranchesError.set(`Attention: La somme des tranches (${sum.toLocaleString()} FCFA) diffère du montant global (${totalAmount.toLocaleString()} FCFA). Ecart: ${totalAmount - sum} FCFA.`);
          return false;
      } else {
          this.tranchesError.set(null);
          return true;
      }
  }

  override submit() {
      if (this.form.invalid) {
          if (this.form.get('name')?.invalid || this.form.get('category')?.invalid || this.form.get('amount')?.invalid || this.form.get('paymentModality')?.invalid || this.tranchesError() !== null) {
              this.currentTab.set('tarif');
          } else {
              this.currentTab.set('targeting');
          }
      }

      if (!this.validateTranchesSum()) {
          this.currentTab.set('tarif');
          return;
      }
      super.submit();
  }

  save() {
    const val = this.form.value;
    const payload = {
      ...val,
      amount: Math.round(Number(val.amount || 0)),
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
          val.customInstallments.map((item: any, index: number) => ({ 
            tranche: index + 1, 
            amount: Math.round(Number(item.amount || 0)),
            due_date: item.dueDate || null 
          })) 
          : null
    };
    return this.service.save(payload);
  }
}

