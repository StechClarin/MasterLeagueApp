import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type UserFieldsFragment = { __typename?: 'UserType', id: any, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, photo?: string | null, phone?: string | null, roles?: Array<{ __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, codename: string } | null> | null } | null> | null };

export type RoleFieldsFragment = { __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, name: string, codename: string } | null> | null };

export type PermissionFieldsFragment = { __typename?: 'PermissionType', id: any, name: string, codename: string, tag: string };

export type GetAllUsersQueryVariables = Types.Exact<{
  username?: Types.InputMaybe<Types.Scalars['String']['input']>;
  email?: Types.InputMaybe<Types.Scalars['String']['input']>;
  role?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isActive?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllUsersQuery = { __typename?: 'Query', users?: { __typename?: 'UserTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'UserType', id: any, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, photo?: string | null, phone?: string | null, roles?: Array<{ __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, codename: string } | null> | null } | null> | null } | null> | null } | null };

export type GetUserByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', user?: { __typename?: 'UserType', id: any, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, photo?: string | null, phone?: string | null, roles?: Array<{ __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, codename: string } | null> | null } | null> | null } | null };

export type GetAllRolesQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllRolesQuery = { __typename?: 'Query', roles?: { __typename?: 'RoleTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, name: string, codename: string } | null> | null } | null> | null } | null };

export type GetRoleByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetRoleByIdQuery = { __typename?: 'Query', role?: { __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, name: string, codename: string } | null> | null } | null };

export type GetAllPermissionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllPermissionsQuery = { __typename?: 'Query', permissions?: Array<{ __typename?: 'PermissionType', id: any, name: string, codename: string, tag: string } | null> | null };

export type GetMeQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetMeQuery = { __typename?: 'Query', me?: { __typename?: 'UserType', id: any, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, photo?: string | null, phone?: string | null, roles?: Array<{ __typename?: 'RoleType', id: any, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: any, codename: string } | null> | null } | null> | null } | null };

export type EstablishmentFieldsFragment = { __typename?: 'EstablishmentType', id: any, name: string, phone?: string | null, email?: string | null, address?: string | null, logo?: string | null, isActive: boolean, slogan?: string | null, website?: string | null, taxId?: string | null, city?: string | null, country?: string | null, printHeader?: string | null, printFooter?: string | null, user?: { __typename?: 'UserType', id: any, username: string } | null };

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

export const UserFieldsFragmentDoc = gql`
    fragment UserFields on UserType {
  id
  username
  email
  firstName
  lastName
  isActive
  dateJoined
  photo
  phone
  roles {
    id
    name
    permissions {
      id
      codename
    }
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
  user {
    id
    username
  }
}
    `;
export const GetAllUsersDocument = gql`
    query GetAllUsers($username: String, $email: String, $role: String, $isActive: Boolean, $page: Int, $pageSize: Int) {
  users(
    username: $username
    email: $email
    role: $role
    isActive: $isActive
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
export const GetMeDocument = gql`
    query GetMe {
  me {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetMeGQL extends Apollo.Query<GetMeQuery, GetMeQueryVariables> {
    document = GetMeDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
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