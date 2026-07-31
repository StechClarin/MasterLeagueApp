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
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type CategoryCountItem = {
  __typename?: 'CategoryCountItem';
  category: Scalars['String']['output'];
  count: Scalars['Int']['output'];
};

export type ChartDataItem = {
  __typename?: 'ChartDataItem';
  label: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type DashboardDataType = {
  __typename?: 'DashboardDataType';
  activeTaxis: Scalars['Int']['output'];
  fleetStatusDistribution: Array<CategoryCountItem>;
  pendingMaintenance: Scalars['Int']['output'];
  rentalRate: Scalars['Float']['output'];
  revenueEvolution: Array<ChartDataItem>;
  serviceRevenueDistribution: Array<CategoryCountItem>;
  storeOrders: Scalars['Int']['output'];
  topPerformers: Array<TopPerformerItem>;
  totalRevenue: Scalars['Float']['output'];
  totalTaxis: Scalars['Int']['output'];
};

export type DocumentType = {
  __typename?: 'DocumentType';
  documentType: Scalars['String']['output'];
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  objectId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  uploadedAt: Scalars['DateTime']['output'];
};

export type EstablishmentMembershipType = {
  __typename?: 'EstablishmentMembershipType';
  id: Scalars['ID']['output'];
  isOwner: Scalars['Boolean']['output'];
  status: Scalars['String']['output'];
};

export type EstablishmentMembershipTypePaginatedType = {
  __typename?: 'EstablishmentMembershipTypePaginatedType';
  currentPage: Scalars['Int']['output'];
  items: Array<EstablishmentMembershipType>;
  numPages: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type EstablishmentType = {
  __typename?: 'EstablishmentType';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  printFooter?: Maybe<Scalars['String']['output']>;
  printHeader?: Maybe<Scalars['String']['output']>;
  slogan?: Maybe<Scalars['String']['output']>;
  taxId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UserType>;
  website?: Maybe<Scalars['String']['output']>;
};

export type EstablishmentTypePaginatedType = {
  __typename?: 'EstablishmentTypePaginatedType';
  currentPage: Scalars['Int']['output'];
  items: Array<EstablishmentType>;
  numPages: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type ModuleType = {
  __typename?: 'ModuleType';
  code: Scalars['String']['output'];
  displayMod: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  pages: Array<PageType>;
};

export type PageType = {
  __typename?: 'PageType';
  icon: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  link: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  permissionTags: Scalars['JSON']['output'];
  title: Scalars['String']['output'];
};

export type PermissionType = {
  __typename?: 'PermissionType';
  codename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  tag: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  dashboardData: DashboardDataType;
  documentsByEntity: Array<DocumentType>;
  establishment?: Maybe<EstablishmentType>;
  establishments?: Maybe<EstablishmentTypePaginatedType>;
  me?: Maybe<UserType>;
  membership?: Maybe<EstablishmentMembershipType>;
  memberships?: Maybe<EstablishmentMembershipTypePaginatedType>;
  modules: Array<ModuleType>;
  permissions: Array<PermissionType>;
  role?: Maybe<RoleType>;
  roles: RoleTypePaginatedType;
  user?: Maybe<UserType>;
  users: UserTypePaginatedType;
};


export type QueryDocumentsByEntityArgs = {
  appLabel: Scalars['String']['input'];
  modelName: Scalars['String']['input'];
  objectId: Scalars['ID']['input'];
};


export type QueryEstablishmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEstablishmentsArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryMembershipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMembershipsArgs = {
  establishmentId?: InputMaybe<Scalars['ID']['input']>;
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type RoleType = {
  __typename?: 'RoleType';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<PermissionType>;
};

export type RoleTypePaginatedType = {
  __typename?: 'RoleTypePaginatedType';
  currentPage: Scalars['Int']['output'];
  items: Array<RoleType>;
  numPages: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type TopPerformerItem = {
  __typename?: 'TopPerformerItem';
  driverName: Scalars['String']['output'];
  revenue: Scalars['Float']['output'];
  tripsCount: Scalars['Int']['output'];
  vehiclePlate: Scalars['String']['output'];
};

export type UserType = {
  __typename?: 'UserType';
  dateJoined: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  roles: Array<RoleType>;
  username: Scalars['String']['output'];
};

export type UserTypePaginatedType = {
  __typename?: 'UserTypePaginatedType';
  currentPage: Scalars['Int']['output'];
  items: Array<UserType>;
  numPages: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};
