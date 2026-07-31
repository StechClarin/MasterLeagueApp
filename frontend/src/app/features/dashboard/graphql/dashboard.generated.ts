import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetDashboardDataQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetDashboardDataQuery = { __typename?: 'Query', dashboardData: { __typename?: 'DashboardDataType', activeTaxis: number, totalTaxis: number, rentalRate: number, totalRevenue: number, storeOrders: number, pendingMaintenance: number, totalVehicles: number, vehiclesToRent: number, vehiclesRented: number, providerVehicles: number, companyTaxis: number, totalDrivers: number, brokenVehicles: number, activeVehicles: number, revenueEvolution: Array<{ __typename?: 'ChartDataItem', label: string, value: number }>, fleetStatusDistribution: Array<{ __typename?: 'CategoryCountItem', category: string, count: number }>, serviceRevenueDistribution: Array<{ __typename?: 'CategoryCountItem', category: string, count: number }>, topPerformers: Array<{ __typename?: 'TopPerformerItem', driverName: string, tripsCount: number, revenue: number, vehiclePlate: string }> } };

export const GetDashboardDataDocument = gql`
    query GetDashboardData {
  dashboardData {
    activeTaxis
    totalTaxis
    rentalRate
    totalRevenue
    storeOrders
    pendingMaintenance
    totalVehicles
    vehiclesToRent
    vehiclesRented
    providerVehicles
    companyTaxis
    totalDrivers
    brokenVehicles
    activeVehicles
    revenueEvolution {
      label
      value
    }
    fleetStatusDistribution {
      category
      count
    }
    serviceRevenueDistribution {
      category
      count
    }
    topPerformers {
      driverName
      tripsCount
      revenue
      vehiclePlate
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