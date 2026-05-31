import { eq, and, gte, lte, isNull, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subjects, tasks, pomodoroSessions, studyStatistics, subjectStatistics, aiCallTracking, adRewards, InsertAICallTracking, InsertAdReward } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ SUBJECTS ============

export async function getSubjectsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.createdAt));
}

export async function getSubjectById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubject(userId: number, name: string, color: string, icon: string, description?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(subjects).values({ userId, name, color, icon, description });
  return result;
}

export async function updateSubject(id: number, userId: number, updates: { name?: string; color?: string; icon?: string; description?: string }) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(subjects).set(updates).where(and(eq(subjects.id, id), eq(subjects.userId, userId)));
}

export async function deleteSubject(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, userId)));
}

// ============ TASKS ============

export async function getTasksByUserId(userId: number, filters?: { subjectId?: number; priority?: string; completed?: boolean; dueAfter?: Date; dueBefore?: Date }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions: any[] = [eq(tasks.userId, userId)];
  
  if (filters?.subjectId) {
    conditions.push(eq(tasks.subjectId, filters.subjectId));
  }
  
  if (filters?.priority) {
    conditions.push(eq(tasks.priority, filters.priority as any));
  }
  
  if (filters?.completed !== undefined) {
    if (filters.completed) {
      conditions.push(sql`${tasks.completedAt} IS NOT NULL`);
    } else {
      conditions.push(isNull(tasks.completedAt));
    }
  }
  
  if (filters?.dueAfter) {
    conditions.push(gte(tasks.dueDate, filters.dueAfter));
  }
  
  if (filters?.dueBefore) {
    conditions.push(lte(tasks.dueDate, filters.dueBefore));
  }
  
  return db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.priority), asc(tasks.dueDate));
}

export async function getTaskById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTask(userId: number, title: string, priority: string, subjectId?: number, description?: string, dueDate?: Date) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(tasks).values({ userId, title, priority: priority as any, subjectId, description, dueDate });
  return result;
}

export async function updateTask(id: number, userId: number, updates: { title?: string; description?: string; priority?: 'HIGH' | 'MEDIUM' | 'LOW'; subjectId?: number; dueDate?: Date; completedAt?: Date | null }) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(tasks).set(updates as any).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function getTasksByDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return db.select().from(tasks).where(
    and(
      eq(tasks.userId, userId),
      gte(tasks.dueDate, startOfDay),
      lte(tasks.dueDate, endOfDay)
    )
  ).orderBy(asc(tasks.dueDate));
}

export async function getUpcomingTasks(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return db.select().from(tasks).where(
    and(
      eq(tasks.userId, userId),
      isNull(tasks.completedAt),
      gte(tasks.dueDate, now),
      lte(tasks.dueDate, future)
    )
  ).orderBy(asc(tasks.dueDate));
}

// ============ POMODORO SESSIONS ============

export async function createPomodoroSession(userId: number, duration: number, type: 'WORK' | 'BREAK' | 'LONG_BREAK', taskId?: number, subjectId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(pomodoroSessions).values({ userId, duration, type, taskId, subjectId, completedAt: new Date() });
  return result;
}

export async function getPomodoroSessionsByUserId(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pomodoroSessions).where(eq(pomodoroSessions.userId, userId)).orderBy(desc(pomodoroSessions.completedAt)).limit(limit);
}

export async function getPomodoroSessionsByDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return db.select().from(pomodoroSessions).where(
    and(
      eq(pomodoroSessions.userId, userId),
      gte(pomodoroSessions.completedAt, startOfDay),
      lte(pomodoroSessions.completedAt, endOfDay)
    )
  ).orderBy(desc(pomodoroSessions.completedAt));
}

// ============ STUDY STATISTICS ============

export async function getOrCreateDailyStatistics(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const dateStr = date.toISOString().split('T')[0];
  const result = await db.select().from(studyStatistics).where(
    and(eq(studyStatistics.userId, userId), sql`DATE(${studyStatistics.date}) = ${dateStr}`)
  ).limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  const inserted = await db.insert(studyStatistics).values({ userId, date, totalMinutes: 0, sessionsCompleted: 0, tasksCompleted: 0 });
  return inserted;
}

export async function updateDailyStatistics(userId: number, date: Date, updates: { totalMinutes?: number; sessionsCompleted?: number; tasksCompleted?: number }) {
  const db = await getDb();
  if (!db) return undefined;
  
  const dateStr = date.toISOString().split('T')[0];
  return db.update(studyStatistics).set(updates).where(
    and(eq(studyStatistics.userId, userId), sql`DATE(${studyStatistics.date}) = ${dateStr}`)
  );
}

export async function getDailyStatistics(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(studyStatistics).where(
    and(
      eq(studyStatistics.userId, userId),
      gte(studyStatistics.date, startDate),
      lte(studyStatistics.date, endDate)
    )
  ).orderBy(asc(studyStatistics.date));
}

export async function getStudyStreak(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const sessions = await db.select().from(pomodoroSessions)
    .where(eq(pomodoroSessions.userId, userId))
    .orderBy(desc(pomodoroSessions.completedAt));
  
  if (sessions.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const session of sessions) {
    const sessionDate = new Date(session.completedAt);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (sessionDate.getTime() === currentDate.getTime()) {
      if (streak === 0) streak = 1;
    } else if (sessionDate.getTime() === currentDate.getTime() - 24 * 60 * 60 * 1000) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }
  
  return streak;
}

