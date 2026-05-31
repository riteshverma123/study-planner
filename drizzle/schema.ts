import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime, date } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subjects/Categories for organizing tasks
 */
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1").notNull(),
  icon: varchar("icon", { length: 50 }).default("BookOpen").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

/**
 * Tasks for the study planner
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subjectId: int("subjectId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["HIGH", "MEDIUM", "LOW"]).default("MEDIUM").notNull(),
  dueDate: datetime("dueDate"),
  completedAt: datetime("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Pomodoro sessions for tracking study time
 */
export const pomodoroSessions = mysqlTable("pomodoro_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId"),
  subjectId: int("subjectId"),
  duration: int("duration").notNull(), // in seconds
  type: mysqlEnum("type", ["WORK", "BREAK", "LONG_BREAK"]).notNull(),
  completedAt: datetime("completedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type InsertPomodoroSession = typeof pomodoroSessions.$inferInsert;

/**
 * Daily study statistics
 */
export const studyStatistics = mysqlTable("study_statistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: date("date").notNull(),
  totalMinutes: int("totalMinutes").default(0).notNull(),
  sessionsCompleted: int("sessionsCompleted").default(0).notNull(),
  tasksCompleted: int("tasksCompleted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyStatistics = typeof studyStatistics.$inferSelect;
export type InsertStudyStatistics = typeof studyStatistics.$inferInsert;

/**
 * Per-subject study statistics
 */
export const subjectStatistics = mysqlTable("subject_statistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subjectId: int("subjectId").notNull(),
  date: date("date").notNull(),
  minutesSpent: int("minutesSpent").default(0).notNull(),
  tasksCompleted: int("tasksCompleted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubjectStatistics = typeof subjectStatistics.$inferSelect;
export type InsertSubjectStatistics = typeof subjectStatistics.$inferInsert;

/**
 * AI Call tracking for daily limits
 */
export const aiCallTracking = mysqlTable("ai_call_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: date("date").notNull(),
  callsUsed: int("callsUsed").default(0).notNull(),
  adRewardCallsUnlocked: int("adRewardCallsUnlocked").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AICallTracking = typeof aiCallTracking.$inferSelect;
export type InsertAICallTracking = typeof aiCallTracking.$inferInsert;

/**
 * Ad reward history
 */
export const adRewards = mysqlTable("ad_rewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adType: varchar("adType", { length: 50 }).notNull(),
  questionsUnlocked: int("questionsUnlocked").default(1).notNull(),
  questionsUsed: int("questionsUsed").default(0).notNull(),
  watchedAt: datetime("watchedAt").notNull(),
  expiresAt: datetime("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdReward = typeof adRewards.$inferSelect;
export type InsertAdReward = typeof adRewards.$inferInsert;
