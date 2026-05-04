import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type EvaluationTypeFieldsFragment = { __typename?: 'EvaluationTypeType', id: any, name: string, code?: string | null, weight: any, description?: string | null, isActive: boolean };

export type EvaluationSessionFieldsFragment = { __typename?: 'EvaluationSessionType', id: any, title: string, status: Types.EvaluationsEvaluationSessionStatusChoices, scope: Types.EvaluationsEvaluationSessionScopeChoices, evaluationType: { __typename?: 'EvaluationTypeType', id: any, name: string, code?: string | null, weight: any }, academicPeriod: { __typename?: 'AcademicPeriodType', id: any, name: string }, subjects: Array<{ __typename?: 'EvaluationSubjectType', id: any, maxScore: any, coefficient?: any | null, subjectFile?: string | null, levelCoefficients?: Array<{ __typename?: 'LevelCoefficientType', levelId?: number | null, coefficient?: any | null } | null> | null, subject: { __typename?: 'SubjectType', id: any, name: string }, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, plannings: Array<{ __typename?: 'EvaluationPlanningType', id: any, date: any, startTime?: any | null, durationMinutes?: number | null, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, classrooms: Array<{ __typename?: 'ClassRoomType', id: any, name: string, level: { __typename?: 'LevelType', id: any } }>, rooms: Array<{ __typename?: 'RoomType', id: any, name: string }> }> }> };

export type EvaluationSubjectFieldsFragment = { __typename?: 'EvaluationSubjectType', id: any, maxScore: any, coefficient?: any | null, subjectFile?: string | null, levelCoefficients?: Array<{ __typename?: 'LevelCoefficientType', levelId?: number | null, coefficient?: any | null } | null> | null, subject: { __typename?: 'SubjectType', id: any, name: string }, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, plannings: Array<{ __typename?: 'EvaluationPlanningType', id: any, date: any, startTime?: any | null, durationMinutes?: number | null, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, classrooms: Array<{ __typename?: 'ClassRoomType', id: any, name: string, level: { __typename?: 'LevelType', id: any } }>, rooms: Array<{ __typename?: 'RoomType', id: any, name: string }> }> };

export type EvaluationPlanningFieldsFragment = { __typename?: 'EvaluationPlanningType', id: any, date: any, startTime?: any | null, durationMinutes?: number | null, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, classrooms: Array<{ __typename?: 'ClassRoomType', id: any, name: string, level: { __typename?: 'LevelType', id: any } }>, rooms: Array<{ __typename?: 'RoomType', id: any, name: string }> };

export type EvaluationSupervisionFieldsFragment = { __typename?: 'EvaluationSupervisionType', id: any, date: any, room?: { __typename?: 'RoomType', id: any, name: string } | null, supervisors: Array<{ __typename?: 'PersonnelType', id: any, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }> };

export type GradeFieldsFragment = { __typename?: 'GradeType', id: any, value?: any | null, comment?: string | null, isAbsent: boolean, student: { __typename?: 'StudentType', id: any, matricule: string, firstName: string, lastName: string }, evaluationSubject?: { __typename?: 'EvaluationSubjectType', id: any, subject: { __typename?: 'SubjectType', name: string }, session: { __typename?: 'EvaluationSessionType', evaluationType: { __typename?: 'EvaluationTypeType', code?: string | null, weight: any } } } | null };

export type GetAllEvaluationTypesQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllEvaluationTypesQuery = { __typename?: 'Query', evaluationTypes?: { __typename?: 'EvaluationTypeTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EvaluationTypeType', id: any, name: string, code?: string | null, weight: any, description?: string | null, isActive: boolean } | null> | null } | null };

export type GetAllEvaluationSessionsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  classroomId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  levelId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  periodId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  subjectId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  evaluationTypeId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllEvaluationSessionsQuery = { __typename?: 'Query', evaluationSessions?: { __typename?: 'EvaluationSessionTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EvaluationSessionType', id: any, title: string, status: Types.EvaluationsEvaluationSessionStatusChoices, scope: Types.EvaluationsEvaluationSessionScopeChoices, supervisions?: Array<{ __typename?: 'EvaluationSupervisionType', id: any, date: any, room?: { __typename?: 'RoomType', id: any, name: string } | null, supervisors: Array<{ __typename?: 'PersonnelType', id: any, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }> } | null> | null, evaluationType: { __typename?: 'EvaluationTypeType', id: any, name: string, code?: string | null, weight: any }, academicPeriod: { __typename?: 'AcademicPeriodType', id: any, name: string }, subjects: Array<{ __typename?: 'EvaluationSubjectType', id: any, maxScore: any, coefficient?: any | null, subjectFile?: string | null, levelCoefficients?: Array<{ __typename?: 'LevelCoefficientType', levelId?: number | null, coefficient?: any | null } | null> | null, subject: { __typename?: 'SubjectType', id: any, name: string }, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, plannings: Array<{ __typename?: 'EvaluationPlanningType', id: any, date: any, startTime?: any | null, durationMinutes?: number | null, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, classrooms: Array<{ __typename?: 'ClassRoomType', id: any, name: string, level: { __typename?: 'LevelType', id: any } }>, rooms: Array<{ __typename?: 'RoomType', id: any, name: string }> }> }> } | null> | null } | null };

