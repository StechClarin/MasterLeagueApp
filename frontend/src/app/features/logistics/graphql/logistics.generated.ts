import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type AssetFieldsFragment = { __typename?: 'AssetType', id: any, name: string, serialNumber?: string | null, category: Types.LogisticsAssetCategoryChoices, status: Types.LogisticsAssetStatusChoices, purchaseDate?: any | null, deploymentDate?: any | null, maintenanceFrequency: number, notificationThresholdDays: number, nextMaintenanceDate?: any | null, cost: any, isActive: boolean, createdAt?: any | null, updatedAt?: any | null, room?: { __typename?: 'RoomType', id: any, name: string, roomType: Types.StructureRoomRoomTypeChoices } | null };

export type StockItemFieldsFragment = { __typename?: 'StockItemType', id: any, name: string, quantity: number, minThreshold: number, cost: any, isActive: boolean, createdAt?: any | null, updatedAt?: any | null };

export type GetAllAssetsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllAssetsQuery = { __typename?: 'Query', assets?: { __typename?: 'AssetTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'AssetType', id: any, name: string, serialNumber?: string | null, category: Types.LogisticsAssetCategoryChoices, status: Types.LogisticsAssetStatusChoices, purchaseDate?: any | null, deploymentDate?: any | null, maintenanceFrequency: number, notificationThresholdDays: number, nextMaintenanceDate?: any | null, cost: any, isActive: boolean, createdAt?: any | null, updatedAt?: any | null, room?: { __typename?: 'RoomType', id: any, name: string, roomType: Types.StructureRoomRoomTypeChoices } | null } | null> | null } | null };

export type GetAssetByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetAssetByIdQuery = { __typename?: 'Query', asset?: { __typename?: 'AssetType', id: any, name: string, serialNumber?: string | null, category: Types.LogisticsAssetCategoryChoices, status: Types.LogisticsAssetStatusChoices, purchaseDate?: any | null, deploymentDate?: any | null, maintenanceFrequency: number, notificationThresholdDays: number, nextMaintenanceDate?: any | null, cost: any, isActive: boolean, createdAt?: any | null, updatedAt?: any | null, room?: { __typename?: 'RoomType', id: any, name: string, roomType: Types.StructureRoomRoomTypeChoices } | null } | null };

export type GetAllStockItemsQueryVariables = Types.Exact<{
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  page?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  pageSize?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type GetAllStockItemsQuery = { __typename?: 'Query', stockItems?: { __typename?: 'StockItemTypePaginated', totalCount?: number | null, numPages?: number | null, currentPage?: number | null, items?: Array<{ __typename?: 'StockItemType', id: any, name: string, quantity: number, minThreshold: number, cost: any, isActive: boolean, createdAt?: any | null, updatedAt?: any | null } | null> | null } | null };

export type GetStockItemByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type GetStockItemByIdQuery = { __typename?: 'Query', stockItem?: { __typename?: 'StockItemType', id: any, name: string, quantity: number, minThreshold: number, cost: any, isActive: boolean, createdAt?: any | null, updatedAt?: any | null } | null };

export const AssetFieldsFragmentDoc = gql`
    fragment AssetFields on AssetType {
  id
  name
  serialNumber
  category
  status
  purchaseDate
  deploymentDate
  maintenanceFrequency
  notificationThresholdDays
  nextMaintenanceDate
  cost
  room {
    id
    name
    roomType
  }
  isActive
  createdAt
  updatedAt
}
    `;
export const StockItemFieldsFragmentDoc = gql`
    fragment StockItemFields on StockItemType {
  id
  name
  quantity
  minThreshold
  cost
  isActive
  createdAt
  updatedAt
}
    `;
export const GetAllAssetsDocument = gql`
    query GetAllAssets($search: String, $page: Int, $pageSize: Int) {
  assets(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...AssetFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${AssetFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllAssetsGQL extends Apollo.Query<GetAllAssetsQuery, GetAllAssetsQueryVariables> {
    document = GetAllAssetsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAssetByIdDocument = gql`
    query GetAssetById($id: ID!) {
  asset(id: $id) {
    ...AssetFields
  }
}
    ${AssetFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAssetByIdGQL extends Apollo.Query<GetAssetByIdQuery, GetAssetByIdQueryVariables> {
    document = GetAssetByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetAllStockItemsDocument = gql`
    query GetAllStockItems($search: String, $page: Int, $pageSize: Int) {
  stockItems(search: $search, page: $page, pageSize: $pageSize) {
    items {
      ...StockItemFields
    }
    totalCount
    numPages
    currentPage
  }
}
    ${StockItemFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetAllStockItemsGQL extends Apollo.Query<GetAllStockItemsQuery, GetAllStockItemsQueryVariables> {
    document = GetAllStockItemsDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }
export const GetStockItemByIdDocument = gql`
    query GetStockItemById($id: ID!) {
  stockItem(id: $id) {
    ...StockItemFields
  }
}
    ${StockItemFieldsFragmentDoc}`;

  @Injectable({
    providedIn: 'root'
  })
  export class GetStockItemByIdGQL extends Apollo.Query<GetStockItemByIdQuery, GetStockItemByIdQueryVariables> {
    document = GetStockItemByIdDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }