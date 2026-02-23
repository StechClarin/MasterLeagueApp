import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetAllStudentsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  classroomId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  parentPhone?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllStudentsQuery = { __typename?: 'Query', students?: { __typename?: 'StudentTypePaginated', totalCount?: number | null, numPages?: number | null, items?: Array<{ __typename?: 'StudentType', id: string, matricule: string, firstName: string, lastName: string, gender: Types.StudentsStudentGenderChoices, photo?: string | null, dateOfBirth?: any | null, placeOfBirth?: string | null, address?: string | null, enrollments: Array<{ __typename?: 'EnrollmentType', id: string, status: Types.StudentsEnrollmentStatusChoices, isRepeater: boolean, classroom: { __typename?: 'ClassRoomType', id: string, name: string, level: { __typename?: 'LevelType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } }>, health?: { __typename?: 'StudentHealthType', id: string, bloodGroup?: Types.StudentsStudentHealthBloodGroupChoices | null, allergies?: string | null, medicalConditions?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null } | null, guardians: Array<{ __typename?: 'GuardianType', id: string, firstName?: string | null, lastName?: string | null, phoneNumber: string, profession?: string | null, user?: { __typename?: 'UserType', firstName: string, lastName: string, email: string } | null }> } | null> | null } | null };

export type GetStudentQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetStudentQuery = { __typename?: 'Query', student?: { __typename?: 'StudentType', id: string, matricule: string, firstName: string, lastName: string, gender: Types.StudentsStudentGenderChoices, photo?: string | null, dateOfBirth?: any | null, placeOfBirth?: string | null, address?: string | null, health?: { __typename?: 'StudentHealthType', id: string, bloodGroup?: Types.StudentsStudentHealthBloodGroupChoices | null, allergies?: string | null, medicalConditions?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null } | null, enrollments: Array<{ __typename?: 'EnrollmentType', id: string, status: Types.StudentsEnrollmentStatusChoices, classroom: { __typename?: 'ClassRoomType', id: string, name: string, level: { __typename?: 'LevelType', id: string, name: string } }, academicYear: { __typename?: 'AcademicYearType', id: string, name: string } }>, guardians: Array<{ __typename?: 'GuardianType', id: string, phoneNumber: string, profession?: string | null, user?: { __typename?: 'UserType', firstName: string, lastName: string, email: string } | null }>, siblings?: Array<{ __typename?: 'StudentType', id: string, matricule: string, firstName: string, lastName: string, gender: Types.StudentsStudentGenderChoices, photo?: string | null, dateOfBirth?: any | null } | null> | null } | null };

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