export type GetAllGradesQueryVariables = Types.Exact<{
  evaluationSubjectId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  evaluationSessionId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  studentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  academicPeriodId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  classroomId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllGradesQuery = { __typename?: 'Query', grades?: { __typename?: 'GradeTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'GradeType', id: any, value?: any | null, comment?: string | null, isAbsent: boolean, student: { __typename?: 'StudentType', id: any, matricule: string, firstName: string, lastName: string }, evaluationSubject?: { __typename?: 'EvaluationSubjectType', id: any, subject: { __typename?: 'SubjectType', name: string }, session: { __typename?: 'EvaluationSessionType', evaluationType: { __typename?: 'EvaluationTypeType', code?: string | null, weight: any } } } | null } | null> | null } | null };

export type GetEvaluationSessionQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetEvaluationSessionQuery = { __typename?: 'Query', evaluationSession?: { __typename?: 'EvaluationSessionType', id: any, title: string, status: Types.EvaluationsEvaluationSessionStatusChoices, scope: Types.EvaluationsEvaluationSessionScopeChoices, evaluationType: { __typename?: 'EvaluationTypeType', id: any, name: string, code?: string | null, weight: any }, academicPeriod: { __typename?: 'AcademicPeriodType', id: any, name: string }, subjects: Array<{ __typename?: 'EvaluationSubjectType', id: any, maxScore: any, coefficient?: any | null, subjectFile?: string | null, levelCoefficients?: Array<{ __typename?: 'LevelCoefficientType', levelId?: number | null, coefficient?: any | null } | null> | null, subject: { __typename?: 'SubjectType', id: any, name: string }, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, plannings: Array<{ __typename?: 'EvaluationPlanningType', id: any, date: any, startTime?: any | null, durationMinutes?: number | null, levels: Array<{ __typename?: 'LevelType', id: any, name: string }>, classrooms: Array<{ __typename?: 'ClassRoomType', id: any, name: string, level: { __typename?: 'LevelType', id: any } }>, rooms: Array<{ __typename?: 'RoomType', id: any, name: string }> }> }> } | null };

export type GetAllEvaluationPlanningsQueryVariables = Types.Exact<{
  classeId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  minDate?: Types.InputMaybe<Types.Scalars['Date']['input']>;
  maxDate?: Types.InputMaybe<Types.Scalars['Date']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllEvaluationPlanningsQuery = { __typename?: 'Query', evaluationPlannings?: { __typename?: 'EvaluationPlanningTypePaginated', totalCount?: number | null, numPages?: number | null, items?: Array<{ __typename?: 'EvaluationPlanningType', id: any, date: any, startTime?: any | null, durationMinutes?: number | null, evaluationSubject: { __typename?: 'EvaluationSubjectType', id: any, subject: { __typename?: 'SubjectType', id: any, name: string } }, classrooms: Array<{ __typename?: 'ClassRoomType', id: any, name: string }> } | null> | null } | null };

export const EvaluationTypeFieldsFragmentDoc = gql`
    fragment EvaluationTypeFields on EvaluationTypeType {
  id
  name
  code
  weight
  description
  isActive
}
    `;
export const EvaluationPlanningFieldsFragmentDoc = gql`
    fragment EvaluationPlanningFields on EvaluationPlanningType {
  id
  date
  startTime
  durationMinutes
  levels {
    id
    name
  }
  classrooms {
    id
    name
    level {
      id
    }
  }
  rooms {
    id
    name
  }
}
    `;
export const EvaluationSubjectFieldsFragmentDoc = gql`
    fragment EvaluationSubjectFields on EvaluationSubjectType {
  id
  maxScore
  coefficient
  levelCoefficients {
    levelId
    coefficient
  }
  subjectFile
  subject {
    id
    name
  }
  levels {
    id
    name
  }
  plannings {
    ...EvaluationPlanningFields
  }
}
    ${EvaluationPlanningFieldsFragmentDoc}`;
export const EvaluationSessionFieldsFragmentDoc = gql`
    fragment EvaluationSessionFields on EvaluationSessionType {
  id
  title
  status
  scope
  evaluationType {
    id
    name
    code
    weight
  }
  academicPeriod {
    id
    name
  }
  subjects {
    ...EvaluationSubjectFields
  }
}
    ${EvaluationSubjectFieldsFragmentDoc}`;
export const EvaluationSupervisionFieldsFragmentDoc = gql`
    fragment EvaluationSupervisionFields on EvaluationSupervisionType {
  id
  date
  room {
    id
    name
  }
  supervisors {
    id
    user {
      firstName
      lastName
    }
  }
}
    `;
export const GradeFieldsFragmentDoc = gql`
    fragment GradeFields on GradeType {
  id
  value
  comment
  isAbsent
  student {
    id
    matricule
    firstName
    lastName
  }
  evaluationSubject {
    id
    subject {
      name
    }
    session {
      evaluationType {
        code
        weight
      }
    }
  }
}
    `;
export const GetAllEvaluationTypesDocument = gql`
    query GetAllEvaluationTypes($search: String, $page: Int, $pageSize: Int) {
  evaluationTypes(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...EvaluationTypeFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${EvaluationTypeFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllEvaluationTypesGQL extends Apollo.Query<GetAllEvaluationTypesQuery, GetAllEvaluationTypesQueryVariables> {
    document = GetAllEvaluationTypesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllEvaluationSessionsDocument = gql`
    query GetAllEvaluationSessions($search: String, $classroomId: ID, $levelId: ID, $periodId: ID, $subjectId: ID, $evaluationTypeId: ID, $page: Int, $pageSize: Int) {
  evaluationSessions(
    search: $search
    classroomId: $classroomId
    levelId: $levelId
    periodId: $periodId
    subjectId: $subjectId
    evaluationTypeId: $evaluationTypeId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...EvaluationSessionFields
      supervisions {
        ...EvaluationSupervisionFields
      }
    }
    totalCount
    numPages
    currentPage
  }
}
    ${EvaluationSessionFieldsFragmentDoc}
${EvaluationSupervisionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllEvaluationSessionsGQL extends Apollo.Query<GetAllEvaluationSessionsQuery, GetAllEvaluationSessionsQueryVariables> {
    document = GetAllEvaluationSessionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllGradesDocument = gql`
    query GetAllGrades($evaluationSubjectId: ID, $evaluationSessionId: ID, $studentId: ID, $academicPeriodId: ID, $classroomId: ID, $page: Int, $pageSize: Int) {
  grades(
    evaluationSubjectId: $evaluationSubjectId
    evaluationSessionId: $evaluationSessionId
    studentId: $studentId
    academicPeriodId: $academicPeriodId
    classroomId: $classroomId
    page: $page
    pageSize: $pageSize
  ) {
    items {
      ...GradeFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${GradeFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllGradesGQL extends Apollo.Query<GetAllGradesQuery, GetAllGradesQueryVariables> {
    document = GetAllGradesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetEvaluationSessionDocument = gql`
    query GetEvaluationSession($id: ID!) {
  evaluationSession(id: $id) {
    ...EvaluationSessionFields
  }
}
    ${EvaluationSessionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetEvaluationSessionGQL extends Apollo.Query<GetEvaluationSessionQuery, GetEvaluationSessionQueryVariables> {
    document = GetEvaluationSessionDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllEvaluationPlanningsDocument = gql`
    query GetAllEvaluationPlannings($classeId: ID, $minDate: Date, $maxDate: Date, $page: Int, $pageSize: Int) {
  evaluationPlannings(
    classeId: $classeId
    minDate: $minDate
    maxDate: $maxDate
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      date
      startTime
      durationMinutes
      evaluationSubject {
        id
        subject {
          id
          name
        }
      }
      classrooms {
        id
        name
      }
    }
    totalCount
    numPages
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllEvaluationPlanningsGQL extends Apollo.Query<GetAllEvaluationPlanningsQuery, GetAllEvaluationPlanningsQueryVariables> {
    document = GetAllEvaluationPlanningsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }