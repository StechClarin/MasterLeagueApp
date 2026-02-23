import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type EstablishmentFieldsFragment = { __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null };

export type AcademicYearFieldsFragment = { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: string, startDate?: any | null, cycle: { __typename?: 'CycleType', id: string } } | null> | null };

export type CycleFieldsFragment = { __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, establishment: { __typename?: 'EstablishmentType', id: string, name: string } };

export type LevelFieldsFragment = { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } };

export type ClassRoomFieldsFragment = { __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } };

export type LevelSubjectFieldsFragment = { __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } };

export type SubjectFieldsFragment = { __typename?: 'SubjectType', id: string, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } } | null> | null };

export type StructureResponseFragment = { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, levels: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }>, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null };

export type GetAllEstablishmentsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  city?: Types.InputMaybe<Types.Scalars['String']['input']>;
  phone?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isActive?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllEstablishmentsQuery = { __typename?: 'Query', establishments?: { __typename?: 'EstablishmentTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null } | null> | null } | null };

export type GetEstablishmentByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetEstablishmentByIdQuery = { __typename?: 'Query', establishment?: { __typename?: 'EstablishmentType', id: string, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null } | null };

export type GetAllAcademicYearsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isActive?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  isArchived?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllAcademicYearsQuery = { __typename?: 'Query', academicyears?: { __typename?: 'AcademicYearTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: string, startDate?: any | null, cycle: { __typename?: 'CycleType', id: string } } | null> | null } | null> | null } | null };

export type GetAcademicYearByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetAcademicYearByIdQuery = { __typename?: 'Query', academicyear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: string, startDate?: any | null, cycle: { __typename?: 'CycleType', id: string } } | null> | null } | null };

export type GetAllCyclesQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  establishmentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllCyclesQuery = { __typename?: 'Query', cycles?: { __typename?: 'CycleTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null } | null };

export type GetAllLevelsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  cycleId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  establishmentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllLevelsQuery = { __typename?: 'Query', levels?: { __typename?: 'LevelTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } } | null> | null } | null };

export type GetAllClassRoomsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  levelId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  academicYearId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllClassRoomsQuery = { __typename?: 'Query', classrooms?: { __typename?: 'ClassRoomTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } } | null> | null } | null };

export type GetClassRoomByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetClassRoomByIdQuery = { __typename?: 'Query', classroom?: { __typename?: 'ClassRoomType', id: string, name: string, capacity: number, isActive: boolean, level: { __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } } | null };

export type GetAllSubjectsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  levelId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllSubjectsQuery = { __typename?: 'Query', subjects?: { __typename?: 'SubjectTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'SubjectType', id: string, name: string, code: string, isOptional: boolean, isActive: boolean, levelSubjects?: Array<{ __typename?: 'LevelSubjectType', id: string, coefficient: any, hourlyQuota: number, level: { __typename?: 'LevelType', id: string, name: string } } | null> | null } | null> | null } | null };

export type GetActiveStructureQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetActiveStructureQuery = { __typename?: 'Query', activeStructure?: { __typename?: 'StructureResponseType', activeAcademicYear?: { __typename?: 'AcademicYearType', id: string, name: string, start_date?: any | null, end_date?: any | null, isActive: boolean, isArchived: boolean } | null, cycles?: Array<{ __typename?: 'CycleType', id: string, name: string, order: number, isActive: boolean, levels: Array<{ __typename?: 'LevelType', id: string, name: string, shortName?: string | null, order: number, isActive: boolean, cycle: { __typename?: 'CycleType', id: string, name: string, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } }>, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null } | null };

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