import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type FeeDefinitionFieldsFragment = { __typename?: 'FeeDefinitionType', id: any, name: string, category: Types.FinanceFeeDefinitionCategoryChoices, amount: any, isActive: boolean, paymentModality: Types.FinanceFeeDefinitionPaymentModalityChoices, installmentCount: number, installmentPeriod?: Types.FinanceFeeDefinitionInstallmentPeriodChoices | null, level: { __typename?: 'LevelType', id: any, name: string }, academicYear: { __typename?: 'AcademicYearType', id: any, name: string }, students: Array<{ __typename?: 'StudentType', id: any, firstName: string, lastName: string, matricule: string }>, option?: { __typename?: 'OptionType', id: any, name: string } | null, classroom?: { __typename?: 'ClassRoomType', id: any, name: string } | null };

export type InvoiceFieldsFragment = { __typename?: 'InvoiceType', id: any, title: string, totalAmount: any, paidAmount: any, remainingAmount?: any | null, dueDate?: any | null, status: Types.FinanceInvoiceStatusChoices, category: Types.FinanceInvoiceCategoryChoices, reference?: string | null, student: { __typename?: 'StudentType', id: any, firstName: string, lastName: string, matricule: string }, enrollment?: { __typename?: 'EnrollmentType', classroom: { __typename?: 'ClassRoomType', name: string } } | null };

export type PaymentFieldsFragment = { __typename?: 'PaymentType', id: any, amount: any, paymentDate: any, paymentMethod: Types.FinancePaymentPaymentMethodChoices, reference: string, note: string, invoice: { __typename?: 'InvoiceType', id: any, title: string, reference?: string | null, enrollment?: { __typename?: 'EnrollmentType', classroom: { __typename?: 'ClassRoomType', name: string } } | null, student: { __typename?: 'StudentType', firstName: string, lastName: string, matricule: string } } };