// ============ SUBJECT STATISTICS ============

export async function getOrCreateSubjectDailyStatistics(userId: number, subjectId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const dateStr = date.toISOString().split('T')[0];
  const result = await db.select().from(subjectStatistics).where(
    and(
      eq(subjectStatistics.userId, userId),
      eq(subjectStatistics.subjectId, subjectId),
      sql`DATE(${subjectStatistics.date}) = ${dateStr}`
    )
  ).limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  const inserted = await db.insert(subjectStatistics).values({ userId, subjectId, date, minutesSpent: 0, tasksCompleted: 0 });
  return inserted;
}

export async function updateSubjectDailyStatistics(userId: number, subjectId: number, date: Date, updates: { minutesSpent?: number; tasksCompleted?: number }) {
  const db = await getDb();
  if (!db) return undefined;
  
  const dateStr = date.toISOString().split('T')[0];
  return db.update(subjectStatistics).set(updates).where(
    and(
      eq(subjectStatistics.userId, userId),
      eq(subjectStatistics.subjectId, subjectId),
      sql`DATE(${subjectStatistics.date}) = ${dateStr}`
    )
  );
}

export async function getSubjectStatistics(userId: number, subjectId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subjectStatistics).where(
    and(
      eq(subjectStatistics.userId, userId),
      eq(subjectStatistics.subjectId, subjectId),
      gte(subjectStatistics.date, startDate),
      lte(subjectStatistics.date, endDate)
    )
  ).orderBy(asc(subjectStatistics.date));
}

export async function getAllSubjectStatistics(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subjectStatistics).where(
    and(
      eq(subjectStatistics.userId, userId),
      gte(subjectStatistics.date, startDate),
      lte(subjectStatistics.date, endDate)
    )
  ).orderBy(asc(subjectStatistics.date));
}


// ============ AI CALL TRACKING ============

export async function getOrCreateDailyAICallTracking(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const dateStr = date.toISOString().split('T')[0];
  const result = await db.select().from(aiCallTracking).where(
    and(eq(aiCallTracking.userId, userId), sql`DATE(${aiCallTracking.date}) = ${dateStr}`)
  ).limit(1);
  
  if (result.length > 0) {
    return result[0];
  }
  
  const inserted = await db.insert(aiCallTracking).values({ userId, date, callsUsed: 0, adRewardCallsUnlocked: 0 });
  return inserted;
}

export async function incrementAICallUsage(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const dateStr = date.toISOString().split('T')[0];
  return db.update(aiCallTracking).set({ callsUsed: sql`callsUsed + 1` }).where(
    and(eq(aiCallTracking.userId, userId), sql`DATE(${aiCallTracking.date}) = ${dateStr}`)
  );
}

export async function getDailyAICallUsage(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return 0;
  
  const tracking = await getOrCreateDailyAICallTracking(userId, date);
  return (tracking as any)?.callsUsed ?? 0;
}

export async function getDailyAICallLimit(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return 3;
  
  const tracking = await getOrCreateDailyAICallTracking(userId, date);
  const baseLimit = 3;
  const adBonusLimit = (tracking as any)?.adRewardCallsUnlocked ?? 0;
  return baseLimit + adBonusLimit;
}

export async function canMakeAICall(userId: number, date: Date) {
  const used = await getDailyAICallUsage(userId, date);
  const limit = await getDailyAICallLimit(userId, date);
  return used < limit;
}

// ============ AD REWARDS ============

export async function createAdReward(userId: number, questionsUnlocked: number = 1) {
  const db = await getDb();
  if (!db) return undefined;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  
  const result = await db.insert(adRewards).values({
    userId,
    adType: "REWARDED",
    questionsUnlocked,
    questionsUsed: 0,
    watchedAt: now,
    expiresAt,
  });
  
  // Increment ad reward calls in today's tracking
  const tracking = await getOrCreateDailyAICallTracking(userId, now);
  if (tracking && 'id' in tracking) {
    await db.update(aiCallTracking).set({ 
      adRewardCallsUnlocked: sql`adRewardCallsUnlocked + ${questionsUnlocked}` 
    }).where(eq(aiCallTracking.id, (tracking as any).id));
  }
  
  return result;
}

export async function getAvailableAdRewards(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db.select().from(adRewards).where(
    and(
      eq(adRewards.userId, userId),
      lte(adRewards.questionsUsed, adRewards.questionsUnlocked),
      gte(adRewards.expiresAt, now)
    )
  ).orderBy(desc(adRewards.watchedAt));
}

export async function incrementAdRewardUsage(rewardId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  return db.update(adRewards).set({ questionsUsed: sql`questionsUsed + 1` }).where(
    eq(adRewards.id, rewardId)
  );
}

export async function getAdRewardUsageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const now = new Date();
  const result = await db.select().from(adRewards).where(
    and(
      eq(adRewards.userId, userId),
      gte(adRewards.expiresAt, now)
    )
  );
  
  return result.reduce((total, reward) => total + (reward.questionsUnlocked - reward.questionsUsed), 0);
}
