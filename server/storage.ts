import { 
  users, 
  debates, 
  type User, 
  type InsertUser, 
  type Debate, 
  type InsertDebate, 
  type DebatePoint 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Debate methods
  getDebate(id: number): Promise<Debate | undefined>;
  getDebatesByUserId(userId: number | null): Promise<Debate[]>;
  createDebate(debate: InsertDebate): Promise<Debate>;
  deleteDebate(id: number): Promise<boolean>;
  getAllDebates(): Promise<Debate[]>; // For demo purposes
  searchDebates(query: string): Promise<Debate[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private debates: Map<number, Debate>;
  private userIdCounter: number;
  private debateIdCounter: number;

  constructor() {
    this.users = new Map();
    this.debates = new Map();
    this.userIdCounter = 1;
    this.debateIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      preferences: {} 
    };
    this.users.set(id, user);
    return user;
  }

  // Debate methods
  async getDebate(id: number): Promise<Debate | undefined> {
    return this.debates.get(id);
  }

  async getDebatesByUserId(userId: number | null): Promise<Debate[]> {
    if (userId === null) {
      return this.getAllDebates();
    }
    
    return Array.from(this.debates.values()).filter(
      (debate) => debate.userId === userId
    );
  }

  async createDebate(debate: InsertDebate): Promise<Debate> {
    const id = this.debateIdCounter++;
    // Create a properly typed debate object
    const newDebate: Debate = { 
      id,
      createdAt: new Date(),
      topic: debate.topic,
      points: debate.points,
      userId: debate.userId !== undefined ? debate.userId : null,
      language: debate.language !== undefined ? debate.language : "english",
      format: debate.format !== undefined ? debate.format : null
    };
    this.debates.set(id, newDebate);
    return newDebate;
  }

  async deleteDebate(id: number): Promise<boolean> {
    return this.debates.delete(id);
  }

  async getAllDebates(): Promise<Debate[]> {
    return Array.from(this.debates.values());
  }

  async searchDebates(query: string): Promise<Debate[]> {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.debates.values()).filter(
      (debate) => debate.topic.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();
