import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type EstablishmentFieldsFragment = { __typename?: 'EstablishmentType', id: any, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null, user?: { __typename?: 'UserType', id: any, username: string } | null };

export type AcademicYearFieldsFragment = { __typename?: 'AcademicYearType', id: any, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: any, startDate?: any | null, cycle: { __typename?: 'CycleType', id: any } } | null> | null };

export type CycleFieldsFragment = { __typename?: 'CycleType', id: any, name: string, code?: string | null, description?: string | null, order: number, isActive: boolean, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } };

export type OptionFieldsFragment = { __typename?: 'OptionType', id: any, name: string, code?: string | null, isActive: boolean, cycle?: { __typename?: 'CycleType', id: any, name: string } | null, parent?: { __typename?: 'OptionType', id: any, name: string } | null, establishment: { __typename?: 'EstablishmentType', id: any } };

export type LevelFieldsFragment = { __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } };

export type ClassRoomFieldsFragment = { __typename?: 'ClassRoomType', id: any, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } }, option?: { __typename?: 'OptionType', id: any, name: string, code?: string | null, isActive: boolean, cycle?: { __typename?: 'CycleType', id: any, name: string } | null, parent?: { __typename?: 'OptionType', id: any, name: string } | null, establishment: { __typename?: 'EstablishmentType', id: any } } | null, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } };

export type LevelSubjectFieldsFragment = { __typename?: 'LevelSubjectType', id: any, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: any, name: string }, option?: { __typename?: 'OptionType', id: any, name: string } | null };

export type SubjectFieldsFragment = { __typename?: 'SubjectType', id: any, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: any, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: any, name: string }, option?: { __typename?: 'OptionType', id: any, name: string } | null } | null> | null };

export type AcademicPeriodFieldsFragment = { __typename?: 'AcademicPeriodType', id: any, name: string, startDate: any, endDate: any, isActive: boolean, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } };

export type RoomFieldsFragment = { __typename?: 'RoomType', id: any, name: string, capacity?: number | null };

export type StructureResponseFragment = { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: any, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: any, name: string, code?: string | null, description?: string | null, order: number, isActive: boolean, hasOptions: boolean, levels: Array<{ __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } }>, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } | null> | null };

export type GetAllEstablishmentsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  city?: Types.InputMaybe<Types.Scalars['String']['input']>;
  phone?: Types.InputMaybe<Types.Scalars['String']['input']>;
  userId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  isActive?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllEstablishmentsQuery = { __typename?: 'Query', establishments?: { __typename?: 'EstablishmentTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EstablishmentType', id: any, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null, user?: { __typename?: 'UserType', id: any, username: string } | null } | null> | null } | null };

export type GetEstablishmentByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetEstablishmentByIdQuery = { __typename?: 'Query', establishment?: { __typename?: 'EstablishmentType', id: any, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null, user?: { __typename?: 'UserType', id: any, username: string } | null } | null };

