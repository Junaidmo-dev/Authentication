import { User, Entity } from '../types';

// Initial Mock Data
const INITIAL_USER: User = {
  id: '1',
  name: 'Alex Morgan',
  email: 'alex.m@company.co',
  role: 'Administrator',
  location: 'San Francisco, CA',
  phone: '+1 (555) 000-0000',
  bio: 'Passionate administrator with over 5 years of experience in secure systems management.',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaAGPBKvIzAWVpBh_4SEyQqJiZRylazAPlTx4IBZN9EUu3dTDXTmltajwkmfSaEzHoNSW-9wDH39Mn4h4_LawvD7JHS1NmCKyrNlWhf2runfp4-Rng2LKumX6Ob22NyfuIVCt_uJvAKclmcZ86cAwYzchlk7Xf7iqyQ_i_4cMxc-S2k-5eGT3pimU50FdYsFubKy7wKLDY7YY6DHOdp3ZRLk4eDBWwpfFg3fzzXp8IsTLLDvc3-HEmfiOcRwuTqGwRzXkObKc3NGoa'
};

const INITIAL_ENTITIES: Entity[] = [
  { id: '#ENT-2024-001', name: 'Q3 Financial Report', status: 'Active', lastUpdated: new Date().toISOString(), assignee: 'Sarah C.' },
  { id: '#ENT-2024-042', name: 'Website Analytics Review', status: 'In Progress', lastUpdated: new Date(Date.now() - 86400000).toISOString(), assignee: 'Mike T.' },
  { id: '#ENT-2024-089', name: 'Server Maintenance Logs', status: 'Draft', lastUpdated: new Date(Date.now() - 172800000).toISOString(), assignee: 'John D.' },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service Logic
export const api = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    // In a real app, validate credentials here. 
    // For this demo, we just return the stored user or initial user.
    const storedUser = localStorage.getItem('secure_dash_user');
    return storedUser ? JSON.parse(storedUser) : INITIAL_USER;
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    await delay(800);
    const newUser: User = { ...INITIAL_USER, name, email };
    localStorage.setItem('secure_dash_user', JSON.stringify(newUser));
    return newUser;
  },

  getUser: async (): Promise<User> => {
    await delay(300);
    const storedUser = localStorage.getItem('secure_dash_user');
    return storedUser ? JSON.parse(storedUser) : INITIAL_USER;
  },

  updateUser: async (user: User): Promise<User> => {
    await delay(600);
    localStorage.setItem('secure_dash_user', JSON.stringify(user));
    return user;
  },

  getEntities: async (): Promise<Entity[]> => {
    await delay(400);
    const stored = localStorage.getItem('secure_dash_entities');
    return stored ? JSON.parse(stored) : INITIAL_ENTITIES;
  },

  addEntity: async (entity: Omit<Entity, 'id' | 'lastUpdated'>): Promise<Entity> => {
    await delay(500);
    const stored = localStorage.getItem('secure_dash_entities');
    const entities: Entity[] = stored ? JSON.parse(stored) : INITIAL_ENTITIES;
    
    const newEntity: Entity = {
      ...entity,
      id: `#ENT-${Math.floor(Math.random() * 10000)}`,
      lastUpdated: new Date().toISOString()
    };
    
    const updatedList = [newEntity, ...entities];
    localStorage.setItem('secure_dash_entities', JSON.stringify(updatedList));
    return newEntity;
  },
  
  deleteEntity: async (id: string): Promise<void> => {
    await delay(400);
    const stored = localStorage.getItem('secure_dash_entities');
    const entities: Entity[] = stored ? JSON.parse(stored) : INITIAL_ENTITIES;
    const updatedList = entities.filter(e => e.id !== id);
    localStorage.setItem('secure_dash_entities', JSON.stringify(updatedList));
  }
};