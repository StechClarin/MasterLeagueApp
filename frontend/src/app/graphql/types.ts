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
};

export type AcademicCycleConfigType = {
  __typename?: 'AcademicCycleConfigType';
  academicYear: AcademicYearType;
  cycle: CycleType;
  id: Scalars['ID']['output'];
  /** Date de rentrée spécifique pour ce cycle. Si vide, utilise la date de l'année. */
  startDate?: Maybe<Scalars['Date']['output']>;
};

export type AcademicYearType = {
  __typename?: 'AcademicYearType';
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  cycleConfigs?: Maybe<Array<Maybe<AcademicCycleConfigType>>>;
  end_date?: Maybe<Scalars['Date']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  /** L'année en cours */
  isActive: Scalars['Boolean']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  pedagogyAssignments: Array<TeachingAssignmentType>;
  start_date?: Maybe<Scalars['Date']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  level: LevelType;
  mainTeacher?: Maybe<UserType>;
  name: Scalars['String']['output'];
  pedagogyAssignments: Array<TeachingAssignmentType>;
  planningDetails: Array<PlanningDetailType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  designation: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  personnels: Array<PersonnelType>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ContractTypeTypePaginated = {
  __typename?: 'ContractTypeTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<ContractTypeType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CycleType = {
  __typename?: 'CycleType';
  academicConfigs: Array<AcademicCycleConfigType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  levels: Array<LevelType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CycleTypePaginated = {
  __typename?: 'CycleTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<CycleType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type DocumentType = {
  __typename?: 'DocumentType';
  documentType: DocumentsDocumentDocumentTypeChoices;
  file: Scalars['String']['output'];
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  objectId: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  enrollmentDate: Scalars['Date']['output'];
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isRepeater: Scalars['Boolean']['output'];
  status: StudentsEnrollmentStatusChoices;
  student: StudentType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type EnrollmentTypePaginated = {
  __typename?: 'EnrollmentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EnrollmentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EstablishmentType = {
  __typename?: 'EstablishmentType';
  academicyearSet: Array<AcademicYearType>;
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  classroomSet: Array<ClassRoomType>;
  code?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  cycleSet: Array<CycleType>;
  email?: Maybe<Scalars['String']['output']>;
  enrollmentSet: Array<EnrollmentType>;
  guardianSet: Array<GuardianType>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  levelSet: Array<LevelType>;
  levelsubjectSet: Array<LevelSubjectType>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
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
  taxId?: Maybe<Scalars['String']['output']>;
  teachingassignmentSet: Array<TeachingAssignmentType>;
  updatedAt: Scalars['DateTime']['output'];
  users: Array<UserType>;
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

export type GuardianType = {
  __typename?: 'GuardianType';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phoneNumber: Scalars['String']['output'];
  profession?: Maybe<Scalars['String']['output']>;
  students: Array<StudentType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type LevelSubjectType = {
  __typename?: 'LevelSubjectType';
  coefficient: Scalars['Decimal']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  /** Volume horaire annuel */
  hourlyQuota: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  level: LevelType;
  subject: SubjectType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type LevelType = {
  __typename?: 'LevelType';
  classes?: Maybe<Array<Maybe<ClassRoomType>>>;
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  cycle: CycleType;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  levelSubjects: Array<LevelSubjectType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  shortName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  /** ex: card-view, list-view */
  displayMod: Scalars['String']['output'];
  /** Nom de l'icône (ex: pascal-icon-dashboard) */
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  pages?: Maybe<Array<Maybe<PageType>>>;
};

export type PageType = {
  __typename?: 'PageType';
  /** Nom de l'icône (ex: client-icon) */
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Lien React (ex: /clients) */
  link: Scalars['String']['output'];
  module: ModuleType;
  order: Scalars['Int']['output'];
  /** Liste des tags de permission (ex: ["client"]) */
  permissionTags: Scalars['JSONString']['output'];
  title: Scalars['String']['output'];
};

export type PermissionType = {
  __typename?: 'PermissionType';
  codename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roles: Array<RoleType>;
  tag: Scalars['String']['output'];
};

export type PersonnelType = {
  __typename?: 'PersonnelType';
  address?: Maybe<Scalars['String']['output']>;
  contractType?: Maybe<ContractTypeType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  dateHired?: Maybe<Scalars['Date']['output']>;
  emailPro?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  jobTitle: Scalars['String']['output'];
  matricule: Scalars['String']['output'];
  pedagogyAssignments: Array<TeachingAssignmentType>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  planningDetails: Array<PlanningDetailType>;
  roles: Array<RoleType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  date: Scalars['Date']['output'];
  enseignant: PersonnelType;
  establishment: EstablishmentType;
  heureDebut: Scalars['Time']['output'];
  heureFin: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  matiere: SubjectType;
  planning: PlanningType;
  salle?: Maybe<RoomType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  dateEnd?: Maybe<Scalars['Date']['output']>;
  dateStart?: Maybe<Scalars['Date']['output']>;
  details: Array<PlanningDetailType>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  nom: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  academicyear?: Maybe<AcademicYearType>;
  academicyears?: Maybe<AcademicYearTypePaginated>;
  activeStructure?: Maybe<StructureResponseType>;
  classroom?: Maybe<ClassRoomType>;
  classrooms?: Maybe<ClassRoomTypePaginated>;
  contractType?: Maybe<ContractTypeType>;
  contractTypes?: Maybe<ContractTypeTypePaginated>;
  cycle?: Maybe<CycleType>;
  cycles?: Maybe<CycleTypePaginated>;
  documentsByEntity?: Maybe<Array<Maybe<DocumentType>>>;
  enrollment?: Maybe<EnrollmentType>;
  enrollments?: Maybe<EnrollmentTypePaginated>;
  establishment?: Maybe<EstablishmentType>;
  establishments?: Maybe<EstablishmentTypePaginated>;
  guardian?: Maybe<GuardianType>;
  guardians?: Maybe<GuardianTypePaginated>;
  level?: Maybe<LevelType>;
  levels?: Maybe<LevelTypePaginated>;
  modules?: Maybe<Array<Maybe<ModuleType>>>;
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
  subjects?: Maybe<SubjectTypePaginated>;
  teachingAssignment?: Maybe<TeachingAssignmentType>;
  teachingAssignments?: Maybe<TeachingAssignmentTypePaginated>;
  user?: Maybe<UserType>;
  users?: Maybe<UserTypePaginated>;
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
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
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
};


export type QueryGuardianArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGuardiansArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
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
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  parentPhone?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubjectArgs = {
  id: Scalars['ID']['input'];
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
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type RoleType = {
  __typename?: 'RoleType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<PermissionType>>>;
  personnels: Array<PersonnelType>;
  users: Array<UserType>;
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
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  planningDetails: Array<PlanningDetailType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  heightCm?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  /** Conditions médicales chroniques */
  medicalConditions?: Maybe<Scalars['String']['output']>;
  student: StudentType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  weightKg?: Maybe<Scalars['Int']['output']>;
};

export type StudentType = {
  __typename?: 'StudentType';
  address?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  dateOfBirth?: Maybe<Scalars['Date']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  firstName: Scalars['String']['output'];
  gender: StudentsStudentGenderChoices;
  guardians: Array<GuardianType>;
  health?: Maybe<StudentHealthType>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  matricule: Scalars['String']['output'];
  photo?: Maybe<Scalars['String']['output']>;
  placeOfBirth?: Maybe<Scalars['String']['output']>;
  siblings?: Maybe<Array<Maybe<StudentType>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  /** Inscrit */
  Registered = 'REGISTERED'
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

export type SubjectType = {
  __typename?: 'SubjectType';
  code: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isOptional: Scalars['Boolean']['output'];
  levelSubjects?: Maybe<Array<Maybe<LevelSubjectType>>>;
  name: Scalars['String']['output'];
  pedagogyAssignments: Array<TeachingAssignmentType>;
  planningDetails: Array<PlanningDetailType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  /** Date de fin d'intervention. Si vide, correspond à la fin de l'année scolaire. */
  endDate?: Maybe<Scalars['Date']['output']>;
  establishment: EstablishmentType;
  /** Heures prévues pour ce module */
  hoursScheduled: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  personnel: PersonnelType;
  /** Date de début d'intervention. Si vide, correspond au début de l'année scolaire. */
  startDate?: Maybe<Scalars['Date']['output']>;
  subject: SubjectType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
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
  dateJoined: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  employments: Array<PersonnelType>;
  establishment?: Maybe<EstablishmentType>;
  firstName: Scalars['String']['output'];
  guardianProfile?: Maybe<GuardianType>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isStaff: Scalars['Boolean']['output'];
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  mainClassrooms: Array<ClassRoomType>;
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  roles: Array<RoleType>;
  studentProfile?: Maybe<StudentType>;
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
