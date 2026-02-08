import { 
  type User, type InsertUser, 
  type ActivityType, type InsertActivityType,
  type ActivityLog, type InsertActivityLog,
  type Streak, type InsertStreak,
  defaultActivityTypes
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  getActivityTypes(userId: string | null): Promise<ActivityType[]>;
  createActivityType(activityType: InsertActivityType): Promise<ActivityType>;
  deleteActivityType(id: string): Promise<boolean>;

  getActivityLogs(userId: string): Promise<ActivityLog[]>;
  getActivityLogsByDate(userId: string, date: string): Promise<ActivityLog[]>;
  getActivityLogsByDateRange(userId: string, startDate: string, endDate: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  deleteActivityLog(id: string): Promise<boolean>;

  getStreak(userId: string): Promise<Streak | undefined>;
  createOrUpdateStreak(streak: InsertStreak): Promise<Streak>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activityTypes: Map<string, ActivityType>;
  private activityLogs: Map<string, ActivityLog>;
  private streaks: Map<string, Streak>;

  constructor() {
    this.users = new Map();
    this.activityTypes = new Map();
    this.activityLogs = new Map();
    this.streaks = new Map();
    
    this.initializeDefaultActivities();
  }

  private initializeDefaultActivities() {
    defaultActivityTypes.forEach((activity, index) => {
      const id = `default-${index + 1}`;
      this.activityTypes.set(id, {
        id,
        userId: null,
        name: activity.name,
        icon: activity.icon,
        color: activity.color,
        category: activity.category,
        isDefault: true,
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      displayName: insertUser.displayName || null,
      avatarUrl: null,
      notificationsEnabled: true,
      dailyReminderTime: "09:00",
      theme: "light",
      hasCompletedOnboarding: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getActivityTypes(userId: string | null): Promise<ActivityType[]> {
    return Array.from(this.activityTypes.values()).filter(
      (activity) => activity.isDefault || activity.userId === userId
    );
  }

  async createActivityType(activityType: InsertActivityType): Promise<ActivityType> {
    const id = randomUUID();
    const newActivity: ActivityType = {
      id,
      userId: activityType.userId || null,
      name: activityType.name,
      icon: activityType.icon,
      color: activityType.color,
      category: activityType.category,
      isDefault: activityType.isDefault ?? false,
    };
    this.activityTypes.set(id, newActivity);
    return newActivity;
  }

  async deleteActivityType(id: string): Promise<boolean> {
    return this.activityTypes.delete(id);
  }

  async getActivityLogs(userId: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(
      (log) => log.userId === userId
    );
  }

  async getActivityLogsByDate(userId: string, date: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(
      (log) => log.userId === userId && log.date === date
    );
  }

  async getActivityLogsByDateRange(userId: string, startDate: string, endDate: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(
      (log) => log.userId === userId && log.date >= startDate && log.date <= endDate
    );
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const newLog: ActivityLog = {
      id,
      userId: log.userId,
      activityTypeId: log.activityTypeId,
      date: log.date,
      minutes: log.minutes,
      notes: log.notes || null,
      createdAt: new Date(),
    };
    this.activityLogs.set(id, newLog);
    return newLog;
  }

  async deleteActivityLog(id: string): Promise<boolean> {
    return this.activityLogs.delete(id);
  }

  async getStreak(userId: string): Promise<Streak | undefined> {
    return Array.from(this.streaks.values()).find(
      (streak) => streak.userId === userId
    );
  }

  async createOrUpdateStreak(streakData: InsertStreak): Promise<Streak> {
    let streak = await this.getStreak(streakData.userId);
    
    if (streak) {
      streak = {
        ...streak,
        currentStreak: streakData.currentStreak ?? streak.currentStreak,
        longestStreak: streakData.longestStreak ?? streak.longestStreak,
        lastActiveDate: streakData.lastActiveDate ?? streak.lastActiveDate,
      };
      this.streaks.set(streak.id, streak);
    } else {
      const id = randomUUID();
      streak = {
        id,
        userId: streakData.userId,
        currentStreak: streakData.currentStreak ?? 0,
        longestStreak: streakData.longestStreak ?? 0,
        lastActiveDate: streakData.lastActiveDate ?? null,
      };
      this.streaks.set(id, streak);
    }
    
    return streak;
  }
}

export const storage = new MemStorage();