export type GetFeeDefinitionsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  levelId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetFeeDefinitionsQuery = { __typename?: 'Query', feeDefinitions?: { __typename?: 'FeeDefinitionTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, pageSize?: number | null, items?: Array<{ __typename?: 'FeeDefinitionType', id: any, name: string, category: Types.FinanceFeeDefinitionCategoryChoices, amount: any, isActive: boolean, paymentModality: Types.FinanceFeeDefinitionPaymentModalityChoices, installmentCount: number, installmentPeriod?: Types.FinanceFeeDefinitionInstallmentPeriodChoices | null, level: { __typename?: 'LevelType', id: any, name: string }, academicYear: { __typename?: 'AcademicYearType', id: any, name: string }, students: Array<{ __typename?: 'StudentType', id: any, firstName: string, lastName: string, matricule: string }>, option?: { __typename?: 'OptionType', id: any, name: string } | null, classroom?: { __typename?: 'ClassRoomType', id: any, name: string } | null } | null> | null } | null };

export type GetInvoicesQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  studentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  status?: Types.InputMaybe<Types.Scalars['String']['input']>;
  category?: Types.InputMaybe<Types.Scalars['String']['input']>;
  classroomId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetInvoicesQuery = { __typename?: 'Query', invoices?: { __typename?: 'InvoiceTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, pageSize?: number | null, items?: Array<{ __typename?: 'InvoiceType', id: any, title: string, totalAmount: any, paidAmount: any, remainingAmount?: any | null, dueDate?: any | null, status: Types.FinanceInvoiceStatusChoices, category: Types.FinanceInvoiceCategoryChoices, reference?: string | null, student: { __typename?: 'StudentType', id: any, firstName: string, lastName: string, matricule: string }, enrollment?: { __typename?: 'EnrollmentType', classroom: { __typename?: 'ClassRoomType', name: string } } | null } | null> | null } | null };

export type GetPaymentsQueryVariables = Types.Exact<{
  invoiceId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetPaymentsQuery = { __typename?: 'Query', payments?: { __typename?: 'PaymentTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, pageSize?: number | null, items?: Array<{ __typename?: 'PaymentType', id: any, amount: any, paymentDate: any, paymentMethod: Types.FinancePaymentPaymentMethodChoices, reference: string, note: string, invoice: { __typename?: 'InvoiceType', id: any, title: string, reference?: string | null, enrollment?: { __typename?: 'EnrollmentType', classroom: { __typename?: 'ClassRoomType', name: string } } | null, student: { __typename?: 'StudentType', firstName: string, lastName: string, matricule: string } } } | null> | null } | null };

export type GetUsedFeeCategoriesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetUsedFeeCategoriesQuery = { __typename?: 'Query', usedFeeCategories?: Array<any | null> | null };

export const FeeDefinitionFieldsFragmentDoc = gql`
    fragment FeeDefinitionFields on FeeDefinitionType {
  id
  name
  category
  amount
  isActive
  level {
    id
    name
  }
  academicYear {
    id
    name
  }
  paymentModality
  installmentCount
  installmentPeriod
  students {
    id
    firstName
    lastName
    matricule
  }
  option {
    id
    name
  }
  classroom {
    id
    name
  }
}
    `;
export const InvoiceFieldsFragmentDoc = gql`
    fragment InvoiceFields on InvoiceType {
  id
  title
  totalAmount
  paidAmount
  remainingAmount
  dueDate
  status
  category
  student {
    id
    firstName
    lastName
    matricule
  }
  reference
  enrollment {
    classroom {
      name
    }
  }
}
    `;
export const PaymentFieldsFragmentDoc = gql`
    fragment PaymentFields on PaymentType {
  id
  amount
  paymentDate
  paymentMethod
  reference
  note
  invoice {
    id
    title
    reference
    enrollment {
      classroom {
        name
      }
    }
    student {
      firstName
      lastName
      matricule
    }
  }
}
    `;
export const GetFeeDefinitionsDocument = gql`
    query GetFeeDefinitions($search: String, $levelId: ID, $page: Int, $pageSize: Int) {
  feeDefinitions(
    search: $search
    levelId: $levelId
    page: $page
    pageSize: $pageSize
  ) {
    totalCount
    numPages
    currentPage
    pageSize
    items {
      ...FeeDefinitionFields
    }
  }
}
    ${FeeDefinitionFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetFeeDefinitionsGQL extends Apollo.Query<GetFeeDefinitionsQuery, GetFeeDefinitionsQueryVariables> {
    document = GetFeeDefinitionsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetInvoicesDocument = gql`
    query GetInvoices($search: String, $studentId: ID, $status: String, $category: String, $classroomId: ID, $page: Int, $pageSize: Int) {
  invoices(
    search: $search
    studentId: $studentId
    status: $status
    category: $category
    classroomId: $classroomId
    page: $page
    pageSize: $pageSize
  ) {
    totalCount
    numPages
    currentPage
    pageSize
    items {
      ...InvoiceFields
    }
  }
}
    ${InvoiceFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetInvoicesGQL extends Apollo.Query<GetInvoicesQuery, GetInvoicesQueryVariables> {
    document = GetInvoicesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetPaymentsDocument = gql`
    query GetPayments($invoiceId: ID, $page: Int, $pageSize: Int) {
  payments(invoiceId: $invoiceId, page: $page, pageSize: $pageSize) {
    totalCount
    numPages
    currentPage
    pageSize
    items {
      ...PaymentFields
    }
  }
}
    ${PaymentFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetPaymentsGQL extends Apollo.Query<GetPaymentsQuery, GetPaymentsQueryVariables> {
    document = GetPaymentsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetUsedFeeCategoriesDocument = gql`
    query GetUsedFeeCategories {
  usedFeeCategories
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetUsedFeeCategoriesGQL extends Apollo.Query<GetUsedFeeCategoriesQuery, GetUsedFeeCategoriesQueryVariables> {
    document = GetUsedFeeCategoriesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }