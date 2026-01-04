export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'User';
  avatarUrl?: string;
  location?: string;
  bio?: string;
  phone?: string;
}

export interface Entity {
  id: string;
  name: string;
  status: 'Active' | 'In Progress' | 'Draft';
  lastUpdated: string; // ISO string
  assignee: string;
  assigneeAvatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (user: User) => Promise<void>;
}

export interface Stats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}