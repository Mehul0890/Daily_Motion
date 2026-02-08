import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ActivityType, ActivityLog, DailyStats, WeeklyStats, MonthlyStats, defaultActivityTypes } from "@shared/schema";
import { useAuth } from "./auth-context";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, eachDayOfInterval, parseISO, differenceInDays } from "date-fns";

const ACTIVITIES_KEY = "daily-motion-activities";
const LOGS_KEY = "daily-motion-logs";
const STREAK_KEY = "daily-motion-streak";

const defaultActivities: ActivityType[] = [
  { id: "1", userId: null, name: "Work", icon: "Briefcase", color: "#3B82F6", category: "productive", isDefault: true },
  { id: "2", userId: null, name: "Study", icon: "BookOpen", color: "#8B5CF6", category: "productive", isDefault: true },
  { id: "3", userId: null, name: "Exercise", icon: "Dumbbell", color: "#14B8A6", category: "health", isDefault: true },
  { id: "4", userId: null, name: "Sleep", icon: "Moon", color: "#6366F1", category: "health", isDefault: true },
  { id: "5", userId: null, name: "Reading", icon: "Book", color: "#F59E0B", category: "productive", isDefault: true },
  { id: "6", userId: null, name: "Social Media", icon: "Smartphone", color: "#EF4444", category: "leisure", isDefault: true },
  { id: "7", userId: null, name: "Gaming", icon: "Gamepad2", color: "#EC4899", category: "leisure", isDefault: true },
  { id: "8", userId: null, name: "Meditation", icon: "Brain", color: "#10B981", category: "health", isDefault: true },
  { id: "9", userId: null, name: "Cooking", icon: "ChefHat", color: "#F97316", category: "other", isDefault: true },
  { id: "10", userId: null, name: "Hobbies", icon: "Palette", color: "#8B5CF6", category: "leisure", isDefault: true },
];

type Streak = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
};

