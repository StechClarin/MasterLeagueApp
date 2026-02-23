import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetAllPersonnelsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  establishment?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  contractType?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  role?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  roleName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  jobTitle?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllPersonnelsQuery = { __typename?: 'Query', personnels?: { __typename?: 'PersonnelTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'PersonnelType', id: string, matricule: string, jobTitle: string, emailPro?: string | null, phoneNumber?: string | null, address?: string | null, dateHired?: any | null, isActive: boolean, user?: { __typename?: 'UserType', id: string, username: string, firstName: string, lastName: string, email: string, photo?: string | null } | null, roles: Array<{ __typename?: 'RoleType', id: string, name: string }>, contractType?: { __typename?: 'ContractTypeType', id: string, designation: string, code: string } | null, establishment: { __typename?: 'EstablishmentType', id: string, name: string } } | null> | null } | null };

export type GetPersonnelQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetPersonnelQuery = { __typename?: 'Query', personnel?: { __typename?: 'PersonnelType', id: string, matricule: string, jobTitle: string, emailPro?: string | null, phoneNumber?: string | null, address?: string | null, dateHired?: any | null, isActive: boolean, user?: { __typename?: 'UserType', id: string, firstName: string, lastName: string, email: string, photo?: string | null } | null, roles: Array<{ __typename?: 'RoleType', id: string, name: string }>, establishment: { __typename?: 'EstablishmentType', id: string, name: string }, contractType?: { __typename?: 'ContractTypeType', id: string, designation: string, code: string } | null } | null };

export type GetAllContractTypesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllContractTypesQuery = { __typename?: 'Query', contractTypes?: { __typename?: 'ContractTypeTypePaginated', items?: Array<{ __typename?: 'ContractTypeType', id: string, designation: string, code: string, description?: string | null } | null> | null } | null };

export type GetContractTypeQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetContractTypeQuery = { __typename?: 'Query', contractType?: { __typename?: 'ContractTypeType', id: string, designation: string, code: string, description?: string | null } | null };

export const GetAllPersonnelsDocument = gql`
    query GetAllPersonnels($search: String, $establishment: ID, $contractType: ID, $role: ID, $roleName: String, $jobTitle: String, $page: Int, $pageSize: Int) {
  personnels(
    search: $search
    establishment: $establishment
    contractType: $contractType
    role: $role
    roleName: $roleName
    jobTitle: $jobTitle
    page: $page
    pageSize: $pageSize
  ) {
    items {
      id
      user {
        id
        username
        firstName
        lastName
        email
        photo
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
      photo
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