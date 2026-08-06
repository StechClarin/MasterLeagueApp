import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetDashboardDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDashboardDataQuery = { __typename?: 'Query', dashboardData?: { __typename?: 'DashboardType', totalStudents?: number | null, totalStaff?: number | null, totalClassrooms?: number | null, totalActiveEvaluations?: number | null, averageGrade?: number | null, totalRevenue?: number | null, totalPending?: number | null, recoveryRate?: number | null, totalTeachers?: number | null, gradeEvolution?: Array<{ __typename?: 'EvolutionPointType', label?: string | null, value?: number | null } | null> | null, studentDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, revenueEvolution?: Array<{ __typename?: 'EvolutionPointType', label?: string | null, value?: number | null } | null> | null, paymentMethodsDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, topStudents?: Array<{ __typename?: 'StudentPerformanceType', studentName?: string | null, averageGrade?: number | null, matricule?: string | null } | null> | null, studentGenderDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, recentPayments?: Array<{ __typename?: 'RecentPaymentType', id?: string | null, studentName?: string | null, amount?: number | null, paymentMethod?: string | null, paymentDate?: string | null } | null> | null, recentEnrollments?: Array<{ __typename?: 'RecentEnrollmentType', id?: string | null, studentName?: string | null, classroomName?: string | null, enrollmentDate?: string | null, status?: string | null } | null> | null, subjectGradesDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, invoiceStatusDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, staffContractDistribution?: Array<{ __typename?: 'DistributionPointType', category?: string | null, count?: number | null } | null> | null, enrollmentEvolution?: Array<{ __typename?: 'EvolutionPointType', label?: string | null, value?: number | null } | null> | null } | null };

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
    recoveryRate
    totalTeachers
    studentGenderDistribution {
      category
      count
    }
    recentPayments {
      id
      studentName
      amount
      paymentMethod
      paymentDate
    }
    recentEnrollments {
      id
      studentName
      classroomName
      enrollmentDate
      status
    }
    subjectGradesDistribution {
      category
      count
    }
    invoiceStatusDistribution {
      category
      count
    }
    staffContractDistribution {
      category
      count
    }
    enrollmentEvolution {
      label
      value
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