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
  classrooms: Array<ClassRoomType>;
  end_date: Scalars['Date']['output'];
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isArchived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  start_date: Scalars['Date']['output'];
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
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  level: LevelType;
  mainTeacher?: Maybe<UserType>;
  name: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type ClassRoomTypePaginated = {
  __typename?: 'ClassRoomTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<ClassRoomType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type CycleType = {
  __typename?: 'CycleType';
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  levels: Array<LevelType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type CycleTypePaginated = {
  __typename?: 'CycleTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<CycleType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EstablishmentType = {
  __typename?: 'EstablishmentType';
  academicyearSet: Array<AcademicYearType>;
  address?: Maybe<Scalars['String']['output']>;
  classroomSet: Array<ClassRoomType>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  cycleSet: Array<CycleType>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  levelSet: Array<LevelType>;
  levelsubjectSet: Array<LevelSubjectType>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  subjectSet: Array<SubjectType>;
  updatedAt: Scalars['DateTime']['output'];
  users: Array<UserType>;
  isActive: Scalars['Boolean']['output'];
};

export type EstablishmentTypePaginated = {
  __typename?: 'EstablishmentTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EstablishmentType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type LevelSubjectType = {
  __typename?: 'LevelSubjectType';
  coefficient: Scalars['Decimal']['output'];
  establishment: EstablishmentType;
  /** Volume horaire annuel */
  hourlyQuota: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  level: LevelType;
  subject: SubjectType;
};

export type LevelType = {
  __typename?: 'LevelType';
  classes?: Maybe<Array<Maybe<ClassRoomType>>>;
  classrooms: Array<ClassRoomType>;
  cycle: CycleType;
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  levelSubjects: Array<LevelSubjectType>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  shortName?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
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

export type Query = {
  __typename?: 'Query';
  academicyear?: Maybe<AcademicYearType>;
  academicyears?: Maybe<AcademicYearTypePaginated>;
  activeStructure?: Maybe<StructureResponseType>;
  classroom?: Maybe<ClassRoomType>;
  classrooms?: Maybe<ClassRoomTypePaginated>;
  cycle?: Maybe<CycleType>;
  cycles?: Maybe<CycleTypePaginated>;
  establishment?: Maybe<EstablishmentType>;
  establishments?: Maybe<EstablishmentTypePaginated>;
  level?: Maybe<LevelType>;
  levels?: Maybe<LevelTypePaginated>;
  modules?: Maybe<Array<Maybe<ModuleType>>>;
  permissions?: Maybe<Array<Maybe<PermissionType>>>;
  role?: Maybe<RoleType>;
  roles?: Maybe<Array<Maybe<RoleType>>>;
  subject?: Maybe<SubjectType>;
  subjects?: Maybe<SubjectTypePaginated>;
  user?: Maybe<UserType>;
  users?: Maybe<UserPaginatedType>;
};


export type QueryAcademicyearArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAcademicyearsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryClassroomArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClassroomsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCycleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCyclesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEstablishmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEstablishmentsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLevelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLevelsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubjectArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubjectsArgs = {
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
  users: Array<UserType>;
};

export type StructureResponseType = {
  __typename?: 'StructureResponseType';
  activeAcademicYear?: Maybe<AcademicYearType>;
  cycles?: Maybe<Array<Maybe<CycleType>>>;
};

export type SubjectType = {
  __typename?: 'SubjectType';
  code: Scalars['String']['output'];
  establishment: EstablishmentType;
  id: Scalars['ID']['output'];
  isOptional: Scalars['Boolean']['output'];
  levelSubjects?: Maybe<Array<Maybe<LevelSubjectType>>>;
  name: Scalars['String']['output'];
};

export type SubjectTypePaginated = {
  __typename?: 'SubjectTypePaginated';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<SubjectType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type UserPaginatedType = {
  __typename?: 'UserPaginatedType';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<UserType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type UserType = {
  __typename?: 'UserType';
  dateJoined: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  establishment?: Maybe<EstablishmentType>;
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isStaff: Scalars['Boolean']['output'];
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  mainClassrooms: Array<ClassRoomType>;
  roles: Array<RoleType>;
  username: Scalars['String']['output'];
};

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


export type GetAllUsersQuery = { __typename?: 'Query', users?: { __typename?: 'UserPaginatedType', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'UserType', id: string, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, roles: Array<{ __typename?: 'RoleType', id: string, name: string }> } | null> | null } | null };

export type GetUserByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', user?: { __typename?: 'UserType', id: string, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, roles: Array<{ __typename?: 'RoleType', id: string, name: string }> } | null };

export type GetAllRolesQueryVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAllRolesQuery = { __typename?: 'Query', roles?: Array<{ __typename?: 'RoleType', id: string, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string } | null> | null } | null> | null };

export type GetRoleByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetRoleByIdQuery = { __typename?: 'Query', role?: { __typename?: 'RoleType', id: string, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string } | null> | null } | null };

export type GetAllPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllPermissionsQuery = { __typename?: 'Query', permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string, tag: string } | null> | null };

