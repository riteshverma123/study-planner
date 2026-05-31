/**
 * Offline Storage Manager
 * Handles local storage of tasks, statistics, and settings
 * Data persists on device and is deleted when app is uninstalled
 */

export interface OfflineTask {
  id: string; // Local UUID
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  syncedToServer?: boolean;
  serverId?: number; // ID after synced to server
}

export interface OfflineStatistics {
  date: Date;
  totalMinutes: number;
  tasksCompleted: number;
  sessionsCompleted: number;
}

export interface OfflineSettings {
  pomodoroWorkDuration: number; // in minutes
  pomodoroBreakDuration: number;
  pomodoroLongBreakDuration: number;
  theme: "light" | "dark";
}

const STORAGE_KEYS = {
  TASKS: "study_planner_tasks",
  STATISTICS: "study_planner_statistics",
  SETTINGS: "study_planner_settings",
  LAST_SYNC: "study_planner_last_sync",
  OFFLINE_MODE: "study_planner_offline_mode",
};

/**
 * Initialize offline storage with default settings
 */
export function initializeOfflineStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings: OfflineSettings = {
      pomodoroWorkDuration: 25,
      pomodoroBreakDuration: 5,
      pomodoroLongBreakDuration: 15,
      theme: "light",
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STATISTICS)) {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify([]));
  }
}

/**
 * Get all offline tasks
 */
export function getOfflineTasks(): OfflineTask[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    const tasks = JSON.parse(data) as OfflineTask[];
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  } catch (error) {
    console.error("Error reading offline tasks:", error);
    return [];
  }
}

/**
 * Save a new offline task
 */
export function saveOfflineTask(task: Omit<OfflineTask, "id" | "createdAt">): OfflineTask {
  const tasks = getOfflineTasks();
  const newTask: OfflineTask = {
    ...task,
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return newTask;
}

/**
 * Update an offline task
 */
export function updateOfflineTask(taskId: string, updates: Partial<OfflineTask>): OfflineTask | null {
  const tasks = getOfflineTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;

  const updatedTask = { ...tasks[index], ...updates };
  tasks[index] = updatedTask;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  return updatedTask;
}

/**
 * Delete an offline task
 */
export function deleteOfflineTask(taskId: string): boolean {
  const tasks = getOfflineTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  if (filtered.length === tasks.length) return false;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  return true;
}

/**
 * Get offline statistics
 */
export function getOfflineStatistics(): OfflineStatistics[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATISTICS);
    if (!data) return [];
    const stats = JSON.parse(data) as OfflineStatistics[];
    return stats.map(stat => ({
      ...stat,
      date: new Date(stat.date),
    }));
  } catch (error) {
    console.error("Error reading offline statistics:", error);
    return [];
  }
}

/**
 * Update daily statistics
 */
export function updateOfflineStatistics(date: Date, updates: Partial<OfflineStatistics>) {
  const stats = getOfflineStatistics();
  const dateStr = date.toISOString().split('T')[0];
  const index = stats.findIndex(s => s.date.toISOString().split('T')[0] === dateStr);

  if (index === -1) {
    stats.push({
      date,
      totalMinutes: updates.totalMinutes || 0,
      tasksCompleted: updates.tasksCompleted || 0,
      sessionsCompleted: updates.sessionsCompleted || 0,
    });
  } else {
    stats[index] = { ...stats[index], ...updates };
  }

  localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
}

/**
 * Get offline settings
 */
export function getOfflineSettings(): OfflineSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      initializeOfflineStorage();
      return getOfflineSettings();
    }
    return JSON.parse(data) as OfflineSettings;
  } catch (error) {
    console.error("Error reading offline settings:", error);
    initializeOfflineStorage();
    return getOfflineSettings();
  }
}

/**
 * Update offline settings
 */
export function updateOfflineSettings(updates: Partial<OfflineSettings>) {
  const settings = getOfflineSettings();
  const updated = { ...settings, ...updates };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
}

/**
 * Check if offline mode is enabled
 */
export function isOfflineMode(): boolean {
  return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE) === "true";
}

/**
 * Set offline mode
 */
export function setOfflineMode(enabled: boolean) {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, enabled ? "true" : "false");
}

/**
 * Get last sync time
 */
export function getLastSyncTime(): Date | null {
  const time = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return time ? new Date(time) : null;
}

/**
 * Update last sync time
 */
export function updateLastSyncTime() {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

/**
 * Get unsynced tasks
 */
export function getUnsyncedTasks(): OfflineTask[] {
  const tasks = getOfflineTasks();
  return tasks.filter(t => !t.syncedToServer);
}

/**
 * Mark task as synced
 */
export function markTaskAsSynced(taskId: string, serverId: number) {
  updateOfflineTask(taskId, { syncedToServer: true, serverId });
}

/**
 * Clear all offline data (for logout or reset)
 */
export function clearOfflineData() {
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.STATISTICS);
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_MODE);
  // Keep settings for next login
}
