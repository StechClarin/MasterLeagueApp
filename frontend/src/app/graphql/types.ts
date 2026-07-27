export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  JSONString: { input: any; output: any; }
  Time: { input: any; output: any; }
  UUID: { input: any; output: any; }
};

export type AcademicCycleConfigType = {
  __typename?: 'AcademicCycleConfigType';
  academicYear: AcademicYearType;
  createdByUser?: Maybe<UserType>;
  cycle: CycleType;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  /** Date de rentrée spécifique pour ce cycle. Si vide, utilise la date de l'année. */
  startDate?: Maybe<Scalars['Date']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type AcademicPeriodType = {
  __typename?: 'AcademicPeriodType';
  academicYear: AcademicYearType;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  cycles: Array<CycleType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  endDate: Scalars['Date']['output'];
  establishment: EstablishmentType;
  evaluationSessions: Array<EvaluationSessionType>;
  id: Scalars['UUID']['output'];
  /** Définit si c'est la période de saisie actuelle */
  isActive: Scalars['Boolean']['output'];
  /** Indique si la période est définitivement clôturée et verrouillée. */
  isClosed: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  startDate: Scalars['Date']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type AcademicPeriodTypePaginated = {
  __typename?: 'AcademicPeriodTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<AcademicPeriodType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type AcademicYearType = {
  __typename?: 'AcademicYearType';
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  cycleConfigs?: Maybe<Array<Maybe<AcademicCycleConfigType>>>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  end_date?: Maybe<Scalars['Date']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  feedefinitionSet: Array<FeeDefinitionType>;
  id: Scalars['UUID']['output'];
  /** L'année en cours */
  isActive: Scalars['Boolean']['output'];
  isArchived: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  pedagogyAssignments: Array<TeachingAssignmentType>;
  periods: Array<AcademicPeriodType>;
  start_date?: Maybe<Scalars['Date']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type AcademicYearTypePaginated = {
  __typename?: 'AcademicYearTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<AcademicYearType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ClassRoomType = {
  __typename?: 'ClassRoomType';
  academicYear: AcademicYearType;
  capacity: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  evaluationPlannings: Array<EvaluationPlanningType>;
  evaluationSubjects: Array<EvaluationSubjectType>;
  groupFees: Array<FeeDefinitionType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  level: LevelType;
  mainTeacher?: Maybe<UserType>;
  name: Scalars['String']['output'];
  option?: Maybe<OptionType>;
  pedagogyAssignments: Array<TeachingAssignmentType>;
  planningDetails: Array<PlanningDetailType>;
  /** Classes concernées par ce planning (Laissez vide pour appliquer à tout l'établissement) */
  targetedPlannings: Array<PlanningType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type ClassRoomTypePaginated = {
  __typename?: 'ClassRoomTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<ClassRoomType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ContractTypeType = {
  __typename?: 'ContractTypeType';
  code: Scalars['String']['output'];
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  designation: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  personnels: Array<PersonnelType>;
  updatedByUser?: Maybe<UserType>;
};

export type ContractTypeTypePaginated = {
  __typename?: 'ContractTypeTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<ContractTypeType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export enum CoreEstablishmentMembershipStatusChoices {
  /** Actif */
  Active = 'ACTIVE',
  /** Inactif */
  Inactive = 'INACTIVE',
  /** Invité */
  Invited = 'INVITED',
  /** Révoqué */
  Revoked = 'REVOKED'
}

export type CycleType = {
  __typename?: 'CycleType';
  academicConfigs: Array<AcademicCycleConfigType>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  hasOptions: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levels: Array<LevelType>;
  name: Scalars['String']['output'];
  options: Array<OptionType>;
  order: Scalars['Int']['output'];
  periods: Array<AcademicPeriodType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type CycleTypePaginated = {
  __typename?: 'CycleTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<CycleType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type DashboardType = {
  __typename?: 'DashboardType';
  averageGrade?: Maybe<Scalars['Float']['output']>;
  gradeEvolution?: Maybe<Array<Maybe<EvolutionPointType>>>;
  paymentMethodsDistribution?: Maybe<Array<Maybe<DistributionPointType>>>;
  revenueEvolution?: Maybe<Array<Maybe<EvolutionPointType>>>;
  studentDistribution?: Maybe<Array<Maybe<DistributionPointType>>>;
  topStudents?: Maybe<Array<Maybe<StudentPerformanceType>>>;
  totalActiveEvaluations?: Maybe<Scalars['Int']['output']>;
  totalClassrooms?: Maybe<Scalars['Int']['output']>;
  totalPending?: Maybe<Scalars['Float']['output']>;
  totalRevenue?: Maybe<Scalars['Float']['output']>;
  totalStaff?: Maybe<Scalars['Int']['output']>;
  totalStudents?: Maybe<Scalars['Int']['output']>;
};

export type DistributionPointType = {
  __typename?: 'DistributionPointType';
  category?: Maybe<Scalars['String']['output']>;
  count?: Maybe<Scalars['Float']['output']>;
};

export type DocumentType = {
  __typename?: 'DocumentType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  documentType: DocumentsDocumentDocumentTypeChoices;
  establishment: EstablishmentType;
  file: Scalars['String']['output'];
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  objectId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedByUser?: Maybe<UserType>;
  uploadedAt: Scalars['DateTime']['output'];
};

/** An enumeration. */
export enum DocumentsDocumentDocumentTypeChoices {
  /** Autre */
  Autre = 'AUTRE',
  /** Contrat de Travail */
  Contrat = 'CONTRAT',
  /** CV */
  Cv = 'CV',
  /** Diplôme */
  Diplome = 'DIPLOME',
  /** Justificatif */
  Justificatif = 'JUSTIFICATIF',
  /** Photo d'identité */
  Photo = 'PHOTO'
}

export type EnrollmentType = {
  __typename?: 'EnrollmentType';
  academicYear: AcademicYearType;
  classroom: ClassRoomType;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  enrollmentDate: Scalars['Date']['output'];
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  invoices: Array<InvoiceType>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isRepeater: Scalars['Boolean']['output'];
  status: StudentsEnrollmentStatusChoices;
  student: StudentType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type EnrollmentTypePaginated = {
  __typename?: 'EnrollmentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EnrollmentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EstablishmentMembershipType = {
  __typename?: 'EstablishmentMembershipType';
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  /** Le propriétaire a tous les droits sur l'établissement */
  isOwner: Scalars['Boolean']['output'];
  roles: Array<RoleType>;
  status: CoreEstablishmentMembershipStatusChoices;
  updatedByUser?: Maybe<UserType>;
  user: UserType;
};

export type EstablishmentMembershipTypePaginated = {
  __typename?: 'EstablishmentMembershipTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EstablishmentMembershipType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EstablishmentType = {
  __typename?: 'EstablishmentType';
  academicperiodSet: Array<AcademicPeriodType>;
  academicyearSet: Array<AcademicYearType>;
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  classroomSet: Array<ClassRoomType>;
  code?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdByUser?: Maybe<UserType>;
  cycleSet: Array<CycleType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  documentSet: Array<DocumentType>;
  email?: Maybe<Scalars['String']['output']>;
  enrollmentSet: Array<EnrollmentType>;
  evaluationplanningSet: Array<EvaluationPlanningType>;
  evaluationsessionSet: Array<EvaluationSessionType>;
  evaluationsubjectSet: Array<EvaluationSubjectType>;
  evaluationsupervisionSet: Array<EvaluationSupervisionType>;
  evaluationtypeSet: Array<EvaluationTypeType>;
  feedefinitionSet: Array<FeeDefinitionType>;
  gradeSet: Array<GradeType>;
  guardianSet: Array<GuardianType>;
  id: Scalars['UUID']['output'];
  invoiceSet: Array<InvoiceType>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levelSet: Array<LevelType>;
  levelsubjectSet: Array<LevelSubjectType>;
  logo?: Maybe<Scalars['String']['output']>;
  memberships: Array<EstablishmentMembershipType>;
  name: Scalars['String']['output'];
  optionSet: Array<OptionType>;
  paymentSet: Array<PaymentType>;
  personnelSet: Array<PersonnelType>;
  phone?: Maybe<Scalars['String']['output']>;
  planningSet: Array<PlanningType>;
  planningdetailSet: Array<PlanningDetailType>;
  /** Texte légal en bas de page */
  printFooter?: Maybe<Scalars['String']['output']>;
  printHeader?: Maybe<Scalars['String']['output']>;
  roomSet: Array<RoomType>;
  slogan?: Maybe<Scalars['String']['output']>;
  studentSet: Array<StudentType>;
  studenthealthSet: Array<StudentHealthType>;
  subjectSet: Array<SubjectType>;
  subjectgroupSet: Array<SubjectGroupType>;
  taxId?: Maybe<Scalars['String']['output']>;
  teachingassignmentSet: Array<TeachingAssignmentType>;
  updatedAt: Scalars['DateTime']['output'];
  updatedByUser?: Maybe<UserType>;
  user?: Maybe<UserType>;
  website?: Maybe<Scalars['String']['output']>;
};

export type EstablishmentTypePaginated = {
  __typename?: 'EstablishmentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EstablishmentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EvaluationPlanningType = {
  __typename?: 'EvaluationPlanningType';
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  date: Scalars['Date']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Durée de l'épreuve en minutes */
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  establishment: EstablishmentType;
  evaluationSubject: EvaluationSubjectType;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** Marque cet examen comme annulé */
  isCancelled: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  /** Niveaux concernés par cette planification */
  levels: Array<LevelType>;
  /** Date à laquelle l'examen a été reporté */
  rescheduledTo?: Maybe<Scalars['Date']['output']>;
  rooms: Array<RoomType>;
  startTime?: Maybe<Scalars['Time']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type EvaluationPlanningTypePaginated = {
  __typename?: 'EvaluationPlanningTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EvaluationPlanningType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EvaluationSessionType = {
  __typename?: 'EvaluationSessionType';
  academicPeriod: AcademicPeriodType;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  evaluationType: EvaluationTypeType;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  scope: EvaluationsEvaluationSessionScopeChoices;
  status: EvaluationsEvaluationSessionStatusChoices;
  subjects: Array<EvaluationSubjectType>;
  supervisions?: Maybe<Array<Maybe<EvaluationSupervisionType>>>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type EvaluationSessionTypePaginated = {
  __typename?: 'EvaluationSessionTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EvaluationSessionType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EvaluationSubjectType = {
  __typename?: 'EvaluationSubjectType';
  classrooms: Array<ClassRoomType>;
  coefficient?: Maybe<Scalars['Decimal']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  grades: Array<GradeType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levelCoefficients?: Maybe<Array<Maybe<LevelCoefficientType>>>;
  /** Niveaux concernés par cette épreuve */
  levels: Array<LevelType>;
  maxScore: Scalars['Decimal']['output'];
  plannings: Array<EvaluationPlanningType>;
  session: EvaluationSessionType;
  subject: SubjectType;
  /** Sujet de l'épreuve (PDF/Image) */
  subjectFile?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type EvaluationSupervisionType = {
  __typename?: 'EvaluationSupervisionType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  date: Scalars['Date']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  room?: Maybe<RoomType>;
  session: EvaluationSessionType;
  supervisors: Array<PersonnelType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type EvaluationTypeType = {
  __typename?: 'EvaluationTypeType';
  /** Code système (ex: CC, EXAM) pour le moteur de bulletin */
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  evaluationSessions: Array<EvaluationSessionType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
  /** Poids par défaut dans le calcul de la moyenne de matière */
  weight: Scalars['Decimal']['output'];
};

export type EvaluationTypeTypePaginated = {
  __typename?: 'EvaluationTypeTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EvaluationTypeType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export enum EvaluationsEvaluationSessionScopeChoices {
  /** Classe */
  Class = 'CLASS',
  /** Établissement */
  Establishment = 'ESTABLISHMENT',
  /** Niveau */
  Level = 'LEVEL'
}

/** An enumeration. */
export enum EvaluationsEvaluationSessionStatusChoices {
  /** Annulée */
  Cancelled = 'CANCELLED',
  /** Saisie terminée */
  Completed = 'COMPLETED',
  /** Brouillon */
  Draft = 'DRAFT',
  /** Saisie en cours */
  InProgress = 'IN_PROGRESS',
  /** Verrouillée */
  Locked = 'LOCKED'
}

/** An enumeration. */
export enum EvaluationsGradeAbsenceStatusChoices {
  /** Absence Justifiée (Neutre) */
  Justified = 'JUSTIFIED',
  /** Présent */
  None = 'NONE',
  /** Absence Non-Justifiée (Zéro) */
  Unjustified = 'UNJUSTIFIED'
}

export type EvolutionPointType = {
  __typename?: 'EvolutionPointType';
  label?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export type FeeDefinitionType = {
  __typename?: 'FeeDefinitionType';
  academicYear: AcademicYearType;
  amount: Scalars['Decimal']['output'];
  category: FinanceFeeDefinitionCategoryChoices;
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  /** Format: [{'tranche': 1, 'amount': 50000}, {'tranche': 2, 'amount': 25000}] */
  customInstallments?: Maybe<Scalars['JSONString']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  /** Nombre de tranches si applicable */
  installmentCount: Scalars['Int']['output'];
  installmentPeriod?: Maybe<FinanceFeeDefinitionInstallmentPeriodChoices>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  level: LevelType;
  name: Scalars['String']['output'];
  option?: Maybe<OptionType>;
  paymentModality: FinanceFeeDefinitionPaymentModalityChoices;
  students: Array<StudentType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type FeeDefinitionTypePaginated = {
  __typename?: 'FeeDefinitionTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<FeeDefinitionType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export enum FinanceFeeDefinitionCategoryChoices {
  /** Cantine */
  Canteen = 'CANTEEN',
  /** Autre */
  Other = 'OTHER',
  /** Frais d'Inscription */
  Registration = 'REGISTRATION',
  /** Transport */
  Transport = 'TRANSPORT',
  /** Scolarité */
  Tuition = 'TUITION'
}

/** An enumeration. */
export enum FinanceFeeDefinitionInstallmentPeriodChoices {
  /** Mensuel */
  Monthly = 'MONTHLY',
  /** Semestriel */
  Semestrial = 'SEMESTRIAL',
  /** Trimestriel */
  Trimestrial = 'TRIMESTRIAL'
}

/** An enumeration. */
export enum FinanceFeeDefinitionPaymentModalityChoices {
  /** Paiement par Tranches */
  Installments = 'INSTALLMENTS',
  /** Paiement Unique */
  Unique = 'UNIQUE'
}

/** An enumeration. */
export enum FinanceInvoiceCategoryChoices {
  /** Cantine */
  Canteen = 'CANTEEN',
  /** Autre */
  Other = 'OTHER',
  /** Frais d'Inscription */
  Registration = 'REGISTRATION',
  /** Transport */
  Transport = 'TRANSPORT',
  /** Scolarité */
  Tuition = 'TUITION'
}

/** An enumeration. */
export enum FinanceInvoiceStatusChoices {
  /** Annulé */
  Cancelled = 'CANCELLED',
  /** Payé */
  Paid = 'PAID',
  /** Partiel */
  Partial = 'PARTIAL',
  /** Impayé */
  Unpaid = 'UNPAID'
}

/** An enumeration. */
export enum FinancePaymentPaymentMethodChoices {
  /** Virement Bancaire */
  BankTransfer = 'BANK_TRANSFER',
  /** Espèces */
  Cash = 'CASH',
  /** Chèque */
  Check = 'CHECK',
  /** Mobile Money */
  MobileMoney = 'MOBILE_MONEY'
}

export type GradeType = {
  __typename?: 'GradeType';
  /** Statut de présence à l'évaluation */
  absenceStatus: EvaluationsGradeAbsenceStatusChoices;
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  evaluationSubject?: Maybe<EvaluationSubjectType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  student: StudentType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
  /** Note obtenue */
  value?: Maybe<Scalars['Decimal']['output']>;
};

export type GradeTypePaginated = {
  __typename?: 'GradeTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<GradeType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type GuardianType = {
  __typename?: 'GuardianType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isLegalGuardian: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phoneNumber: Scalars['String']['output'];
  profession?: Maybe<Scalars['String']['output']>;
  role: StudentsGuardianRoleChoices;
  students: Array<StudentType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
  user?: Maybe<UserType>;
};

export type GuardianTypePaginated = {
  __typename?: 'GuardianTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<GuardianType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export enum HrPersonnelGenderChoices {
  /** Féminin */
  F = 'F',
  /** Masculin */
  M = 'M'
}

export type InvoiceType = {
  __typename?: 'InvoiceType';
  category: FinanceInvoiceCategoryChoices;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  /** Format copié de FeeDefinition: [{'tranche': 1, 'amount': 50000}, {'tranche': 2, 'amount': 25000}] */
  customInstallments?: Maybe<Scalars['JSONString']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  dueDate?: Maybe<Scalars['Date']['output']>;
  enrollment?: Maybe<EnrollmentType>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  /** Nombre de tranches prévu pour ce frais */
  installmentCount: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  paidAmount: Scalars['Decimal']['output'];
  payments: Array<PaymentType>;
  /** Nombre de fois que la facture/reçu a été imprimée */
  printCount: Scalars['Int']['output'];
  reference?: Maybe<Scalars['String']['output']>;
  remainingAmount?: Maybe<Scalars['Decimal']['output']>;
  status: FinanceInvoiceStatusChoices;
  student: StudentType;
  title: Scalars['String']['output'];
  totalAmount: Scalars['Decimal']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type InvoiceTypePaginated = {
  __typename?: 'InvoiceTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<InvoiceType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type LevelCoefficientType = {
  __typename?: 'LevelCoefficientType';
  coefficient?: Maybe<Scalars['Decimal']['output']>;
  credits?: Maybe<Scalars['Decimal']['output']>;
  groupName?: Maybe<Scalars['String']['output']>;
  levelId?: Maybe<Scalars['ID']['output']>;
};

export type LevelSubjectType = {
  __typename?: 'LevelSubjectType';
  coefficient: Scalars['Decimal']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  credits?: Maybe<Scalars['Decimal']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  group?: Maybe<SubjectGroupType>;
  /** Volume horaire annuel */
  hourlyQuota: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isOptional: Scalars['Boolean']['output'];
  level: LevelType;
  option?: Maybe<OptionType>;
  subject: SubjectType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type LevelType = {
  __typename?: 'LevelType';
  classes?: Maybe<Array<Maybe<ClassRoomType>>>;
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  cycle: CycleType;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  /** Niveaux concernés par cette planification */
  evaluationPlannings: Array<EvaluationPlanningType>;
  /** Niveaux concernés par cette épreuve */
  evaluationSubjects: Array<EvaluationSubjectType>;
  fees: Array<FeeDefinitionType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levelSubjects: Array<LevelSubjectType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  shortName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};


export type LevelTypeClassesArgs = {
  year?: InputMaybe<Scalars['String']['input']>;
};

export type LevelTypePaginated = {
  __typename?: 'LevelTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<LevelType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type ModuleType = {
  __typename?: 'ModuleType';
  /** Code technique unique (ex: mod-finance) */
  code: Scalars['String']['output'];
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  /** ex: card-view, list-view */
  displayMod: Scalars['String']['output'];
  /** Nom de l'icône (ex: pascal-icon-dashboard) */
  icon: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  /** Définit si le module est débloqué par la licence */
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  pages?: Maybe<Array<Maybe<PageType>>>;
  updatedByUser?: Maybe<UserType>;
};

export type OptionType = {
  __typename?: 'OptionType';
  children: Array<OptionType>;
  classrooms: Array<ClassRoomType>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  cycle?: Maybe<CycleType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  fees: Array<FeeDefinitionType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levelSubjects: Array<LevelSubjectType>;
  name: Scalars['String']['output'];
  parent?: Maybe<OptionType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type OptionTypePaginated = {
  __typename?: 'OptionTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<OptionType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PageType = {
  __typename?: 'PageType';
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Nom de l'icône (ex: client-icon) */
  icon: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  /** Lien React (ex: /clients) */
  link: Scalars['String']['output'];
  module: ModuleType;
  order: Scalars['Int']['output'];
  /** Liste des tags de permission (ex: ["client"]) */
  permissionTags: Scalars['JSONString']['output'];
  title: Scalars['String']['output'];
  updatedByUser?: Maybe<UserType>;
};

export type PaymentType = {
  __typename?: 'PaymentType';
  amount: Scalars['Decimal']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  invoice: InvoiceType;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  note: Scalars['String']['output'];
  paymentDate: Scalars['DateTime']['output'];
  paymentMethod: FinancePaymentPaymentMethodChoices;
  receivedBy?: Maybe<PersonnelType>;
  /** Numéro de reçu ou réf transaction */
  reference: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type PaymentTypePaginated = {
  __typename?: 'PaymentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<PaymentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PermissionType = {
  __typename?: 'PermissionType';
  codename: Scalars['String']['output'];
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  roles: Array<RoleType>;
  tag: Scalars['String']['output'];
  updatedByUser?: Maybe<UserType>;
};

export type PersonnelType = {
  __typename?: 'PersonnelType';
  address?: Maybe<Scalars['String']['output']>;
  contractType?: Maybe<ContractTypeType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  dateHired?: Maybe<Scalars['Date']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  emailPro?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  gender: HrPersonnelGenderChoices;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  jobTitle: Scalars['String']['output'];
  matricule: Scalars['String']['output'];
  paymentSet: Array<PaymentType>;
  pedagogyAssignments: Array<TeachingAssignmentType>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  planningDetails: Array<PlanningDetailType>;
  roles: Array<RoleType>;
  supervisions: Array<EvaluationSupervisionType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
  user?: Maybe<UserType>;
};

export type PersonnelTypePaginated = {
  __typename?: 'PersonnelTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<PersonnelType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PlanningDetailType = {
  __typename?: 'PlanningDetailType';
  classe: ClassRoomType;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  date: Scalars['Date']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  enseignant: PersonnelType;
  establishment: EstablishmentType;
  heureDebut: Scalars['Time']['output'];
  heureFin: Scalars['Time']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** Marque ce cours spécifique comme annulé (utile pour les absences) */
  isCancelled: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  matiere: SubjectType;
  planning: PlanningType;
  /** Date à laquelle le cours a été reporté */
  rescheduledTo?: Maybe<Scalars['Date']['output']>;
  salle?: Maybe<RoomType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type PlanningDetailTypePaginated = {
  __typename?: 'PlanningDetailTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<PlanningDetailType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PlanningType = {
  __typename?: 'PlanningType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  dateEnd?: Maybe<Scalars['Date']['output']>;
  dateStart?: Maybe<Scalars['Date']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  details: Array<PlanningDetailType>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** Marque cette période comme étant un congé (Annule les cours) */
  isConge: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  /** Planning récurrent (Emploi du temps de base) */
  isGlobal: Scalars['Boolean']['output'];
  /** Planning ponctuel (Evénement, Semaine d'examens...) */
  isSpecific: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  nom: Scalars['String']['output'];
  /** Classes concernées par ce planning (Laissez vide pour appliquer à tout l'établissement) */
  targetClasses: Array<ClassRoomType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type PlanningTypePaginated = {
  __typename?: 'PlanningTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<PlanningType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type Query = {
  __typename?: 'Query';
  academicPeriods?: Maybe<AcademicPeriodTypePaginated>;
  academicyear?: Maybe<AcademicYearType>;
  academicyears?: Maybe<AcademicYearTypePaginated>;
  activeStructure?: Maybe<StructureResponseType>;
  classroom?: Maybe<ClassRoomType>;
  classrooms?: Maybe<ClassRoomTypePaginated>;
  compiledSchedule?: Maybe<Array<Maybe<Scalars['JSONString']['output']>>>;
  contractType?: Maybe<ContractTypeType>;
  contractTypes?: Maybe<ContractTypeTypePaginated>;
  cycle?: Maybe<CycleType>;
  cycles?: Maybe<CycleTypePaginated>;
  dashboardData?: Maybe<DashboardType>;
  documentsByEntity?: Maybe<Array<Maybe<DocumentType>>>;
  enrollment?: Maybe<EnrollmentType>;
  enrollments?: Maybe<EnrollmentTypePaginated>;
  establishment?: Maybe<EstablishmentType>;
  establishments?: Maybe<EstablishmentTypePaginated>;
  evaluationPlannings?: Maybe<EvaluationPlanningTypePaginated>;
  evaluationSession?: Maybe<EvaluationSessionType>;
  evaluationSessions?: Maybe<EvaluationSessionTypePaginated>;
  evaluationTypes?: Maybe<EvaluationTypeTypePaginated>;
  feeDefinitions?: Maybe<FeeDefinitionTypePaginated>;
  grades?: Maybe<GradeTypePaginated>;
  guardian?: Maybe<GuardianType>;
  guardians?: Maybe<GuardianTypePaginated>;
  invoices?: Maybe<InvoiceTypePaginated>;
  level?: Maybe<LevelType>;
  levels?: Maybe<LevelTypePaginated>;
  me?: Maybe<UserType>;
  membership?: Maybe<EstablishmentMembershipType>;
  memberships?: Maybe<EstablishmentMembershipTypePaginated>;
  modules?: Maybe<Array<Maybe<ModuleType>>>;
  option?: Maybe<OptionType>;
  options?: Maybe<OptionTypePaginated>;
  payment?: Maybe<PaymentType>;
  payments?: Maybe<PaymentTypePaginated>;
  permissions?: Maybe<Array<Maybe<PermissionType>>>;
  personnel?: Maybe<PersonnelType>;
  personnels?: Maybe<PersonnelTypePaginated>;
  planning?: Maybe<PlanningType>;
  planningDetail?: Maybe<PlanningDetailType>;
  planningDetails?: Maybe<PlanningDetailTypePaginated>;
  plannings?: Maybe<PlanningTypePaginated>;
  role?: Maybe<RoleType>;
  roles?: Maybe<RoleTypePaginated>;
  room?: Maybe<RoomType>;
  rooms?: Maybe<RoomTypePaginated>;
  student?: Maybe<StudentType>;
  students?: Maybe<StudentTypePaginated>;
  subject?: Maybe<SubjectType>;
  subjectgroup?: Maybe<SubjectGroupType>;
  subjectgroups?: Maybe<SubjectGroupTypePaginated>;
  subjects?: Maybe<SubjectTypePaginated>;
  teachingAssignment?: Maybe<TeachingAssignmentType>;
  teachingAssignments?: Maybe<TeachingAssignmentTypePaginated>;
  usedFeeCategories?: Maybe<Array<Maybe<Scalars['JSONString']['output']>>>;
  user?: Maybe<UserType>;
  users?: Maybe<UserTypePaginated>;
};


export type QueryAcademicPeriodsArgs = {
  academicYearId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAcademicyearArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAcademicyearsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryClassroomArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassroomsArgs = {
  academicYearId?: InputMaybe<Scalars['ID']['input']>;
  levelId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCompiledScheduleArgs = {
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  endDate: Scalars['Date']['input'];
  personnelId?: InputMaybe<Scalars['ID']['input']>;
  startDate: Scalars['Date']['input'];
};


export type QueryContractTypeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryContractTypesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCycleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCyclesArgs = {
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDocumentsByEntityArgs = {
  appLabel: Scalars['String']['input'];
  modelName: Scalars['String']['input'];
  objectId: Scalars['ID']['input'];
};


export type QueryEnrollmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEnrollmentsArgs = {
  academicYearId?: InputMaybe<Scalars['ID']['input']>;
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEstablishmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEstablishmentsArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryEvaluationPlanningsArgs = {
  classeId?: InputMaybe<Scalars['ID']['input']>;
  maxDate?: InputMaybe<Scalars['Date']['input']>;
  minDate?: InputMaybe<Scalars['Date']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEvaluationSessionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEvaluationSessionsArgs = {
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  evaluationTypeId?: InputMaybe<Scalars['ID']['input']>;
  levelId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  periodId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  subjectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryEvaluationTypesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeeDefinitionsArgs = {
  levelId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGradesArgs = {
  academicPeriodId?: InputMaybe<Scalars['ID']['input']>;
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  evaluationSessionId?: InputMaybe<Scalars['ID']['input']>;
  evaluationSubjectId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGuardianArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGuardiansArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryInvoicesArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  maxPaidAmount?: InputMaybe<Scalars['Float']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  studentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryLevelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLevelsArgs = {
  cycleId?: InputMaybe<Scalars['ID']['input']>;
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMembershipsArgs = {
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryOptionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOptionsArgs = {
  cycleId?: InputMaybe<Scalars['ID']['input']>;
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  invoiceId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  paymentDate?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPersonnelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPersonnelsArgs = {
  contractType?: InputMaybe<Scalars['ID']['input']>;
  establishment?: InputMaybe<Scalars['ID']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<Scalars['ID']['input']>;
  roleName?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanningArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlanningDetailArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPlanningDetailsArgs = {
  classeId?: InputMaybe<Scalars['ID']['input']>;
  maxDate?: InputMaybe<Scalars['Date']['input']>;
  minDate?: InputMaybe<Scalars['Date']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanningsArgs = {
  maxDate?: InputMaybe<Scalars['Date']['input']>;
  minDate?: InputMaybe<Scalars['Date']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRoomArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoomsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStudentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStudentsArgs = {
  academicYearId?: InputMaybe<Scalars['ID']['input']>;
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  parentPhone?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubjectArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubjectgroupArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubjectgroupsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubjectsArgs = {
  levelId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeachingAssignmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeachingAssignmentsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUsersArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type RoleType = {
  __typename?: 'RoleType';
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  memberships: Array<EstablishmentMembershipType>;
  name: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<PermissionType>>>;
  personnels: Array<PersonnelType>;
  updatedByUser?: Maybe<UserType>;
};

export type RoleTypePaginated = {
  __typename?: 'RoleTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<RoleType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type RoomType = {
  __typename?: 'RoomType';
  capacity?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  evaluationPlannings: Array<EvaluationPlanningType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  planningDetails: Array<PlanningDetailType>;
  supervisions: Array<EvaluationSupervisionType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type RoomTypePaginated = {
  __typename?: 'RoomTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<RoomType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type StructureResponseType = {
  __typename?: 'StructureResponseType';
  activeAcademicYear?: Maybe<AcademicYearType>;
  cycles?: Maybe<Array<Maybe<CycleType>>>;
};

export type StudentHealthType = {
  __typename?: 'StudentHealthType';
  /** Liste des allergies connues */
  allergies?: Maybe<Scalars['String']['output']>;
  bloodGroup?: Maybe<StudentsStudentHealthBloodGroupChoices>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  heightCm?: Maybe<Scalars['Int']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  /** Conditions médicales chroniques */
  medicalConditions?: Maybe<Scalars['String']['output']>;
  student: StudentType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
  weightKg?: Maybe<Scalars['Int']['output']>;
};

export type StudentPerformanceType = {
  __typename?: 'StudentPerformanceType';
  averageGrade?: Maybe<Scalars['Float']['output']>;
  matricule?: Maybe<Scalars['String']['output']>;
  studentName?: Maybe<Scalars['String']['output']>;
};

export type StudentType = {
  __typename?: 'StudentType';
  address?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  dateOfBirth?: Maybe<Scalars['Date']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  firstName: Scalars['String']['output'];
  gender: StudentsStudentGenderChoices;
  grades: Array<GradeType>;
  guardians: Array<GuardianType>;
  health?: Maybe<StudentHealthType>;
  id: Scalars['UUID']['output'];
  invoices: Array<InvoiceType>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  matricule: Scalars['String']['output'];
  photo?: Maybe<Scalars['String']['output']>;
  placeOfBirth?: Maybe<Scalars['String']['output']>;
  qrCodeBase64?: Maybe<Scalars['String']['output']>;
  /** Identifiant unique de la puce NFC/RFID */
  rfidUid?: Maybe<Scalars['String']['output']>;
  siblings?: Maybe<Array<Maybe<StudentType>>>;
  specialFees: Array<FeeDefinitionType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
  user?: Maybe<UserType>;
};

export type StudentTypePaginated = {
  __typename?: 'StudentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<StudentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** An enumeration. */
export enum StudentsEnrollmentStatusChoices {
  /** Renvoyé */
  Expelled = 'EXPELLED',
  /** Parti */
  Left = 'LEFT',
  /** En attente */
  Pending = 'PENDING',
  /** Inscrit */
  Registered = 'REGISTERED'
}

/** An enumeration. */
export enum StudentsGuardianRoleChoices {
  /** Père */
  Father = 'FATHER',
  /** Mère */
  Mother = 'MOTHER',
  /** Tuteur */
  Tutor = 'TUTOR'
}

/** An enumeration. */
export enum StudentsStudentGenderChoices {
  /** Féminin */
  F = 'F',
  /** Masculin */
  M = 'M'
}

/** An enumeration. */
export enum StudentsStudentHealthBloodGroupChoices {
  /** AB+ */
  Ab = 'AB_',
  /** AB- */
  Ab_5 = 'AB__5',
  /** A+ */
  A = 'A_',
  /** A- */
  A_1 = 'A__1',
  /** B+ */
  B = 'B_',
  /** B- */
  B_3 = 'B__3',
  /** O+ */
  O = 'O_',
  /** O- */
  O_7 = 'O__7'
}

export type SubjectGroupType = {
  __typename?: 'SubjectGroupType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levelSubjects: Array<LevelSubjectType>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type SubjectGroupTypePaginated = {
  __typename?: 'SubjectGroupTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<SubjectGroupType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type SubjectType = {
  __typename?: 'SubjectType';
  code: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  evaluationSubjects: Array<EvaluationSubjectType>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  levelSubjects?: Maybe<Array<Maybe<LevelSubjectType>>>;
  name: Scalars['String']['output'];
  pedagogyAssignments: Array<TeachingAssignmentType>;
  planningDetails: Array<PlanningDetailType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type SubjectTypePaginated = {
  __typename?: 'SubjectTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<SubjectType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TeachingAssignmentType = {
  __typename?: 'TeachingAssignmentType';
  academicYear: AcademicYearType;
  classroom: ClassRoomType;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdByUser?: Maybe<UserType>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Date de fin d'intervention. Si vide, correspond à la fin de l'année scolaire. */
  endDate?: Maybe<Scalars['Date']['output']>;
  establishment: EstablishmentType;
  /** Heures prévues pour ce module */
  hoursScheduled: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  personnel: PersonnelType;
  /** Date de début d'intervention. Si vide, correspond au début de l'année scolaire. */
  startDate?: Maybe<Scalars['Date']['output']>;
  subject: SubjectType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedByUser?: Maybe<UserType>;
};

export type TeachingAssignmentTypePaginated = {
  __typename?: 'TeachingAssignmentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<TeachingAssignmentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type UserType = {
  __typename?: 'UserType';
  createdAcademiccycleconfigSet: Array<AcademicCycleConfigType>;
  createdAcademicperiodSet: Array<AcademicPeriodType>;
  createdAcademicyearSet: Array<AcademicYearType>;
  createdByUser?: Maybe<UserType>;
  createdClassroomSet: Array<ClassRoomType>;
  createdContracttypeSet: Array<ContractTypeType>;
  createdCycleSet: Array<CycleType>;
  createdDocumentSet: Array<DocumentType>;
  createdEnrollmentSet: Array<EnrollmentType>;
  createdEstablishmentSet: Array<EstablishmentType>;
  createdEstablishmentmembershipSet: Array<EstablishmentMembershipType>;
  createdEvaluationplanningSet: Array<EvaluationPlanningType>;
  createdEvaluationsessionSet: Array<EvaluationSessionType>;
  createdEvaluationsubjectSet: Array<EvaluationSubjectType>;
  createdEvaluationsupervisionSet: Array<EvaluationSupervisionType>;
  createdEvaluationtypeSet: Array<EvaluationTypeType>;
  createdFeedefinitionSet: Array<FeeDefinitionType>;
  createdGradeSet: Array<GradeType>;
  createdGuardianSet: Array<GuardianType>;
  createdInvoiceSet: Array<InvoiceType>;
  createdLevelSet: Array<LevelType>;
  createdLevelsubjectSet: Array<LevelSubjectType>;
  createdModuleSet: Array<ModuleType>;
  createdOptionSet: Array<OptionType>;
  createdPageSet: Array<PageType>;
  createdPaymentSet: Array<PaymentType>;
  createdPermissionSet: Array<PermissionType>;
  createdPersonnelSet: Array<PersonnelType>;
  createdPlanningSet: Array<PlanningType>;
  createdPlanningdetailSet: Array<PlanningDetailType>;
  createdRoleSet: Array<RoleType>;
  createdRoomSet: Array<RoomType>;
  createdStudentSet: Array<StudentType>;
  createdStudenthealthSet: Array<StudentHealthType>;
  createdSubjectSet: Array<SubjectType>;
  createdSubjectgroupSet: Array<SubjectGroupType>;
  createdTeachingassignmentSet: Array<TeachingAssignmentType>;
  createdUserSet: Array<UserType>;
  dateJoined: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  email: Scalars['String']['output'];
  employments: Array<PersonnelType>;
  establishmentsOwned: Array<EstablishmentType>;
  firstName: Scalars['String']['output'];
  guardianProfile?: Maybe<GuardianType>;
  hubId?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isStaff: Scalars['Boolean']['output'];
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  mainClassrooms: Array<ClassRoomType>;
  memberships: Array<EstablishmentMembershipType>;
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<Maybe<RoleType>>>;
  studentProfile?: Maybe<StudentType>;
  updatedAcademiccycleconfigSet: Array<AcademicCycleConfigType>;
  updatedAcademicperiodSet: Array<AcademicPeriodType>;
  updatedAcademicyearSet: Array<AcademicYearType>;
  updatedByUser?: Maybe<UserType>;
  updatedClassroomSet: Array<ClassRoomType>;
  updatedContracttypeSet: Array<ContractTypeType>;
  updatedCycleSet: Array<CycleType>;
  updatedDocumentSet: Array<DocumentType>;
  updatedEnrollmentSet: Array<EnrollmentType>;
  updatedEstablishmentSet: Array<EstablishmentType>;
  updatedEstablishmentmembershipSet: Array<EstablishmentMembershipType>;
  updatedEvaluationplanningSet: Array<EvaluationPlanningType>;
  updatedEvaluationsessionSet: Array<EvaluationSessionType>;
  updatedEvaluationsubjectSet: Array<EvaluationSubjectType>;
  updatedEvaluationsupervisionSet: Array<EvaluationSupervisionType>;
  updatedEvaluationtypeSet: Array<EvaluationTypeType>;
  updatedFeedefinitionSet: Array<FeeDefinitionType>;
  updatedGradeSet: Array<GradeType>;
  updatedGuardianSet: Array<GuardianType>;
  updatedInvoiceSet: Array<InvoiceType>;
  updatedLevelSet: Array<LevelType>;
  updatedLevelsubjectSet: Array<LevelSubjectType>;
  updatedModuleSet: Array<ModuleType>;
  updatedOptionSet: Array<OptionType>;
  updatedPageSet: Array<PageType>;
  updatedPaymentSet: Array<PaymentType>;
  updatedPermissionSet: Array<PermissionType>;
  updatedPersonnelSet: Array<PersonnelType>;
  updatedPlanningSet: Array<PlanningType>;
  updatedPlanningdetailSet: Array<PlanningDetailType>;
  updatedRoleSet: Array<RoleType>;
  updatedRoomSet: Array<RoomType>;
  updatedStudentSet: Array<StudentType>;
  updatedStudenthealthSet: Array<StudentHealthType>;
  updatedSubjectSet: Array<SubjectType>;
  updatedSubjectgroupSet: Array<SubjectGroupType>;
  updatedTeachingassignmentSet: Array<TeachingAssignmentType>;
  updatedUserSet: Array<UserType>;
  username: Scalars['String']['output'];
};

export type UserTypePaginated = {
  __typename?: 'UserTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<UserType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};
