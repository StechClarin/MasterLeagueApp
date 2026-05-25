import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetAllPlanningsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  minDate?: Types.InputMaybe<Types.Scalars['Date']['input']>;
  maxDate?: Types.InputMaybe<Types.Scalars['Date']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllPlanningsQuery = { __typename?: 'Query', plannings?: { __typename?: 'PlanningTypePaginated', totalCount?: number | null, numPages?: number | null, items?: Array<{ __typename?: 'PlanningType', id: any, nom: string, dateStart?: any | null, dateEnd?: any | null, isTemplate: boolean, establishment: { __typename?: 'EstablishmentType', id: any, name: string }, details: Array<{ __typename?: 'PlanningDetailType', id: any, date: any, heureDebut: any, heureFin: any, enseignant: { __typename?: 'PersonnelType', id: any, matricule: string, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }, classe: { __typename?: 'ClassRoomType', id: any, name: string }, matiere: { __typename?: 'SubjectType', id: any, name: string }, salle?: { __typename?: 'RoomType', id: any, name: string } | null }> } | null> | null } | null };

export type GetPlanningDetailsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  classeId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  minDate?: Types.InputMaybe<Types.Scalars['Date']['input']>;
  maxDate?: Types.InputMaybe<Types.Scalars['Date']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetPlanningDetailsQuery = { __typename?: 'Query', planningDetails?: { __typename?: 'PlanningDetailTypePaginated', totalCount?: number | null, numPages?: number | null, items?: Array<{ __typename?: 'PlanningDetailType', id: any, date: any, heureDebut: any, heureFin: any, enseignant: { __typename?: 'PersonnelType', id: any, matricule: string, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }, classe: { __typename?: 'ClassRoomType', id: any, name: string }, matiere: { __typename?: 'SubjectType', id: any, name: string }, salle?: { __typename?: 'RoomType', id: any, name: string } | null } | null> | null } | null };

export type GetPlanningByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetPlanningByIdQuery = { __typename?: 'Query', planning?: { __typename?: 'PlanningType', id: any, nom: string, dateStart?: any | null, dateEnd?: any | null, isTemplate: boolean, details: Array<{ __typename?: 'PlanningDetailType', id: any, date: any, heureDebut: any, heureFin: any, enseignant: { __typename?: 'PersonnelType', id: any, matricule: string, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }, classe: { __typename?: 'ClassRoomType', id: any, name: string }, matiere: { __typename?: 'SubjectType', id: any, name: string }, salle?: { __typename?: 'RoomType', id: any, name: string } | null }> } | null };

export type GetPlanningDependenciesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetPlanningDependenciesQuery = { __typename?: 'Query', personnels?: { __typename?: 'PersonnelTypePaginated', items?: Array<{ __typename?: 'PersonnelType', id: any, matricule: string, roles: Array<{ __typename?: 'RoleType', name: string }>, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null } | null> | null } | null, subjects?: { __typename?: 'SubjectTypePaginated', items?: Array<{ __typename?: 'SubjectType', id: any, name: string } | null> | null } | null, classrooms?: { __typename?: 'ClassRoomTypePaginated', items?: Array<{ __typename?: 'ClassRoomType', id: any, name: string } | null> | null } | null, rooms?: { __typename?: 'RoomTypePaginated', items?: Array<{ __typename?: 'RoomType', id: any, name: string } | null> | null } | null, academicyears?: { __typename?: 'AcademicYearTypePaginated', items?: Array<{ __typename?: 'AcademicYearType', id: any, name: string, isActive: boolean, startDate?: any | null, cycleConfigs?: Array<{ __typename?: 'AcademicCycleConfigType', id: any, startDate?: any | null, cycle: { __typename?: 'CycleType', id: any } } | null> | null } | null> | null } | null, teachingAssignments?: { __typename?: 'TeachingAssignmentTypePaginated', items?: Array<{ __typename?: 'TeachingAssignmentType', personnel: { __typename?: 'PersonnelType', id: any }, classroom: { __typename?: 'ClassRoomType', id: any }, subject: { __typename?: 'SubjectType', id: any } } | null> | null } | null };

export type GetAllTeachingAssignmentsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllTeachingAssignmentsQuery = { __typename?: 'Query', teachingAssignments?: { __typename?: 'TeachingAssignmentTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'TeachingAssignmentType', id: any, startDate?: any | null, endDate?: any | null, hoursScheduled: number, personnel: { __typename?: 'PersonnelType', id: any, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }, classroom: { __typename?: 'ClassRoomType', id: any, name: string }, subject: { __typename?: 'SubjectType', id: any, name: string }, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } } | null> | null } | null };

export type GetTeachingAssignmentQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetTeachingAssignmentQuery = { __typename?: 'Query', teachingAssignment?: { __typename?: 'TeachingAssignmentType', id: any, startDate?: any | null, endDate?: any | null, hoursScheduled: number, personnel: { __typename?: 'PersonnelType', id: any, user?: { __typename?: 'UserType', firstName: string, lastName: string } | null }, classroom: { __typename?: 'ClassRoomType', id: any, name: string }, subject: { __typename?: 'SubjectType', id: any, name: string }, academicYear: { __typename?: 'AcademicYearType', id: any, name: string } } | null };

export const GetAllPlanningsDocument = gql`
    query GetAllPlannings($search: String, $minDate: Date, $maxDate: Date, $page: Int, $pageSize: Int) {
  plannings(
    search: $search
    minDate: $minDate
    maxDate: $maxDate
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      nom
      dateStart
      dateEnd
      isTemplate
      establishment {
        id
        name
      }
      details {
        id
        date
        heureDebut
        heureFin
        enseignant {
          id
          matricule
          user {
            firstName
            lastName
          }
        }
        classe {
          id
          name
        }
        matiere {
          id
          name
        }
        salle {
          id
          name
        }
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
  export class GetAllPlanningsGQL extends Apollo.Query<GetAllPlanningsQuery, GetAllPlanningsQueryVariables> {
    document = GetAllPlanningsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPlanningDetailsDocument = gql`
    query GetPlanningDetails($search: String, $classeId: ID, $minDate: Date, $maxDate: Date, $page: Int, $pageSize: Int) {
  planningDetails(
    search: $search
    classeId: $classeId
    minDate: $minDate
    maxDate: $maxDate
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      date
      heureDebut
      heureFin
      enseignant {
        id
        matricule
        user {
          firstName
          lastName
        }
      }
      classe {
        id
        name
      }
      matiere {
        id
        name
      }
      salle {
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
  export class GetPlanningDetailsGQL extends Apollo.Query<GetPlanningDetailsQuery, GetPlanningDetailsQueryVariables> {
    document = GetPlanningDetailsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPlanningByIdDocument = gql`
    query GetPlanningById($id: ID!) {
  planning(id: $id) {
    id
    nom
    dateStart
    dateEnd
    isTemplate
    details {
      id
      date
      heureDebut
      heureFin
      enseignant {
        id
        matricule
        user {
          firstName
          lastName
        }
      }
      classe {
        id
        name
      }
      matiere {
        id
        name
      }
      salle {
        id
        name
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetPlanningByIdGQL extends Apollo.Query<GetPlanningByIdQuery, GetPlanningByIdQueryVariables> {
    document = GetPlanningByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPlanningDependenciesDocument = gql`
    query GetPlanningDependencies {
  personnels(search: "", page: 1, pageSize: 100) {
    items {
      id
      matricule
      roles {
        name
      }
      user {
        firstName
        lastName
      }
    }
  }
  subjects(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
    }
  }
  classrooms(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
    }
  }
  rooms(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
    }
  }
  academicyears(search: "", page: 1, pageSize: 100) {
    items {
      id
      name
      isActive
      startDate: start_date
      cycleConfigs {
        id
        cycle {
          id
        }
        startDate
      }
    }
  }
  teachingAssignments(search: "", page: 1, pageSize: 1000) {
    items {
      personnel {
        id
      }
      classroom {
        id
      }
      subject {
        id
      }
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetPlanningDependenciesGQL extends Apollo.Query<GetPlanningDependenciesQuery, GetPlanningDependenciesQueryVariables> {
    document = GetPlanningDependenciesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllTeachingAssignmentsDocument = gql`
    query GetAllTeachingAssignments($search: String, $page: Int, $pageSize: Int) {
  teachingAssignments(search: $search, page: $page, pageSize: $pageSize) {
    items {
      id
      startDate
      endDate
      hoursScheduled
      personnel {
        id
        user {
          firstName
          lastName
        }
      }
      classroom {
        id
        name
      }
      subject {
        id
        name
      }
      academicYear {
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
  export class GetAllTeachingAssignmentsGQL extends Apollo.Query<GetAllTeachingAssignmentsQuery, GetAllTeachingAssignmentsQueryVariables> {
    document = GetAllTeachingAssignmentsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetTeachingAssignmentDocument = gql`
    query GetTeachingAssignment($id: ID!) {
  teachingAssignment(id: $id) {
    id
    startDate
    endDate
    hoursScheduled
    personnel {
      id
      user {
        firstName
        lastName
      }
    }
    classroom {
      id
      name
    }
    subject {
      id
      name
    }
    academicYear {
      id
      name
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetTeachingAssignmentGQL extends Apollo.Query<GetTeachingAssignmentQuery, GetTeachingAssignmentQueryVariables> {
    document = GetTeachingAssignmentDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }