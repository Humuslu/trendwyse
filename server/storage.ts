import { users, aiAnalyses, aiAlerts, type User, type InsertUser, type Analysis, type InsertAnalysis, type Alert, type InsertAlert } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // AI Analyses
  createAnalysis(analysis: InsertAnalysis & { userId: number }): Promise<Analysis>;
  getAnalysesByUser(userId: number): Promise<Analysis[]>;
  getAnalysisById(id: number): Promise<Analysis | undefined>;
  updateAnalysisScore(id: number, score: number, analysis: any): Promise<void>;
  getPendingAnalyses(userId: number): Promise<Analysis[]>;
  getCompletedAnalyses(userId: number, limit?: number): Promise<Analysis[]>;
  
  // AI Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getRecentAlerts(limit?: number): Promise<Alert[]>;
  markAlertAsRead(id: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAnalysis(analysis: InsertAnalysis & { userId: number }): Promise<Analysis> {
    const [result] = await db
      .insert(aiAnalyses)
      .values(analysis)
      .returning();
    return result;
  }

  async getAnalysesByUser(userId: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.userId, userId))
      .orderBy(desc(aiAnalyses.createdAt));
  }

  async getAnalysisById(id: number): Promise<Analysis | undefined> {
    const [analysis] = await db.select().from(aiAnalyses).where(eq(aiAnalyses.id, id));
    return analysis || undefined;
  }

  async updateAnalysisScore(id: number, score: number, analysis: any): Promise<void> {
    await db
      .update(aiAnalyses)
      .set({ 
        score, 
        analysis, 
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(aiAnalyses.id, id));
  }

  async getPendingAnalyses(userId: number): Promise<Analysis[]> {
    return await db
      .select()
      .from(aiAnalyses)
      .where(and(eq(aiAnalyses.userId, userId), eq(aiAnalyses.status, 'pending')))
      .orderBy(desc(aiAnalyses.createdAt));
  }

  async getCompletedAnalyses(userId: number, limit: number = 10): Promise<Analysis[]> {
    return await db
      .select()
      .from(aiAnalyses)
      .where(and(eq(aiAnalyses.userId, userId), eq(aiAnalyses.status, 'completed')))
      .orderBy(desc(aiAnalyses.completedAt))
      .limit(limit);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [result] = await db
      .insert(aiAlerts)
      .values(alert)
      .returning();
    return result;
  }

  async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    return await db
      .select()
      .from(aiAlerts)
      .orderBy(desc(aiAlerts.createdAt))
      .limit(limit);
  }

  async markAlertAsRead(id: number): Promise<void> {
    await db
      .update(aiAlerts)
      .set({ isRead: true })
      .where(eq(aiAlerts.id, id));
  }
}

export const storage = new DatabaseStorage();
