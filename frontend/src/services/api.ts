import type { AuthResponse, Todo, User } from '../types/index';

// Simulation d'un délai réseau pour plus de réalisme
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper pour gérer le localStorage
const storage = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem('mock_users') || '[]'),
  setUsers: (users: User[]) => localStorage.setItem('mock_users', JSON.stringify(users)),
  getTodos: (): Todo[] => JSON.parse(localStorage.getItem('mock_todos') || '[]'),
  setTodos: (todos: Todo[]) => localStorage.setItem('mock_todos', JSON.stringify(todos)),
  getCurrentUserId: (): number | null => {
    const token = localStorage.getItem('token');
    return token ? parseInt(token) : null;
  }
};

// Initialisation de données par défaut si vide
if (storage.getUsers().length === 0) {
  const defaultUser: User = {
    id: 1,
    name: 'Gallo Sall',
    email: 'gallo.sall@example.com',
    role: 'admin',
    is_active: true
  };
  storage.setUsers([defaultUser]);
  
  const defaultTodos: Todo[] = [
    { id: 101, titre: 'Finaliser le design Soft UI', description: 'Appliquer les styles magenta et les ombres douces.', priority: 'high', owner_id: 1 },
    { id: 102, titre: 'Mocking de l\'API', description: 'Terminer la transition vers localStorage.', priority: 'medium', owner_id: 1 },
    { id: 103, titre: 'Vérifier la responsivité', description: 'Tester sur mobile et tablette.', priority: 'low', owner_id: 1 }
  ];
  storage.setTodos(defaultTodos);
}

export const apiService = {
  // Auth
  async login(formData: FormData): Promise<AuthResponse> {
    await delay(800);
    const email = formData.get('username') as string; // Dans le formulaire original c'est souvent 'username' pour OAuth2
    const users = storage.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) throw new Error('Utilisateur non trouvé');
    
    localStorage.setItem('token', user.id.toString());
    return {
      access_token: user.id.toString(),
      token_type: 'bearer'
    };
  },

  async signup(userData: Record<string, any>): Promise<User> {
    await delay(1000);
    const users = storage.getUsers();
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    const newUser: User = {
      id: Date.now(),
      name: userData.name || userData.username,
      email: userData.email,
      role: 'user',
      is_active: true
    };

    storage.setUsers([...users, newUser]);
    return newUser;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const userId = storage.getCurrentUserId();
    if (!userId) return null;
    return storage.getUsers().find(u => u.id === userId) || null;
  },

  // Todos
  async getTodos(): Promise<Todo[]> {
    await delay(500);
    const currentUserId = storage.getCurrentUserId();
    if (!currentUserId) throw new Error('Non authentifié');
    
    const allTodos = storage.getTodos();
    return allTodos.filter(t => t.owner_id === currentUserId);
  },

  async createTodo(todoData: Partial<Todo>): Promise<Todo> {
    await delay(600);
    const currentUserId = storage.getCurrentUserId();
    if (!currentUserId) throw new Error('Non authentifié');
    
    const allTodos = storage.getTodos();
    const newTodo: Todo = {
      id: Date.now(),
      titre: todoData.titre || 'Sans titre',
      description: todoData.description || '',
      priority: todoData.priority || 'medium',
      owner_id: currentUserId
    };

    storage.setTodos([...allTodos, newTodo]);
    return newTodo;
  },

  async updateTodo(id: number, todoData: Partial<Todo>): Promise<Todo> {
    await delay(500);
    const allTodos = storage.getTodos();
    const index = allTodos.findIndex(t => t.id === id);
    
    if (index === -1) throw new Error('Tâche non trouvée');
    
    const updatedTodo = { ...allTodos[index], ...todoData };
    allTodos[index] = updatedTodo;
    
    storage.setTodos([...allTodos]);
    return updatedTodo;
  },

  async deleteTodo(id: number): Promise<void> {
    await delay(400);
    const allTodos = storage.getTodos();
    storage.setTodos(allTodos.filter(t => t.id !== id));
  },

  // Profile
  async getProfile(): Promise<User> {
    await delay(500);
    const currentUserId = storage.getCurrentUserId();
    if (!currentUserId) throw new Error('Non authentifié');
    
    const users = storage.getUsers();
    const user = users.find(u => u.id === currentUserId);
    
    if (!user) {
      this.logout();
      throw new Error('Utilisateur non trouvé');
    }
    
    // On attache les tâches au profil pour les stats
    const allTodos = storage.getTodos();
    return {
      ...user,
      tasks: allTodos.filter(t => t.owner_id === currentUserId)
    };
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    await delay(800);
    const currentUserId = storage.getCurrentUserId();
    if (!currentUserId) throw new Error('Non authentifié');
    
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === currentUserId);
    
    if (index === -1) throw new Error('Utilisateur non trouvé');
    
    const updatedUser = { ...users[index], ...userData };
    users[index] = updatedUser;
    
    storage.setUsers([...users]);
    return updatedUser;
  }
};
