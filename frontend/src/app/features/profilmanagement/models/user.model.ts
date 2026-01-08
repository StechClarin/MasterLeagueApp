export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  dateJoined: string;
  photo?: string;
  phone?: string;
  roles?: {
    id?: string;
    name: string;
  }[];
}