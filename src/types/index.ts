export type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  tasks?: Todo[];
};

export type Priority = 'low' | 'medium' | 'high';

export type Todo = {
  id: number;
  titre: string;
  description: string;
  priority: Priority;
  owner_id: number;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};
