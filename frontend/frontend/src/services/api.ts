import type { AuthResponse, Todo, User } from '../types/index';

const API_BASE = '/api'; // Grace au proxy Vite

export const apiService = {
  // Auth
  async login(formData: FormData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Connexion échouée');
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    return data;
  },

  async signup(userData: any): Promise<User> {
    const response = await fetch(`${API_BASE}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Inscription échouée');
    return response.json();
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  // Todos
  async getTodos(): Promise<Todo[]> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/todos/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Impossible de charger les tâches');
    return response.json();
  },

  async createTodo(todoData: Partial<Todo>): Promise<Todo> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/todos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API Création:', errorData);
      throw new Error('Échec de la création');
    }
    const data = await response.json();
    return data.todo; // Le backend renvoie {message, todo}
  },

  async updateTodo(id: number, todoData: Partial<Todo>): Promise<Todo> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) throw new Error('Échec de la mise à jour');
    const data = await response.json();
    return data.todo;
  },

  async deleteTodo(id: number): Promise<void> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Échec de la suppression');
  },

  // Profile
  async getProfile(): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Impossible de charger le profil');
    return response.json();
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Échec de la mise à jour du profil');
    return response.json();
  }
};
