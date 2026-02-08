import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with authentication and preferences
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  dailyReminderTime: text("daily_reminder_time").default("09:00"),
  theme: text("theme").default("light"),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity types (predefined + custom)
export const activityTypes = pgTable("activity_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  category: text("category").notNull(), // productive, leisure, health, other
  isDefault: boolean("is_default").default(false),
});

// Activity logs - time spent on activities
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityTypeId: varchar("activity_type_id").references(() => activityTypes.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  minutes: integer("minutes").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User streaks tracking
export const streaks = pgTable("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: text("last_active_date"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
});

export const insertActivityTypeSchema = createInsertSchema(activityTypes).pick({
  userId: true,
  name: true,
  icon: true,
  color: true,
  category: true,
  isDefault: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  activityTypeId: true,
  date: true,
  minutes: true,
  notes: true,
});

export const insertStreakSchema = createInsertSchema(streaks).pick({
  userId: true,
  currentStreak: true,
  longestStreak: true,
  lastActiveDate: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertActivityType = z.infer<typeof insertActivityTypeSchema>;
export type ActivityType = typeof activityTypes.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;

// Extended types for frontend use
export type ActivityLogWithType = ActivityLog & {
  activityType: ActivityType;
};

export type DailyStats = {
  date: string;
  totalMinutes: number;
  activities: {
    activityType: ActivityType;
    minutes: number;
    percentage: number;
  }[];
  productiveMinutes: number;
  leisureMinutes: number;
};

export type WeeklyStats = {
  startDate: string;
  endDate: string;
  totalMinutes: number;
  dailyBreakdown: DailyStats[];
  activityBreakdown: {
    activityType: ActivityType;
    minutes: number;
    previousWeekMinutes: number;
    changePercentage: number;
  }[];
  insights: string[];
};

export type MonthlyStats = {
  month: string; // YYYY-MM
  totalMinutes: number;
  dailyHeatmap: { date: string; minutes: number }[];
  mostProductiveDay: string;
  leastProductiveDay: string;
  topActivities: {
    activityType: ActivityType;
    minutes: number;
  }[];
  suggestions: string[];
};

// Login/Register schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address").optional(),
  displayName: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Default activity types
export const defaultActivityTypes: Omit<InsertActivityType, "userId">[] = [
  { name: "Work", icon: "Briefcase", color: "#3B82F6", category: "productive", isDefault: true },
  { name: "Study", icon: "BookOpen", color: "#8B5CF6", category: "productive", isDefault: true },
  { name: "Exercise", icon: "Dumbbell", color: "#14B8A6", category: "health", isDefault: true },
  { name: "Sleep", icon: "Moon", color: "#6366F1", category: "health", isDefault: true },
  { name: "Reading", icon: "Book", color: "#F59E0B", category: "productive", isDefault: true },
  { name: "Social Media", icon: "Smartphone", color: "#EF4444", category: "leisure", isDefault: true },
  { name: "Gaming", icon: "Gamepad2", color: "#EC4899", category: "leisure", isDefault: true },
  { name: "Meditation", icon: "Brain", color: "#10B981", category: "health", isDefault: true },
  { name: "Cooking", icon: "ChefHat", color: "#F97316", category: "other", isDefault: true },
  { name: "Hobbies", icon: "Palette", color: "#8B5CF6", category: "leisure", isDefault: true },
];
