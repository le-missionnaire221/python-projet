export type User = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  tasks?: Todo[];
};

export type Status = 'en_cours' | 'a_tester' | 'approuve';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Todo = {
  id: number;
  titre: string;
  description: string;
  priority: Priority;
  status: Status;
  owner_id: number;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};
