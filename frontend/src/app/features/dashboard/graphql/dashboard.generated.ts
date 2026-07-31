import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetDashboardDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDashboardDataQuery = { __typename?: 'Query', dashboardData: { __typename?: 'DashboardDataType', totalStudents: number, totalStaff: number, totalClassrooms: number, totalActiveEvaluations: number, averageGrade: number, totalRevenue: number, totalPending: number, gradeEvolution: Array<{ __typename?: 'ChartDataItem', label: string, value: number }>, studentDistribution: Array<{ __typename?: 'CategoryCountItem', category: string, count: number }>, revenueEvolution: Array<{ __typename?: 'ChartDataItem', label: string, value: number }>, paymentMethodsDistribution: Array<{ __typename?: 'CategoryCountItem', category: string, count: number }>, topStudents: Array<{ __typename?: 'TopStudentItem', studentName: string, averageGrade: number, matricule: string }> } };

export const GetDashboardDataDocument = gql`
    query GetDashboardData {
  dashboardData {
    totalStudents
    totalStaff
    totalClassrooms
    totalActiveEvaluations
    averageGrade
    totalRevenue
    totalPending
    gradeEvolution {
      label
      value
    }
    studentDistribution {
      category
      count
    }
    revenueEvolution {
      label
      value
    }
    paymentMethodsDistribution {
      category
      count
    }
    topStudents {
      studentName
      averageGrade
      matricule
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetDashboardDataGQL extends Apollo.Query<GetDashboardDataQuery, GetDashboardDataQueryVariables> {
    document = GetDashboardDataDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }