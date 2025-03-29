import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced debate request schema with additional parameters
export const debateTopicSchema = z.object({
  topic: z.string().min(3).max(200),
  language: z.string().min(2).max(30).optional().default("english"),
  complexity: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional().default("intermediate"),
});

// Enhanced debate response schema
export const debatePointSchema = z.object({
  proposition: z.array(z.string()),
  opposition: z.array(z.string()),
  propositionRebuttals: z.array(z.string()),
  oppositionRebuttals: z.array(z.string()),
  evidence: z.array(z.object({
    point: z.string(),
    sources: z.array(z.string()),
  })),
  language: z.string().optional(),
});

// Schema for generating additional rebuttals
export const rebuttalRequestSchema = z.object({
  topic: z.string().min(3).max(200),
  side: z.enum(["proposition", "opposition"]),
  count: z.number().min(1).max(5).default(2),
});

// Schema for generating counter-arguments
export const counterArgumentRequestSchema = z.object({
  argument: z.string().min(3).max(500),
  topic: z.string().min(3).max(200).optional(),
  count: z.number().min(1).max(5).default(3),
});

// Schema for saved debates
export const savedDebateSchema = z.object({
  id: z.string().uuid().optional(),
  topic: z.string().min(3).max(200),
  points: debatePointSchema,
  createdAt: z.date().optional(),
  userId: z.number().optional(),
  language: z.string().optional(),
  format: z.string().optional(),
});

export type DebateTopic = z.infer<typeof debateTopicSchema>;
export type DebatePoint = z.infer<typeof debatePointSchema>;
export type RebuttalRequest = z.infer<typeof rebuttalRequestSchema>;
export type CounterArgumentRequest = z.infer<typeof counterArgumentRequestSchema>;
export type SavedDebate = z.infer<typeof savedDebateSchema>;

// Keep the users table for authentication if needed in the future
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debates = pgTable("debates", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  points: jsonb("points").notNull(),
  userId: integer("user_id").references(() => users.id),
  language: text("language").default("english"),
  format: text("format"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDebateSchema = createInsertSchema(debates).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDebate = z.infer<typeof insertDebateSchema>;
export type Debate = typeof debates.$inferSelect;
