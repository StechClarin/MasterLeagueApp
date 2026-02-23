import * as Types from '../../../graphql/types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type GetDocumentsByEntityQueryVariables = Types.Exact<{
  appLabel: Types.Scalars['String']['input'];
  modelName: Types.Scalars['String']['input'];
  objectId: Types.Scalars['ID']['input'];
}>;


export type GetDocumentsByEntityQuery = { __typename?: 'Query', documentsByEntity?: Array<{ __typename?: 'DocumentType', id: string, title: string, fileUrl?: string | null, documentType: Types.DocumentsDocumentDocumentTypeChoices, uploadedAt: any } | null> | null };

export const GetDocumentsByEntityDocument = gql`
    query GetDocumentsByEntity($appLabel: String!, $modelName: String!, $objectId: ID!) {
  documentsByEntity(
    appLabel: $appLabel
    modelName: $modelName
    objectId: $objectId
  ) {
    id
    title
    fileUrl
    documentType
    uploadedAt
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class GetDocumentsByEntityGQL extends Apollo.Query<GetDocumentsByEntityQuery, GetDocumentsByEntityQueryVariables> {
    document = GetDocumentsByEntityDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }