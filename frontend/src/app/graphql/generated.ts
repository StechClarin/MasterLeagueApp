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

export type CarType = {
  __typename?: 'CarType';
  brand: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isSold: Scalars['Boolean']['output'];
  modelName: Scalars['String']['output'];
  price: Scalars['Decimal']['output'];
  updatedAt: Scalars['DateTime']['output'];
  year: Scalars['Int']['output'];
};

export type ContactType = {
  __typename?: 'ContactType';
  adresse: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  personne: PersonneType;
  telephone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type EcolePaginatedType = {
  __typename?: 'EcolePaginatedType';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EcoleType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EcoleType = {
  __typename?: 'EcoleType';
  adresse?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  nom: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type EvenementPaginatedType = {
  __typename?: 'EvenementPaginatedType';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<EvenementType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type EvenementType = {
  __typename?: 'EvenementType';
  createdAt: Scalars['DateTime']['output'];
  dateDebut: Scalars['DateTime']['output'];
  dateFin: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  lieu: Scalars['String']['output'];
  nom: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type PersonnePaginatedType = {
  __typename?: 'PersonnePaginatedType';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<PersonneType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PersonneType = {
  __typename?: 'PersonneType';
  age: Scalars['Int']['output'];
  contacts: Array<ContactType>;
  createdAt: Scalars['DateTime']['output'];
  genre: ProfilmanagementPersonneGenreChoices;
  id: Scalars['ID']['output'];
  nationalite: Scalars['String']['output'];
  nom: Scalars['String']['output'];
  /** Poids en kg */
  poid: Scalars['Decimal']['output'];
  prenom: Scalars['String']['output'];
  /** Taille en mètres */
  taille: Scalars['Decimal']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductType = {
  __typename?: 'ProductType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** An enumeration. */
export enum ProfilmanagementPersonneGenreChoices {
  /** Féminin */
  F = 'F',
  /** Masculin */
  M = 'M',
  /** Autre */
  O = 'O'
}

export type Query = {
  __typename?: 'Query';
  car?: Maybe<CarType>;
  cars?: Maybe<Array<Maybe<CarType>>>;
  contact?: Maybe<ContactType>;
  contacts?: Maybe<Array<Maybe<ContactType>>>;
  ecole?: Maybe<EcoleType>;
  ecoles?: Maybe<EcolePaginatedType>;
  evenement?: Maybe<EvenementType>;
  evenements?: Maybe<EvenementPaginatedType>;
  modules?: Maybe<Array<Maybe<ModuleType>>>;
  permissions?: Maybe<Array<Maybe<PermissionType>>>;
  personne?: Maybe<PersonneType>;
  personnes?: Maybe<PersonnePaginatedType>;
  product?: Maybe<ProductType>;
  products?: Maybe<Array<Maybe<ProductType>>>;
  role?: Maybe<RoleType>;
  roles?: Maybe<Array<Maybe<RoleType>>>;
  user?: Maybe<UserType>;
  users?: Maybe<UserPaginatedType>;
  voiture?: Maybe<VoitureType>;
  voitures?: Maybe<VoiturePaginatedType>;
};


export type QueryCarArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCarsArgs = {
  brand?: InputMaybe<Scalars['String']['input']>;
  isSold?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryContactArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEcoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEcolesArgs = {
  nom?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEvenementArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEvenementsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPersonneArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPersonnesArgs = {
  nom?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
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


export type QueryVoitureArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVoituresArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type RoleType = {
  __typename?: 'RoleType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<PermissionType>>>;
  users: Array<UserType>;
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
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isStaff: Scalars['Boolean']['output'];
  /** Designates that this user has all permissions without explicitly assigning them. */
  isSuperuser: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  roles: Array<RoleType>;
  username: Scalars['String']['output'];
};

export type VoiturePaginatedType = {
  __typename?: 'VoiturePaginatedType';
  currentPage?: Maybe<Scalars['Int']['output']>;
  items?: Maybe<Array<Maybe<VoitureType>>>;
  numPages?: Maybe<Scalars['Int']['output']>;
  pageSize?: Maybe<Scalars['Int']['output']>;
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type VoitureType = {
  __typename?: 'VoitureType';
  couleur: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  matricule: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UserFieldsFragment = { __typename?: 'UserType', id: string, username: string, email: string, firstName: string, lastName: string, isActive: boolean, dateJoined: any, roles: Array<{ __typename?: 'RoleType', id: string, name: string }> };

export type RoleFieldsFragment = { __typename?: 'RoleType', id: string, name: string, permissions?: Array<{ __typename?: 'PermissionType', id: string, name: string, codename: string } | null> | null };

export type PermissionFieldsFragment = { __typename?: 'PermissionType', id: string, name: string, codename: string, tag: string };

export type PersonneItemFragment = { __typename?: 'PersonneType', id: string, nom: string, prenom: string, age: number, nationalite: string, genre: ProfilmanagementPersonneGenreChoices, taille: any, poid: any, createdAt: any, updatedAt: any, contacts: Array<{ __typename?: 'ContactType', id: string, telephone: string, email: string, adresse: string }> };

export type ContactItemFragment = { __typename?: 'ContactType', id: string, telephone: string, email: string, adresse: string, personne: { __typename?: 'PersonneType', id: string, nom: string, prenom: string } };

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

export type GetAllPersonnesQueryVariables = Exact<{
  nom?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllPersonnesQuery = { __typename?: 'Query', personnes?: { __typename?: 'PersonnePaginatedType', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'PersonneType', id: string, nom: string, prenom: string, age: number, nationalite: string, genre: ProfilmanagementPersonneGenreChoices, taille: any, poid: any, createdAt: any, updatedAt: any } | null> | null } | null };

export type GetPersonneByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetPersonneByIdQuery = { __typename?: 'Query', personne?: { __typename?: 'PersonneType', id: string, nom: string, prenom: string, age: number, nationalite: string, genre: ProfilmanagementPersonneGenreChoices, taille: any, poid: any, createdAt: any, updatedAt: any, contacts: Array<{ __typename?: 'ContactType', id: string, telephone: string, email: string, adresse: string }> } | null };

export type EcoleItemFragment = { __typename?: 'EcoleType', id: string, nom: string, adresse?: string | null, createdAt: any, updatedAt: any };

export type GetAllEcolesQueryVariables = Exact<{
  nom?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllEcolesQuery = { __typename?: 'Query', ecoles?: { __typename?: 'EcolePaginatedType', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EcoleType', id: string, nom: string, adresse?: string | null, createdAt: any, updatedAt: any } | null> | null } | null };

export type GetEcoleByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEcoleByIdQuery = { __typename?: 'Query', ecole?: { __typename?: 'EcoleType', id: string, nom: string, adresse?: string | null, createdAt: any, updatedAt: any } | null };

export type VoitureItemFragment = { __typename?: 'VoitureType', id: string, name: string, couleur: string, matricule: string, createdAt: any, updatedAt: any };

export type GetAllVoituresQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllVoituresQuery = { __typename?: 'Query', voitures?: { __typename?: 'VoiturePaginatedType', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'VoitureType', id: string, name: string, couleur: string, matricule: string, createdAt: any, updatedAt: any } | null> | null } | null };

export type GetVoitureByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetVoitureByIdQuery = { __typename?: 'Query', voiture?: { __typename?: 'VoitureType', id: string, name: string, couleur: string, matricule: string, createdAt: any, updatedAt: any } | null };

export type EvenementItemFragment = { __typename?: 'EvenementType', id: string, nom: string, lieu: string, dateDebut: any, dateFin: any, createdAt: any, updatedAt: any };

export type GetAllEvenementsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllEvenementsQuery = { __typename?: 'Query', evenements?: { __typename?: 'EvenementPaginatedType', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'EvenementType', id: string, nom: string, lieu: string, dateDebut: any, dateFin: any, createdAt: any, updatedAt: any } | null> | null } | null };

export type GetEvenementByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetEvenementByIdQuery = { __typename?: 'Query', evenement?: { __typename?: 'EvenementType', id: string, nom: string, lieu: string, dateDebut: any, dateFin: any, createdAt: any, updatedAt: any } | null };

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
export const PersonneItemFragmentDoc = gql`
    fragment PersonneItem on PersonneType {
  id
  nom
  prenom
  age
  nationalite
  genre
  taille
  poid
  createdAt
  updatedAt
  contacts {
    id
    telephone
    email
    adresse
  }
}
    `;
export const ContactItemFragmentDoc = gql`
    fragment ContactItem on ContactType {
  id
  telephone
  email
  adresse
  personne {
    id
    nom
    prenom
  }
}
    `;
export const EcoleItemFragmentDoc = gql`
    fragment EcoleItem on EcoleType {
  id
  nom
  adresse
  createdAt
  updatedAt
}
    `;
export const VoitureItemFragmentDoc = gql`
    fragment VoitureItem on VoitureType {
  id
  name
  couleur
  matricule
  createdAt
  updatedAt
}
    `;
export const EvenementItemFragmentDoc = gql`
    fragment EvenementItem on EvenementType {
  id
  nom
  lieu
  dateDebut
  dateFin
  createdAt
  updatedAt
}
    `;
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
export const GetAllPersonnesDocument = gql`
    query GetAllPersonnes($search: String, $page: Int, $pageSize: Int) {
  personnes(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...PersonneItem
    }
    totalCount
    numPages
    currentPage
  }
}
    ${PersonneItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetAllPersonnesGQL extends Apollo.Query<GetAllPersonnesQuery, GetAllPersonnesQueryVariables> {
  document = GetAllPersonnesDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetPersonneByIdDocument = gql`
    query GetPersonneById($id: ID!) {
  personne(id: $id) {
    ...PersonneItem
    contacts {
      id
      telephone
      email
      adresse
    }
  }
}
    ${PersonneItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetPersonneByIdGQL extends Apollo.Query<GetPersonneByIdQuery, GetPersonneByIdQueryVariables> {
  document = GetPersonneByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetAllEcolesDocument = gql`
    query GetAllEcoles($nom: String, $page: Int, $pageSize: Int) {
  ecoles(nom: $nom, page: $page, pageSize: $pageSize) {
    items {
      ...EcoleItem
    }
    totalCount
    numPages
    currentPage
  }
}
    ${EcoleItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetAllEcolesGQL extends Apollo.Query<GetAllEcolesQuery, GetAllEcolesQueryVariables> {
  document = GetAllEcolesDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetEcoleByIdDocument = gql`
    query GetEcoleById($id: ID!) {
  ecole(id: $id) {
    ...EcoleItem
  }
}
    ${EcoleItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetEcoleByIdGQL extends Apollo.Query<GetEcoleByIdQuery, GetEcoleByIdQueryVariables> {
  document = GetEcoleByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetAllVoituresDocument = gql`
    query GetAllVoitures($search: String, $page: Int, $pageSize: Int) {
  voitures(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...VoitureItem
    }
    totalCount
    numPages
    currentPage
  }
}
    ${VoitureItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetAllVoituresGQL extends Apollo.Query<GetAllVoituresQuery, GetAllVoituresQueryVariables> {
  document = GetAllVoituresDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetVoitureByIdDocument = gql`
    query GetVoitureById($id: ID!) {
  voiture(id: $id) {
    ...VoitureItem
  }
}
    ${VoitureItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetVoitureByIdGQL extends Apollo.Query<GetVoitureByIdQuery, GetVoitureByIdQueryVariables> {
  document = GetVoitureByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetAllEvenementsDocument = gql`
    query GetAllEvenements($search: String, $page: Int, $pageSize: Int) {
  evenements(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...EvenementItem
    }
    totalCount
    numPages
    currentPage
  }
}
    ${EvenementItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetAllEvenementsGQL extends Apollo.Query<GetAllEvenementsQuery, GetAllEvenementsQueryVariables> {
  document = GetAllEvenementsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetEvenementByIdDocument = gql`
    query GetEvenementById($id: ID!) {
  evenement(id: $id) {
    ...EvenementItem
  }
}
    ${EvenementItemFragmentDoc}`;

@Injectable({
  providedIn: 'root'
})
export class GetEvenementByIdGQL extends Apollo.Query<GetEvenementByIdQuery, GetEvenementByIdQueryVariables> {
  document = GetEvenementByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}