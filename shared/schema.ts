import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("analyst"), // admin, analyst, support, intern
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiAnalyses = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productName: text("product_name").notNull(),
  category: text("category"),
  score: integer("score"), // 0-100
  analysis: jsonb("analysis"), // AI response data
  status: text("status").notNull().default("pending"), // pending, completed, failed
  moduleCode: text("module_code").notNull().default("M001"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const aiAlerts = pgTable("ai_alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // warning, info, success
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  name: true,
});

export const insertAnalysisSchema = createInsertSchema(aiAnalyses).pick({
  productName: true,
  category: true,
  moduleCode: true,
});

export const insertAlertSchema = createInsertSchema(aiAlerts).pick({
  type: true,
  title: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof aiAnalyses.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof aiAlerts.$inferSelect;
