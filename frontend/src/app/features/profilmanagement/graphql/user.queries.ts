import { gql } from 'apollo-angular';

export const GET_ALL_USERS = gql`
  # Le nom "GetAllUsers" sera utilisé dans l'URL !
  query users($username: String, $email: String, $role: String, $page: Int, $pageSize: Int) {
    users(username: $username, email: $email, role: $role, page: $page, pageSize: $pageSize) {
      items {
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
      totalCount
      numPages
      currentPage
      pageSize
    }
  }
`;
export const GET_ALL_ROLES = gql`
  query roles {
    roles {
      id
      name
      permissions {
        id
      }
    }
  }
`;