export type GetAllAcademicYearsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isActive?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  isArchived?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllAcademicYearsQuery = { __typename?: 'Query', academicyears?: { __typename?: 'AcademicYearTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'AcademicYearType', id: any, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: any, startDate?: any | null, cycle: { __typename?: 'CycleType', id: any } } | null> | null } | null> | null } | null };

export type GetAcademicYearByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetAcademicYearByIdQuery = { __typename?: 'Query', academicyear?: { __typename?: 'AcademicYearType', id: any, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: any, startDate?: any | null, cycle: { __typename?: 'CycleType', id: any } } | null> | null } | null };

export type GetAllCyclesQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  establishmentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllCyclesQuery = { __typename?: 'Query', cycles?: { __typename?: 'CycleTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'CycleType', id: any, name: string, code?: string | null, description?: string | null, order: number, isActive: boolean, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } | null> | null } | null };

export type GetAllLevelsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  cycleId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  establishmentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllLevelsQuery = { __typename?: 'Query', levels?: { __typename?: 'LevelTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } } | null> | null } | null };

export type GetAllClassRoomsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  levelId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  academicYearId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllClassRoomsQuery = { __typename?: 'Query', classrooms?: { __typename?: 'ClassRoomTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'ClassRoomType', id: any, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } }, option?: { __typename?: 'OptionType', id: any, name: string, code?: string | null, isActive: boolean, cycle?: { __typename?: 'CycleType', id: any, name: string } | null, parent?: { __typename?: 'OptionType', id: any, name: string } | null, establishment: { __typename?: 'EstablishmentType', id: any } } | null, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } } | null> | null } | null };

export type GetClassRoomByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetClassRoomByIdQuery = { __typename?: 'Query', classroom?: { __typename?: 'ClassRoomType', id: any, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } }, option?: { __typename?: 'OptionType', id: any, name: string, code?: string | null, isActive: boolean, cycle?: { __typename?: 'CycleType', id: any, name: string } | null, parent?: { __typename?: 'OptionType', id: any, name: string } | null, establishment: { __typename?: 'EstablishmentType', id: any } } | null, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } } | null };

export type GetAllSubjectsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  levelId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllSubjectsQuery = { __typename?: 'Query', subjects?: { __typename?: 'SubjectTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'SubjectType', id: any, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: any, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: any, name: string }, option?: { __typename?: 'OptionType', id: any, name: string } | null } | null> | null } | null> | null } | null };

export type GetAllAcademicPeriodsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  academicYearId?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllAcademicPeriodsQuery = { __typename?: 'Query', academicPeriods?: { __typename?: 'AcademicPeriodTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'AcademicPeriodType', id: any, name: string, startDate: any, endDate: any, isActive: boolean, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } } | null> | null } | null };

export type GetAllRoomsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllRoomsQuery = { __typename?: 'Query', rooms?: { __typename?: 'RoomTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'RoomType', id: any, name: string, capacity?: number | null } | null> | null } | null };

export type GetAllOptionsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  parentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  establishmentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllOptionsQuery = { __typename?: 'Query', options?: { __typename?: 'OptionTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'OptionType', id: any, name: string, code?: string | null, isActive: boolean, cycle?: { __typename?: 'CycleType', id: any, name: string } | null, parent?: { __typename?: 'OptionType', id: any, name: string } | null, establishment: { __typename?: 'EstablishmentType', id: any } } | null> | null } | null };

export type GetOptionByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetOptionByIdQuery = { __typename?: 'Query', option?: { __typename?: 'OptionType', id: any, name: string, code?: string | null, isActive: boolean, cycle?: { __typename?: 'CycleType', id: any, name: string } | null, parent?: { __typename?: 'OptionType', id: any, name: string } | null, establishment: { __typename?: 'EstablishmentType', id: any } } | null };

export type GetActiveStructureQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetActiveStructureQuery = { __typename?: 'Query', activeStructure?: { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: any, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: any, name: string, code?: string | null, description?: string | null, order: number, isActive: boolean, hasOptions: boolean, levels: Array<{ __typename?: 'LevelType', id: any, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: any, name: string, hasOptions: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } }>, establishment: { __typename?: 'EstablishmentType', id: any, name: string } } | null> | null } | null };

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
  user {
    id
    username
  }
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
  cycleConfigs {
    id
    cycle {
      id
    }
    startDate
  }
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
    hasOptions
    establishment {
      id
      name
    }
  }
}
    `;
export const OptionFieldsFragmentDoc = gql`
    fragment OptionFields on OptionType {
  id
  name
  code
  isActive
  cycle {
    id
    name
  }
  parent {
    id
    name
  }
  establishment {
    id
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
  option {
    ...OptionFields
  }
  academicYear {
    id
    name
  }
}
    ${LevelFieldsFragmentDoc}
${OptionFieldsFragmentDoc}`;
export const LevelSubjectFieldsFragmentDoc = gql`
    fragment LevelSubjectFields on LevelSubjectType {
  id
  coefficient
  hourlyQuota
  level {
    id
    name
  }
  option {
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
export const AcademicPeriodFieldsFragmentDoc = gql`
    fragment AcademicPeriodFields on AcademicPeriodType {
  id
  name
  startDate
  endDate
  isActive
  academicYear {
    id
    name
  }
}
    `;
export const RoomFieldsFragmentDoc = gql`
    fragment RoomFields on RoomType {
  id
  name
  capacity
}
    `;
export const CycleFieldsFragmentDoc = gql`
    fragment CycleFields on CycleType {
  id
  name
  code
  description
  order
  isActive
  hasOptions
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
export const GetAllEstablishmentsDocument = gql`
    query GetAllEstablishments($search: String, $city: String, $phone: String, $userId: ID, $isActive: Boolean, $page: Int, $pageSize: Int) {
  establishments(
    search: $search
    city: $city
    phone: $phone
    userId: $userId
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
    query GetAllSubjects($search: String, $levelId: ID, $page: Int, $pageSize: Int) {
  subjects(search: $search, levelId: $levelId, page: $page, pageSize: $pageSize) {
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
export const GetAllAcademicPeriodsDocument = gql`
    query GetAllAcademicPeriods($search: String, $academicYearId: Int, $page: Int, $pageSize: Int) {
  academicPeriods(
    search: $search
    academicYearId: $academicYearId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...AcademicPeriodFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${AcademicPeriodFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllAcademicPeriodsGQL extends Apollo.Query<GetAllAcademicPeriodsQuery, GetAllAcademicPeriodsQueryVariables> {
    document = GetAllAcademicPeriodsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllRoomsDocument = gql`
    query GetAllRooms($search: String, $page: Int, $pageSize: Int) {
  rooms(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...RoomFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${RoomFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllRoomsGQL extends Apollo.Query<GetAllRoomsQuery, GetAllRoomsQueryVariables> {
    document = GetAllRoomsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllOptionsDocument = gql`
    query GetAllOptions($search: String, $parentId: ID, $establishmentId: ID, $page: Int, $pageSize: Int) {
  options(
    search: $search
    parentId: $parentId
    establishmentId: $establishmentId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...OptionFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${OptionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllOptionsGQL extends Apollo.Query<GetAllOptionsQuery, GetAllOptionsQueryVariables> {
    document = GetAllOptionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetOptionByIdDocument = gql`
    query GetOptionById($id: ID!) {
  option(id: $id) {
    ...OptionFields
  }
}
    ${OptionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetOptionByIdGQL extends Apollo.Query<GetOptionByIdQuery, GetOptionByIdQueryVariables> {
    document = GetOptionByIdDocument;
    
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