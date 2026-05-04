import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetDashboardDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDashboardDataQuery = { __typename?: 'Query', dashboardData?: { __typename?: 'DashboardType', totalStudents?: number | null, totalStaff?: number | null, totalClassrooms?: number | null, totalActiveEvaluations?: number | null, averageGrade?: number | null, totalRevenue?: number | null, totalPending?: number | null, gradeEvolution?: Array<{ __typename?: 'EvolutionPointType', label?: string | null, value?: number | null } | null> | null, studentDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, revenueEvolution?: Array<{ __typename?: 'EvolutionPointType', label?: string | null, value?: number | null } | null> | null, paymentMethodsDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, topStudents?: Array<{ __typename?: 'StudentPerformanceType', studentName?: string | null, averageGrade?: number | null, matricule?: string | null } | null> | null } | null };

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