type ActivityContextType = {
  activities: ActivityType[];
  logs: ActivityLog[];
  streak: Streak;
  addActivity: (activity: Omit<ActivityType, "id" | "userId" | "isDefault">) => void;
  addLog: (log: Omit<ActivityLog, "id" | "userId" | "createdAt">) => void;
  deleteLog: (logId: string) => void;
  getDailyStats: (date: string) => DailyStats;
  getWeeklyStats: (date: Date) => WeeklyStats;
  getMonthlyStats: (date: Date) => MonthlyStats;
  getTodayMinutes: () => number;
  getActivityById: (id: string) => ActivityType | undefined;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>(() => {
    const stored = localStorage.getItem(ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : defaultActivities;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [streak, setStreak] = useState<Streak>(() => {
    const stored = localStorage.getItem(STREAK_KEY);
    return stored ? JSON.parse(stored) : { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  });

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak]);

  const updateStreak = useCallback((date: string) => {
    setStreak(prev => {
      const today = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

      if (prev.lastActiveDate === today) {
        return prev;
      }

      let newStreak = prev.currentStreak;

      if (prev.lastActiveDate === yesterday || prev.lastActiveDate === null) {
        newStreak = prev.currentStreak + 1;
      } else if (prev.lastActiveDate !== today) {
        newStreak = 1;
      }

      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastActiveDate: today,
      };
    });
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityType, "id" | "userId" | "isDefault">) => {
    const newActivity: ActivityType = {
      ...activity,
      id: `custom-${Date.now()}`,
      userId: user?.id || null,
      isDefault: false,
    };
    setActivities(prev => [...prev, newActivity]);
  }, [user?.id]);

  const addLog = useCallback((log: Omit<ActivityLog, "id" | "userId" | "createdAt">) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      userId: user?.id || null,
      createdAt: new Date(),
    };
    setLogs(prev => [...prev, newLog]);
    updateStreak(log.date);
  }, [user?.id, updateStreak]);

  const deleteLog = useCallback((logId: string) => {
    setLogs(prev => prev.filter(log => log.id !== logId));
  }, []);

  const getActivityById = useCallback((id: string) => {
    return activities.find(a => a.id === id);
  }, [activities]);

  const getDailyStats = useCallback((date: string): DailyStats => {
    const dayLogs = logs.filter(log => log.date === date);
    const totalMinutes = dayLogs.reduce((sum, log) => sum + log.minutes, 0);

    const activityBreakdown: { [key: string]: number } = {};
    dayLogs.forEach(log => {
      activityBreakdown[log.activityTypeId] = (activityBreakdown[log.activityTypeId] || 0) + log.minutes;
    });

    const activitiesWithTime = Object.entries(activityBreakdown).map(([activityTypeId, minutes]) => {
      const activityType = getActivityById(activityTypeId);
      return {
        activityType: activityType!,
        minutes,
        percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
      };
    }).filter(a => a.activityType);

    const productiveMinutes = activitiesWithTime
      .filter(a => a.activityType.category === "productive")
      .reduce((sum, a) => sum + a.minutes, 0);

    const leisureMinutes = activitiesWithTime
      .filter(a => a.activityType.category === "leisure")
      .reduce((sum, a) => sum + a.minutes, 0);

    return {
      date,
      totalMinutes,
      activities: activitiesWithTime,
      productiveMinutes,
      leisureMinutes,
    };
  }, [logs, getActivityById]);

  const getWeeklyStats = useCallback((date: Date): WeeklyStats => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    const prevWeekStart = subWeeks(weekStart, 1);
    const prevWeekEnd = subWeeks(weekEnd, 1);

    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dailyBreakdown = daysInWeek.map(day => getDailyStats(format(day, "yyyy-MM-dd")));

    const totalMinutes = dailyBreakdown.reduce((sum, day) => sum + day.totalMinutes, 0);

    const currentWeekByActivity: { [key: string]: number } = {};
    const prevWeekByActivity: { [key: string]: number } = {};

    logs.forEach(log => {
      const logDate = parseISO(log.date);
      if (logDate >= weekStart && logDate <= weekEnd) {
        currentWeekByActivity[log.activityTypeId] = (currentWeekByActivity[log.activityTypeId] || 0) + log.minutes;
      } else if (logDate >= prevWeekStart && logDate <= prevWeekEnd) {
        prevWeekByActivity[log.activityTypeId] = (prevWeekByActivity[log.activityTypeId] || 0) + log.minutes;
      }
    });

    const activityBreakdown = Object.entries(currentWeekByActivity).map(([activityTypeId, minutes]) => {
      const activityType = getActivityById(activityTypeId);
      const previousWeekMinutes = prevWeekByActivity[activityTypeId] || 0;
      const changePercentage = previousWeekMinutes > 0
        ? ((minutes - previousWeekMinutes) / previousWeekMinutes) * 100
        : minutes > 0 ? 100 : 0;

      return {
        activityType: activityType!,
        minutes,
        previousWeekMinutes,
        changePercentage,
      };
    }).filter(a => a.activityType).sort((a, b) => b.minutes - a.minutes);

    const insights = generateWeeklyInsights(activityBreakdown, totalMinutes);

    return {
      startDate: format(weekStart, "yyyy-MM-dd"),
      endDate: format(weekEnd, "yyyy-MM-dd"),
      totalMinutes,
      dailyBreakdown,
      activityBreakdown,
      insights,
    };
  }, [logs, getDailyStats, getActivityById]);

  const getMonthlyStats = useCallback((date: Date): MonthlyStats => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const month = format(date, "yyyy-MM");

    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dailyHeatmap = daysInMonth.map(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayLogs = logs.filter(log => log.date === dateStr);
      const minutes = dayLogs.reduce((sum, log) => sum + log.minutes, 0);
      return { date: dateStr, minutes };
    });

    const totalMinutes = dailyHeatmap.reduce((sum, day) => sum + day.minutes, 0);

    const sortedByMinutes = [...dailyHeatmap].filter(d => d.minutes > 0).sort((a, b) => b.minutes - a.minutes);
    const mostProductiveDay = sortedByMinutes[0]?.date || "";
    const leastProductiveDay = sortedByMinutes[sortedByMinutes.length - 1]?.date || "";

    const activityTotals: { [key: string]: number } = {};
    logs
      .filter(log => log.date.startsWith(month))
      .forEach(log => {
        activityTotals[log.activityTypeId] = (activityTotals[log.activityTypeId] || 0) + log.minutes;
      });

    const topActivities = Object.entries(activityTotals)
      .map(([activityTypeId, minutes]) => ({
        activityType: getActivityById(activityTypeId)!,
        minutes,
      }))
      .filter(a => a.activityType)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    const suggestions = generateMonthlySuggestions(topActivities, totalMinutes);

    return {
      month,
      totalMinutes,
      dailyHeatmap,
      mostProductiveDay,
      leastProductiveDay,
      topActivities,
      suggestions,
    };
  }, [logs, getActivityById]);

  const getTodayMinutes = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return logs
      .filter(log => log.date === today)
      .reduce((sum, log) => sum + log.minutes, 0);
  }, [logs]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        logs,
        streak,
        addActivity,
        addLog,
        deleteLog,
        getDailyStats,
        getWeeklyStats,
        getMonthlyStats,
        getTodayMinutes,
        getActivityById,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

function generateWeeklyInsights(
  activityBreakdown: { activityType: ActivityType; minutes: number; previousWeekMinutes: number; changePercentage: number }[],
  totalMinutes: number
): string[] {
  const insights: string[] = [];

  activityBreakdown.forEach(activity => {
    if (activity.changePercentage > 20) {
      insights.push(`You spent ${Math.round(activity.changePercentage)}% more time on ${activity.activityType.name} compared to last week.`);
    } else if (activity.changePercentage < -20) {
      insights.push(`You reduced ${activity.activityType.name} by ${Math.abs(Math.round(activity.changePercentage))}% from last week.`);
    }
  });

  const leisureActivities = activityBreakdown.filter(a => a.activityType.category === "leisure");
  const leisureTotal = leisureActivities.reduce((sum, a) => sum + a.minutes, 0);
  if (leisureTotal > totalMinutes * 0.4) {
    insights.push("You're spending a lot of time on leisure activities. Consider balancing with productive tasks.");
  }

  const healthActivities = activityBreakdown.filter(a => a.activityType.category === "health");
  const healthTotal = healthActivities.reduce((sum, a) => sum + a.minutes, 0);
  if (healthTotal < 180) {
    insights.push("Try to add more health-focused activities like exercise or meditation.");
  }

  if (insights.length === 0) {
    insights.push("Great job maintaining a balanced week!");
  }

  return insights.slice(0, 3);
}

function generateMonthlySuggestions(
  topActivities: { activityType: ActivityType; minutes: number }[],
  totalMinutes: number
): string[] {
  const suggestions: string[] = [];

  const leisureActivity = topActivities.find(a => 
    a.activityType.name === "Social Media" || a.activityType.name === "Gaming"
  );
  if (leisureActivity && leisureActivity.minutes > totalMinutes * 0.25) {
    suggestions.push(`You spent too much time on ${leisureActivity.activityType.name}. Try limiting it to improve productivity.`);
  }

  const sleepActivity = topActivities.find(a => a.activityType.name === "Sleep");
  const avgSleepPerDay = sleepActivity ? sleepActivity.minutes / 30 : 0;
  if (avgSleepPerDay < 420) {
    suggestions.push("Try sleeping earlier. Aim for 7-8 hours for better focus.");
  }

  const exerciseActivity = topActivities.find(a => a.activityType.name === "Exercise");
  if (!exerciseActivity || exerciseActivity.minutes < 600) {
    suggestions.push("Add 30 minutes of exercise daily for better balance and energy.");
  }

  const productiveActivities = topActivities.filter(a => a.activityType.category === "productive");
  const productiveTotal = productiveActivities.reduce((sum, a) => sum + a.minutes, 0);
  if (productiveTotal > totalMinutes * 0.5) {
    suggestions.push("Great work on staying productive! Keep up the momentum.");
  }

  if (suggestions.length === 0) {
    suggestions.push("You're doing great! Keep maintaining your healthy routine.");
  }

  return suggestions.slice(0, 4);
}

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
