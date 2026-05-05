import type { AuthResponse, Todo, User } from '../types/index';

// URL de base du backend — vide = chemins relatifs → proxy Vite → backend :8000
// En production, définir VITE_API_BASE_URL=https://votre-api.com
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Lecture du token JWT depuis le localStorage
function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

// Options étendues pour le helper request — skipAuth désactive l'en-tête Authorization
interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

// Helper HTTP centralisé — gère les en-têtes, les erreurs HTTP et les erreurs réseau
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };

  // Ajout automatique du token Bearer sur les endpoints protégés
  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...rest, headers });
  } catch {
    throw new Error('Erreur réseau : impossible de contacter le serveur');
  }

  // Gestion centralisée des erreurs HTTP (statut >= 400)
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.detail;
    } catch {
      // corps non parseable — on utilise statusText
    }
    throw new Error(detail ?? response.statusText);
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Service API public — interface identique au mock précédent
// ─────────────────────────────────────────────
export const apiService = {

  // ── Authentification ──────────────────────

  async login(formData: FormData): Promise<AuthResponse> {
    // Conversion FormData → URLSearchParams pour application/x-www-form-urlencoded
    const body = new URLSearchParams();
    formData.forEach((value, key) => body.append(key, value as string));

    let data: AuthResponse;
    try {
      data = await request<AuthResponse>('/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        skipAuth: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      // Le backend retourne 401 avec "Incorrect email or password"
      if (msg.toLowerCase().includes('incorrect') || msg.includes('401')) {
        throw new Error('Email ou mot de passe incorrect');
      }
      throw err;
    }

    localStorage.setItem('token', data.access_token);
    return data;
  },

  async signup(userData: Record<string, unknown>): Promise<User> {
    let data: User;
    try {
      data = await request<User>('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
        skipAuth: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Email déjà enregistré') || msg.includes('already')) {
        throw new Error('Cet email est déjà utilisé');
      }
      throw err;
    }
    return data;
  },

  logout(): void {
    localStorage.removeItem('token');
  },

  getToken(): string | null {
    return getStoredToken();
  },

  // Synchrone — retourne null sans appel HTTP si pas de token
  getUser(): User | null {
    const token = getStoredToken();
    if (!token) return null;
    // Le profil complet est récupéré via getProfile() — ici on indique juste qu'on est connecté
    return null;
  },

  // ── Todos ─────────────────────────────────

  async getTodos(): Promise<Todo[]> {
    try {
      return await request<Todo[]>('/todos/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401') || msg.toLowerCase().includes('not authenticated') || msg.toLowerCase().includes('could not validate')) {
        localStorage.removeItem('token');
        throw new Error('Non authentifié');
      }
      throw err;
    }
  },

  async createTodo(todoData: Partial<Todo>): Promise<Todo> {
    const body: Record<string, unknown> = {
      titre: todoData.titre ?? 'Sans titre',
      description: todoData.description ?? '',
      priority: todoData.priority ?? 'MEDIUM',
      status: todoData.status ?? 'en_cours',
    };
    if (todoData.owner_id !== undefined) body.owner_id = todoData.owner_id;

    const result = await request<{ message: string; todo: Todo }>('/todos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return result.todo;
  },

  async updateTodo(id: number, todoData: Partial<Todo>): Promise<Todo> {
    let result: { message: string; todo: Todo };
    try {
      result = await request<{ message: string; todo: Todo }>(`/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: todoData.titre ?? 'Sans titre',
          description: todoData.description ?? '',
          priority: todoData.priority ?? 'MEDIUM',
          status: todoData.status ?? 'en_cours',
        }),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found') || msg.includes('non trouvée')) {
        throw new Error('Tâche non trouvée');
      }
      throw err;
    }
    return result.todo;
  },

  async deleteTodo(id: number): Promise<void> {
    try {
      await request<{ message: string }>(`/todos/${id}`, { method: 'DELETE' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found') || msg.includes('non trouvée')) {
        throw new Error('Tâche non trouvée');
      }
      throw err;
    }
  },

  // ── Profil ────────────────────────────────

  async getProfile(): Promise<User> {
    try {
      return await request<User>('/users/me');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401') || msg.toLowerCase().includes('not authenticated') || msg.toLowerCase().includes('could not validate')) {
        localStorage.removeItem('token');
        throw new Error('Non authentifié');
      }
      throw err;
    }
  },

  // ── Utilisateurs ──────────────────────

  async createUser(userData: { name: string; email: string; password: string; role?: string }): Promise<User> {
    try {
      return await request<User>('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Email déjà enregistré') || msg.includes('already')) {
        throw new Error('Cet email est déjà utilisé');
      }
      throw err;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      return await request<User[]>('/users/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401') || msg.toLowerCase().includes('not authenticated') || msg.toLowerCase().includes('could not validate')) {
        localStorage.removeItem('token');
        throw new Error('Non authentifié');
      }
      throw err;
    }
  },

  async getUserById(id: number): Promise<User> {
    try {
      return await request<User>(`/users/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401') || msg.toLowerCase().includes('not authenticated') || msg.toLowerCase().includes('could not validate')) {
        localStorage.removeItem('token');
        throw new Error('Non authentifié');
      }
      if (msg.includes('404') || msg.toLowerCase().includes('not found') || msg.includes('non trouvé')) {
        throw new Error('Utilisateur non trouvé');
      }
      throw err;
    }
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    // Sérialisation partielle — on n'envoie que les champs fournis (pas de undefined)
    const body: Record<string, unknown> = {};
    if (userData.name !== undefined) body.name = userData.name;
    if (userData.email !== undefined) body.email = userData.email;

    return request<User>('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  },
};
