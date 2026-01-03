import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
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
  /**
   * The `Date` scalar type represents a Date
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  Date: { input: any; output: any; }
  /**
   * The `DateTime` scalar type represents a DateTime
   * value as specified by
   * [iso8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: { input: any; output: any; }
  /** The `Decimal` scalar type represents a python Decimal. */
  Decimal: { input: any; output: any; }
  /**
   * Allows use of a JSON String for input / output from the GraphQL schema.
   *
   * Use of this type is *not recommended* as you lose the benefits of having a defined, static
   * schema (one of the key benefits of GraphQL).
   */
  JSONString: { input: any; output: any; }
};

export type AcademicYearType = {
  __typename?: 'AcademicYearType';
  assignments: Array<TeachingAssignmentType>;
  classrooms: Array<ClassRoomType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  end_date?: Maybe<Scalars['Date']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  /** L'année en cours */
  isActive: Scalars['Boolean']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
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
  assignments: Array<TeachingAssignmentType>;
  capacity: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  enrollments: Array<EnrollmentType>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  level: LevelType;
  mainTeacher?: Maybe<UserType>;
  name: Scalars['String']['output'];
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
  /** Texte légal en bas de page */
  printFooter?: Maybe<Scalars['String']['output']>;
  printHeader?: Maybe<Scalars['String']['output']>;
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
  phoneNumber?: Maybe<Scalars['String']['output']>;
  roles: Array<RoleType>;
  teacher?: Maybe<TeacherType>;
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
  role?: Maybe<RoleType>;
  roles?: Maybe<RoleTypePaginated>;
  student?: Maybe<StudentType>;
  students?: Maybe<StudentTypePaginated>;
  subject?: Maybe<SubjectType>;
  subjects?: Maybe<SubjectTypePaginated>;
  teacher?: Maybe<TeacherType>;
  teachers?: Maybe<TeacherTypePaginated>;
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
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeacherArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeachersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeachingAssignmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTeachingAssignmentsArgs = {
  academicYearId?: InputMaybe<Scalars['Int']['input']>;
  classroomId?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  teacherId?: InputMaybe<Scalars['Int']['input']>;
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
  assignments: Array<TeachingAssignmentType>;
  code: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isOptional: Scalars['Boolean']['output'];
  levelSubjects?: Maybe<Array<Maybe<LevelSubjectType>>>;
  name: Scalars['String']['output'];
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

export type TeacherType = {
  __typename?: 'TeacherType';
  address?: Maybe<Scalars['String']['output']>;
  assignments: Array<TeachingAssignmentType>;
  contractType?: Maybe<ContractTypeType>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  dateHired?: Maybe<Scalars['Date']['output']>;
  emailPro?: Maybe<Scalars['String']['output']>;
  establishment: EstablishmentType;
  hoursPerWeek: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  jobTitle: Scalars['String']['output'];
  matricule: Scalars['String']['output'];
  personnelPtr: PersonnelType;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  roles: Array<RoleType>;
  specialty?: Maybe<Scalars['String']['output']>;
  teacher?: Maybe<TeacherType>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<UserType>;
};

export type TeacherTypePaginated = {
  __typename?: 'TeacherTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<TeacherType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type TeachingAssignmentType = {
  __typename?: 'TeachingAssignmentType';
  academicYear: AcademicYearType;
  classroom: ClassRoomType;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  establishment: EstablishmentType;
  /** Heures prévues pour ce module */
  hoursScheduled: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  subject: SubjectType;
  teacher: TeacherType;
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

export type GetAllPersonnelsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllPersonnelsQuery = { __typename?: 'Query', personnels?: { __typename?: 'PersonnelTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'PersonnelType', id: string, matricule: string, jobTitle: string, emailPro?: string | null, phoneNumber?: string | null, address?: string | null, dateHired?: any | null, isActive: boolean, user?: { __typename?: 'UserType', id: string, firstName: string, lastName: string, email: string } | null, roles: Array<{ __typename?: 'RoleType', id: string, name: string }>, contractType?: { __typename?: 'ContractTypeType', id: string, designation: string, code: string } | null, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null } | null };

export type GetPersonnelQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPersonnelQuery = { __typename?: 'Query', personnel?: { __typename?: 'PersonnelType', id: string, matricule: string, jobTitle: string, emailPro?: string | null, phoneNumber?: string | null, address?: string | null, dateHired?: any | null, isActive: boolean, user?: { __typename?: 'UserType', id: string, firstName: string, lastName: string, email: string } | null, roles: Array<{ __typename?: 'RoleType', id: string, name: string }>, establishment: { __typename?: 'EstablishmentType', id: string, name: string }, contractType?: { __typename?: 'ContractTypeType', id: string, designation: string, code: string } | null } | null };

export type GetAllContractTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllContractTypesQuery = { __typename?: 'Query', contractTypes?: { __typename?: 'ContractTypeTypePaginated', items?: Array<{ __typename?: 'ContractTypeType', id: string, designation: string, code: string, description?: string | null } | null> | null } | null };

export type GetContractTypeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetContractTypeQuery = { __typename?: 'Query', contractType?: { __typename?: 'ContractTypeType', id: string, designation: string, code: string, description?: string | null } | null };

export type UserFieldsFragment = { __typename?: 'UserType', id: string, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, roles: Array<{ __typename?: 'RoleType', id: string, name: string }> };

export type RoleFieldsFragment = { __typename?: 'RoleType', id: string, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string } | null> | null };

export type PermissionFieldsFragment = { __typename?: 'PermissionType', id: string, name: string, codename: string, tag: string };

export type GetAllUsersQueryVariables = Exact<{
  username?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllUsersQuery = { __typename?: 'Query', users?: { __typename?: 'UserTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'UserType', id: string, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, roles: Array<{ __typename?: 'RoleType', id: string, name: string }> } | null> | null } | null };

export type GetUserByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', user?: { __typename?: 'UserType', id: string, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, roles: Array<{ __typename?: 'RoleType', id: string, name: string }> } | null };

export type GetAllRolesQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllRolesQuery = { __typename?: 'Query', roles?: { __typename?: 'RoleTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'RoleType', id: string, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string } | null> | null } | null> | null } | null };

export type GetRoleByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetRoleByIdQuery = { __typename?: 'Query', role?: { __typename?: 'RoleType', id: string, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string } | null> | null } | null };

export type GetAllPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllPermissionsQuery = { __typename?: 'Query', permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string, tag: string } | null> | null };

export type EstablishmentFieldsFragment = { __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null };

export type AcademicYearFieldsFragment = { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean };

export type CycleFieldsFragment = { __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, establishment: { __typename?: 'EstablishmentType', id: string, name: string } };

export type LevelFieldsFragment = { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } };

export type ClassRoomFieldsFragment = { __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } };

export type LevelSubjectFieldsFragment = { __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } };

export type SubjectFieldsFragment = { __typename?: 'SubjectType', id: string, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } } | null> | null };

export type StructureResponseFragment = { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, levels: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }>, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null };

export type GetAllEstablishmentsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllEstablishmentsQuery = { __typename?: 'Query', establishments?: { __typename?: 'EstablishmentTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null } | null> | null } | null };

export type GetEstablishmentByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEstablishmentByIdQuery = { __typename?: 'Query', establishment?: { __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null } | null };

export type GetAllAcademicYearsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllAcademicYearsQuery = { __typename?: 'Query', academicyears?: { __typename?: 'AcademicYearTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null> | null } | null };

export type GetAcademicYearByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetAcademicYearByIdQuery = { __typename?: 'Query', academicyear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null };

export type GetAllCyclesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllCyclesQuery = { __typename?: 'Query', cycles?: { __typename?: 'CycleTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null } | null };

export type GetAllLevelsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  cycleId?: InputMaybe<Scalars['ID']['input']>;
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllLevelsQuery = { __typename?: 'Query', levels?: { __typename?: 'LevelTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } } | null> | null } | null };

export type GetAllClassRoomsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  levelId?: InputMaybe<Scalars['ID']['input']>;
  academicYearId?: InputMaybe<Scalars['ID']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllClassRoomsQuery = { __typename?: 'Query', classrooms?: { __typename?: 'ClassRoomTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } } | null> | null } | null };

export type GetClassRoomByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetClassRoomByIdQuery = { __typename?: 'Query', classroom?: { __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } } | null };

export type GetAllSubjectsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllSubjectsQuery = { __typename?: 'Query', subjects?: { __typename?: 'SubjectTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'SubjectType', id: string, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } } | null> | null } | null> | null } | null };

export type GetActiveStructureQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveStructureQuery = { __typename?: 'Query', activeStructure?: { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, levels: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }>, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null } | null };

export type GetAllStudentsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  parentPhone?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllStudentsQuery = { __typename?: 'Query', students?: { __typename?: 'StudentTypePaginated', totalCount?: number | null, numPages?: number | null, items?: Array<{ __typename?: 'StudentType', id: string, matricule: string, firstName: string, lastName: string, gender: StudentsStudentGenderChoices, photo?: string | null, dateOfBirth?: any | null, placeOfBirth?: string | null, address?: string | null, enrollments: Array<{ __typename?: 'EnrollmentType', id: string, status: StudentsEnrollmentStatusChoices, isRepeater: boolean, classroom: { __typename?: 'ClassRoomType', id: string, name: string, level: { __typename?: 'LevelType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } }>, health?: { __typename?: 'StudentHealthType', id: string, bloodGroup?: StudentsStudentHealthBloodGroupChoices | null, allergies?: string | null, medicalConditions?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null } | null, guardians: Array<{ __typename?: 'GuardianType', id: string, firstName?: string | null, lastName?: string | null, phoneNumber: string, profession?: string | null, user?: { __typename?: 'UserType', firstName: string, lastName: string, email: string } | null }> } | null> | null } | null };

export type GetStudentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetStudentQuery = { __typename?: 'Query', student?: { __typename?: 'StudentType', id: string, matricule: string, firstName: string, lastName: string, gender: StudentsStudentGenderChoices, photo?: string | null, dateOfBirth?: any | null, placeOfBirth?: string | null, address?: string | null, health?: { __typename?: 'StudentHealthType', id: string, bloodGroup?: StudentsStudentHealthBloodGroupChoices | null, allergies?: string | null, medicalConditions?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null } | null, enrollments: Array<{ __typename?: 'EnrollmentType', id: string, status: StudentsEnrollmentStatusChoices, classroom: { __typename?: 'ClassRoomType', id: string, name: string, level: { __typename?: 'LevelType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } }>, guardians: Array<{ __typename?: 'GuardianType', id: string, phoneNumber: string, profession?: string | null, user?: { __typename?: 'UserType', firstName: string, lastName: string, email: string } | null }>, siblings?: Array<{ __typename?: 'StudentType', id: string, matricule: string, firstName: string, lastName: string, gender: StudentsStudentGenderChoices, photo?: string | null, dateOfBirth?: any | null } | null> | null } | null };

export const UserFieldsFragmentDoc = gql`
    fragment UserFields on UserType {
  id
  username
  email
  firstName
  lastName
  isActive
  dateJoined
  roles {
    id
    name
  }
}
    `;
export const RoleFieldsFragmentDoc = gql`
    fragment RoleFields on RoleType {
  id
  name
  permissions {
    id
    name
    codename
  }
}
    `;
export const PermissionFieldsFragmentDoc = gql`
    fragment PermissionFields on PermissionType {
  id
  name
  codename
  tag
}
    `;
export const EstablishmentFieldsFragmentDoc = gql`
    fragment EstablishmentFields on EstablishmentType {
  id
  name
  phone
  email
  address
  logo
  isActive
  slogan
  website
  taxId
  city
  country
  printHeader
  printFooter
}
    `;
export const AcademicYearFieldsFragmentDoc = gql`
    fragment AcademicYearFields on AcademicYearType {
  id
  name
  start_date
  end_date
  isActive
  isArchived
}
    `;
export const LevelFieldsFragmentDoc = gql`
    fragment LevelFields on LevelType {
  id
  name
  shortName
  order
  isActive
  cycle {
    id
    name
    establishment {
      id
      name
    }
  }
}
    `;
export const ClassRoomFieldsFragmentDoc = gql`
    fragment ClassRoomFields on ClassRoomType {
  id
  name
  capacity
  isActive
  level {
    ...LevelFields
  }
  academicYear {
    id
    name
  }
}
    ${LevelFieldsFragmentDoc}`;
export const LevelSubjectFieldsFragmentDoc = gql`
    fragment LevelSubjectFields on LevelSubjectType {
  id
  coefficient
  hourlyQuota
  level {
    id
    name
  }
}
    `;
export const SubjectFieldsFragmentDoc = gql`
    fragment SubjectFields on SubjectType {
  id
  name
  code
  isOptional
  isActive
  levelSubjects {
    ...LevelSubjectFields
  }
}
    ${LevelSubjectFieldsFragmentDoc}`;
export const CycleFieldsFragmentDoc = gql`
    fragment CycleFields on CycleType {
  id
  name
  order
  isActive
  establishment {
    id
    name
  }
}
    `;
export const StructureResponseFragmentDoc = gql`
    fragment StructureResponse on StructureResponseType {
  activeAcademicYear {
    id
    name
    start_date
    end_date
    isActive
    isArchived
  }
  cycles {
    ...CycleFields
    levels {
      ...LevelFields
    }
  }
}
    ${CycleFieldsFragmentDoc}
${LevelFieldsFragmentDoc}`;
export const GetAllPersonnelsDocument = gql`
    query GetAllPersonnels($search: String, $page: Int, $pageSize: Int) {
  personnels(search: $search, page: $page, pageSize: $pageSize) {
    items {
      id
      user {
        id
        firstName
        lastName
        email
      }
      roles {
        id
        name
      }
      matricule
      jobTitle
      contractType {
        id
        designation
        code
      }
      emailPro
      phoneNumber
      address
      dateHired
      isActive
      establishment {
        id
        name
      }
    }
    totalCount
    numPages
    currentPage
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllPersonnelsGQL extends Apollo.Query<GetAllPersonnelsQuery, GetAllPersonnelsQueryVariables> {
    document = GetAllPersonnelsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPersonnelDocument = gql`
    query GetPersonnel($id: ID!) {
  personnel(id: $id) {
    id
    user {
      id
      firstName
      lastName
      email
    }
    roles {
      id
      name
    }
    establishment {
      id
      name
    }
    matricule
    jobTitle
    contractType {
      id
      designation
      code
    }
    emailPro
    phoneNumber
    address
    dateHired
    isActive
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetPersonnelGQL extends Apollo.Query<GetPersonnelQuery, GetPersonnelQueryVariables> {
    document = GetPersonnelDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllContractTypesDocument = gql`
    query GetAllContractTypes {
  contractTypes {
    items {
      id
      designation
      code
      description
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllContractTypesGQL extends Apollo.Query<GetAllContractTypesQuery, GetAllContractTypesQueryVariables> {
    document = GetAllContractTypesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetContractTypeDocument = gql`
    query GetContractType($id: ID!) {
  contractType(id: $id) {
    id
    designation
    code
    description
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetContractTypeGQL extends Apollo.Query<GetContractTypeQuery, GetContractTypeQueryVariables> {
    document = GetContractTypeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllUsersDocument = gql`
    query GetAllUsers($username: String, $email: String, $role: String, $page: Int, $pageSize: Int) {
  users(
    username: $username
    email: $email
    role: $role
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...UserFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${UserFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllUsersGQL extends Apollo.Query<GetAllUsersQuery, GetAllUsersQueryVariables> {
    document = GetAllUsersDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetUserByIdDocument = gql`
    query GetUserById($id: Int!) {
  user(id: $id) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetUserByIdGQL extends Apollo.Query<GetUserByIdQuery, GetUserByIdQueryVariables> {
    document = GetUserByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllRolesDocument = gql`
    query GetAllRoles($name: String, $page: Int, $pageSize: Int) {
  roles(name: $name, page: $page, pageSize: $pageSize) {
    items {
      ...RoleFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${RoleFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllRolesGQL extends Apollo.Query<GetAllRolesQuery, GetAllRolesQueryVariables> {
    document = GetAllRolesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetRoleByIdDocument = gql`
    query GetRoleById($id: ID!) {
  role(id: $id) {
    ...RoleFields
  }
}
    ${RoleFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetRoleByIdGQL extends Apollo.Query<GetRoleByIdQuery, GetRoleByIdQueryVariables> {
    document = GetRoleByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllPermissionsDocument = gql`
    query GetAllPermissions {
  permissions {
    ...PermissionFields
  }
}
    ${PermissionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllPermissionsGQL extends Apollo.Query<GetAllPermissionsQuery, GetAllPermissionsQueryVariables> {
    document = GetAllPermissionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllEstablishmentsDocument = gql`
    query GetAllEstablishments($search: String, $city: String, $phone: String, $isActive: Boolean, $page: Int, $pageSize: Int) {
  establishments(
    search: $search
    city: $city
    phone: $phone
    isActive: $isActive
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...EstablishmentFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${EstablishmentFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllEstablishmentsGQL extends Apollo.Query<GetAllEstablishmentsQuery, GetAllEstablishmentsQueryVariables> {
    document = GetAllEstablishmentsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetEstablishmentByIdDocument = gql`
    query GetEstablishmentById($id: ID!) {
  establishment(id: $id) {
    ...EstablishmentFields
  }
}
    ${EstablishmentFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetEstablishmentByIdGQL extends Apollo.Query<GetEstablishmentByIdQuery, GetEstablishmentByIdQueryVariables> {
    document = GetEstablishmentByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllAcademicYearsDocument = gql`
    query GetAllAcademicYears($search: String, $isActive: Boolean, $isArchived: Boolean, $page: Int, $pageSize: Int) {
  academicyears(
    search: $search
    isActive: $isActive
    isArchived: $isArchived
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...AcademicYearFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${AcademicYearFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllAcademicYearsGQL extends Apollo.Query<GetAllAcademicYearsQuery, GetAllAcademicYearsQueryVariables> {
    document = GetAllAcademicYearsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAcademicYearByIdDocument = gql`
    query GetAcademicYearById($id: ID!) {
  academicyear(id: $id) {
    ...AcademicYearFields
  }
}
    ${AcademicYearFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAcademicYearByIdGQL extends Apollo.Query<GetAcademicYearByIdQuery, GetAcademicYearByIdQueryVariables> {
    document = GetAcademicYearByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllCyclesDocument = gql`
    query GetAllCycles($search: String, $establishmentId: ID, $page: Int, $pageSize: Int) {
  cycles(
    search: $search
    establishmentId: $establishmentId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...CycleFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${CycleFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllCyclesGQL extends Apollo.Query<GetAllCyclesQuery, GetAllCyclesQueryVariables> {
    document = GetAllCyclesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllLevelsDocument = gql`
    query GetAllLevels($search: String, $cycleId: ID, $establishmentId: ID, $page: Int, $pageSize: Int) {
  levels(
    search: $search
    cycleId: $cycleId
    establishmentId: $establishmentId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...LevelFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${LevelFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllLevelsGQL extends Apollo.Query<GetAllLevelsQuery, GetAllLevelsQueryVariables> {
    document = GetAllLevelsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllClassRoomsDocument = gql`
    query GetAllClassRooms($search: String, $levelId: ID, $academicYearId: ID, $page: Int, $pageSize: Int) {
  classrooms(
    search: $search
    levelId: $levelId
    academicYearId: $academicYearId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...ClassRoomFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${ClassRoomFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllClassRoomsGQL extends Apollo.Query<GetAllClassRoomsQuery, GetAllClassRoomsQueryVariables> {
    document = GetAllClassRoomsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetClassRoomByIdDocument = gql`
    query GetClassRoomById($id: ID!) {
  classroom(id: $id) {
    ...ClassRoomFields
  }
}
    ${ClassRoomFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetClassRoomByIdGQL extends Apollo.Query<GetClassRoomByIdQuery, GetClassRoomByIdQueryVariables> {
    document = GetClassRoomByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllSubjectsDocument = gql`
    query GetAllSubjects($search: String, $page: Int, $pageSize: Int) {
  subjects(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...SubjectFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${SubjectFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllSubjectsGQL extends Apollo.Query<GetAllSubjectsQuery, GetAllSubjectsQueryVariables> {
    document = GetAllSubjectsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetActiveStructureDocument = gql`
    query GetActiveStructure {
  activeStructure {
    ...StructureResponse
  }
}
    ${StructureResponseFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetActiveStructureGQL extends Apollo.Query<GetActiveStructureQuery, GetActiveStructureQueryVariables> {
    document = GetActiveStructureDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllStudentsDocument = gql`
    query GetAllStudents($search: String, $classroomId: ID, $parentPhone: String, $page: Int, $pageSize: Int) {
  students(
    search: $search
    classroomId: $classroomId
    parentPhone: $parentPhone
    page: $page
    pageSize: $pageSize
  ) {
    totalCount
    numPages
    items {
      id
      matricule
      firstName
      lastName
      gender
      photo
      dateOfBirth
      placeOfBirth
      address
      enrollments {
        id
        status
        isRepeater
        classroom {
          id
          name
          level {
            id
            name
          }
        }
        academicYear {
          id
          name
        }
      }
      health {
        id
        bloodGroup
        allergies
        medicalConditions
        emergencyContactName
        emergencyContactPhone
      }
      guardians {
        id
        firstName
        lastName
        phoneNumber
        profession
        user {
          firstName
          lastName
          email
        }
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllStudentsGQL extends Apollo.Query<GetAllStudentsQuery, GetAllStudentsQueryVariables> {
    document = GetAllStudentsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetStudentDocument = gql`
    query GetStudent($id: ID!) {
  student(id: $id) {
    id
    matricule
    firstName
    lastName
    gender
    photo
    dateOfBirth
    placeOfBirth
    address
    health {
      id
      bloodGroup
      allergies
      medicalConditions
      emergencyContactName
      emergencyContactPhone
    }
    enrollments {
      id
      status
      classroom {
        id
        name
        level {
          id
          name
        }
      }
      academicYear {
        id
        name
      }
    }
    guardians {
      id
      phoneNumber
      profession
      user {
        firstName
        lastName
        email
      }
    }
    siblings {
      id
      matricule
      firstName
      lastName
      gender
      photo
      dateOfBirth
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetStudentGQL extends Apollo.Query<GetStudentQuery, GetStudentQueryVariables> {
    document = GetStudentDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }