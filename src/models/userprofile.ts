export interface UserProfile {
  id: string;
  displayName?: string;
  fname?: string;
  lname?: string;
  phone?: string;
  photoUrl?: string,
  email?: string;
  terms?: boolean;
  facilitator?: boolean;
  specialist?: boolean;
  coordinator?: boolean;
  updatedAt?: number;
  createdAt?: number;
}