export type EstablishmentFieldsFragment = { __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean };

export type AcademicYearFieldsFragment = { __typename?: 'AcademicYearType', id: string, name: string, start_date: any, end_date: any, isActive: boolean, isArchived: boolean };

export type CycleFieldsFragment = { __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean };

export type LevelFieldsFragment = { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string } };

export type ClassRoomFieldsFragment = { __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, cycle: { __typename?: 'CycleType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } };

export type LevelSubjectFieldsFragment = { __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } };

export type SubjectFieldsFragment = { __typename?: 'SubjectType', id: string, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } } | null> | null };

export type StructureResponseFragment = { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date: any, end_date: any, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, levels: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, cycle: { __typename?: 'CycleType', id: string, name: string } }> } | null> | null };

export type GetAllEstablishmentsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllEstablishmentsQuery = { __typename?: 'Query', establishments?: { __typename?: 'EstablishmentTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null } | null> | null } | null };

export type GetEstablishmentByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEstablishmentByIdQuery = { __typename?: 'Query', establishment?: { __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null } | null };

export type GetAllAcademicYearsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllAcademicYearsQuery = { __typename?: 'Query', academicyears?: { __typename?: 'AcademicYearTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'AcademicYearType', id: string, name: string, start_date: any, end_date: any, isActive: boolean, isArchived: boolean } | null> | null } | null };

export type GetAcademicYearByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetAcademicYearByIdQuery = { __typename?: 'Query', academicyear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date: any, end_date: any, isActive: boolean, isArchived: boolean } | null };

export type GetAllCyclesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllCyclesQuery = { __typename?: 'Query', cycles?: { __typename?: 'CycleTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number } | null> | null } | null };

export type GetAllLevelsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllLevelsQuery = { __typename?: 'Query', levels?: { __typename?: 'LevelTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, cycle: { __typename?: 'CycleType', id: string, name: string } } | null> | null } | null };

export type GetAllClassRoomsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllClassRoomsQuery = { __typename?: 'Query', classrooms?: { __typename?: 'ClassRoomTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'ClassRoomType', id: string, name: string, capacity: number, level: { __typename?: 'LevelType', id: string, name: string, cycle: { __typename?: 'CycleType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } } | null> | null } | null };

export type GetClassRoomByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetClassRoomByIdQuery = { __typename?: 'Query', classroom?: { __typename?: 'ClassRoomType', id: string, name: string, capacity: number, level: { __typename?: 'LevelType', id: string, name: string, cycle: { __typename?: 'CycleType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } } | null };

export type GetAllSubjectsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllSubjectsQuery = { __typename?: 'Query', subjects?: { __typename?: 'SubjectTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'SubjectType', id: string, name: string, code: string, isOptional: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } } | null> | null } | null> | null } | null };

export type GetActiveStructureQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveStructureQuery = { __typename?: 'Query', activeStructure?: { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date: any, end_date: any, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, levels: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, cycle: { __typename?: 'CycleType', id: string, name: string } }> } | null> | null } | null };

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
export const ClassRoomFieldsFragmentDoc = gql`
    fragment ClassRoomFields on ClassRoomType {
  id
  name
  capacity
  isActive
  level {
    id
    name
    cycle {
      id
      name
    }
  }
  academicYear {
    id
    name
  }
}
    `;
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
    query GetAllRoles($name: String) {
  roles(name: $name) {
    ...RoleFields
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
    query GetAllEstablishments($search: String, $page: Int, $pageSize: Int) {
  establishments(search: $search, page: $page, pageSize: $pageSize) {
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
    query GetAllAcademicYears($search: String, $page: Int, $pageSize: Int) {
  academicyears(search: $search, page: $page, pageSize: $pageSize) {
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
    query GetAllCycles($search: String, $page: Int, $pageSize: Int) {
  cycles(search: $search, page: $page, pageSize: $pageSize) {
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
    query GetAllLevels($search: String, $page: Int, $pageSize: Int) {
  levels(search: $search, page: $page, pageSize: $pageSize) {
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
    query GetAllClassRooms($search: String, $page: Int, $pageSize: Int) {
  classrooms(search: $search, page: $page, pageSize: $pageSize) {
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