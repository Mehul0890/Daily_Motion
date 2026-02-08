import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  insertActivityTypeSchema,
  insertActivityLogSchema 
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET || "daily-motion-secret-key";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(data)
    .digest("base64");
  return `${data}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const [data, signature] = token.split(".");
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(data)
      .digest("base64");

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, "base64").toString());
    if (payload.exp < Date.now()) return null;

    return payload.userId;
  } catch {
    return null;
  }
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  const userId = verifyToken(token);

  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = userId;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = hashPassword(data.password);
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
        email: data.email,
        displayName: data.displayName,
      });

      const token = generateToken(user.id);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const hashedPassword = hashPassword(data.password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = generateToken(user.id);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/user", authMiddleware, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/user", authMiddleware, async (req: any, res) => {
    try {
      const updates = req.body;
      delete updates.id;
      delete updates.password;

      const user = await storage.updateUser(req.userId, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/activities", authMiddleware, async (req: any, res) => {
    try {
      const activities = await storage.getActivityTypes(req.userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/activities", authMiddleware, async (req: any, res) => {
    try {
      const data = insertActivityTypeSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const activity = await storage.createActivityType(data);
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/activities/:id", authMiddleware, async (req: any, res) => {
    try {
      const deleted = await storage.deleteActivityType(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/logs", authMiddleware, async (req: any, res) => {
    try {
      const logs = await storage.getActivityLogs(req.userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/logs/daily", authMiddleware, async (req: any, res) => {
    try {
      const date = req.query.date as string;
      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const logs = await storage.getActivityLogsByDate(req.userId, date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/logs/range", authMiddleware, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate parameters are required" });
      }
      const logs = await storage.getActivityLogsByDateRange(req.userId, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/logs", authMiddleware, async (req: any, res) => {
    try {
      const data = insertActivityLogSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const log = await storage.createActivityLog(data);

      const today = new Date().toISOString().split("T")[0];
      if (data.date === today) {
        const streak = await storage.getStreak(req.userId);
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        let currentStreak = 1;
        let longestStreak = streak?.longestStreak ?? 0;

        if (streak) {
          if (streak.lastActiveDate === today) {
            currentStreak = streak.currentStreak;
          } else if (streak.lastActiveDate === yesterday) {
            currentStreak = streak.currentStreak + 1;
          }
        }

        longestStreak = Math.max(currentStreak, longestStreak);

        await storage.createOrUpdateStreak({
          userId: req.userId,
          currentStreak,
          longestStreak,
          lastActiveDate: today,
        });
      }

      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/logs/:id", authMiddleware, async (req: any, res) => {
    try {
      const deleted = await storage.deleteActivityLog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Log not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/streak", authMiddleware, async (req: any, res) => {
    try {
      const streak = await storage.getStreak(req.userId);
      res.json(streak || { currentStreak: 0, longestStreak: 0, lastActiveDate: null });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/activity/daily", authMiddleware, async (req: any, res) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
      const logs = await storage.getActivityLogsByDate(req.userId, date);
      const activities = await storage.getActivityTypes(req.userId);

      const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);

      const activityBreakdown: { [key: string]: number } = {};
      logs.forEach((log) => {
        activityBreakdown[log.activityTypeId] = (activityBreakdown[log.activityTypeId] || 0) + log.minutes;
      });

      const activitiesWithTime = Object.entries(activityBreakdown).map(([activityTypeId, minutes]) => {
        const activityType = activities.find((a) => a.id === activityTypeId);
        return {
          activityType,
          minutes,
          percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
        };
      }).filter((a) => a.activityType);

      const productiveMinutes = activitiesWithTime
        .filter((a) => a.activityType?.category === "productive")
        .reduce((sum, a) => sum + a.minutes, 0);

      const leisureMinutes = activitiesWithTime
        .filter((a) => a.activityType?.category === "leisure")
        .reduce((sum, a) => sum + a.minutes, 0);

      res.json({
        date,
        totalMinutes,
        activities: activitiesWithTime,
        productiveMinutes,
        leisureMinutes,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/activity/weekly", authMiddleware, async (req: any, res) => {
    try {
      const dateParam = req.query.date as string;
      const date = dateParam ? new Date(dateParam) : new Date();

      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startDate = weekStart.toISOString().split("T")[0];
      const endDate = weekEnd.toISOString().split("T")[0];

      const logs = await storage.getActivityLogsByDateRange(req.userId, startDate, endDate);
      const activities = await storage.getActivityTypes(req.userId);

      const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);

      const activityBreakdown: { [key: string]: number } = {};
      logs.forEach((log) => {
        activityBreakdown[log.activityTypeId] = (activityBreakdown[log.activityTypeId] || 0) + log.minutes;
      });

      const breakdownWithTypes = Object.entries(activityBreakdown)
        .map(([activityTypeId, minutes]) => {
          const activityType = activities.find((a) => a.id === activityTypeId);
          return {
            activityType,
            minutes,
            previousWeekMinutes: 0,
            changePercentage: 0,
          };
        })
        .filter((a) => a.activityType)
        .sort((a, b) => b.minutes - a.minutes);

      res.json({
        startDate,
        endDate,
        totalMinutes,
        activityBreakdown: breakdownWithTypes,
        insights: generateInsights(breakdownWithTypes, totalMinutes),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/activity/monthly", authMiddleware, async (req: any, res) => {
    try {
      const dateParam = req.query.date as string;
      const date = dateParam ? new Date(dateParam) : new Date();

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const startDate = monthStart.toISOString().split("T")[0];
      const endDate = monthEnd.toISOString().split("T")[0];
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const logs = await storage.getActivityLogsByDateRange(req.userId, startDate, endDate);
      const activities = await storage.getActivityTypes(req.userId);

      const dailyHeatmap: { [key: string]: number } = {};
      logs.forEach((log) => {
        dailyHeatmap[log.date] = (dailyHeatmap[log.date] || 0) + log.minutes;
      });

      const heatmapArray = Object.entries(dailyHeatmap)
        .map(([date, minutes]) => ({ date, minutes }))
        .sort((a, b) => b.minutes - a.minutes);

      const mostProductiveDay = heatmapArray[0]?.date || "";
      const leastProductiveDay = heatmapArray.filter((d) => d.minutes > 0).pop()?.date || "";

      const activityTotals: { [key: string]: number } = {};
      logs.forEach((log) => {
        activityTotals[log.activityTypeId] = (activityTotals[log.activityTypeId] || 0) + log.minutes;
      });

      const topActivities = Object.entries(activityTotals)
        .map(([activityTypeId, minutes]) => ({
          activityType: activities.find((a) => a.id === activityTypeId),
          minutes,
        }))
        .filter((a) => a.activityType)
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 5);

      const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);

      res.json({
        month,
        totalMinutes,
        dailyHeatmap: Object.entries(dailyHeatmap).map(([date, minutes]) => ({ date, minutes })),
        mostProductiveDay,
        leastProductiveDay,
        topActivities,
        suggestions: generateSuggestions(topActivities, totalMinutes),
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}

function generateInsights(
  activityBreakdown: { activityType: any; minutes: number; changePercentage: number }[],
  totalMinutes: number
): string[] {
  const insights: string[] = [];

  const leisureActivities = activityBreakdown.filter(
    (a) => a.activityType?.category === "leisure"
  );
  const leisureTotal = leisureActivities.reduce((sum, a) => sum + a.minutes, 0);
  
  if (leisureTotal > totalMinutes * 0.4) {
    insights.push("You're spending a lot of time on leisure activities. Consider balancing with productive tasks.");
  }

  const healthActivities = activityBreakdown.filter(
    (a) => a.activityType?.category === "health"
  );
  const healthTotal = healthActivities.reduce((sum, a) => sum + a.minutes, 0);
  
  if (healthTotal < 180) {
    insights.push("Try to add more health-focused activities like exercise or meditation.");
  }

  if (insights.length === 0 && totalMinutes > 0) {
    insights.push("Great job maintaining a balanced week!");
  }

  return insights.slice(0, 3);
}

function generateSuggestions(
  topActivities: { activityType: any; minutes: number }[],
  totalMinutes: number
): string[] {
  const suggestions: string[] = [];

  const leisureActivity = topActivities.find(
    (a) => a.activityType?.name === "Social Media" || a.activityType?.name === "Gaming"
  );
  
  if (leisureActivity && leisureActivity.minutes > totalMinutes * 0.25) {
    suggestions.push(
      `You spent too much time on ${leisureActivity.activityType.name}. Try limiting it to improve productivity.`
    );
  }

  const sleepActivity = topActivities.find((a) => a.activityType?.name === "Sleep");
  const avgSleepPerDay = sleepActivity ? sleepActivity.minutes / 30 : 0;
  
  if (avgSleepPerDay < 420) {
    suggestions.push("Try sleeping earlier. Aim for 7-8 hours for better focus.");
  }

  const exerciseActivity = topActivities.find((a) => a.activityType?.name === "Exercise");
  
  if (!exerciseActivity || exerciseActivity.minutes < 600) {
    suggestions.push("Add 30 minutes of exercise daily for better balance and energy.");
  }

  if (suggestions.length === 0) {
    suggestions.push("You're doing great! Keep maintaining your healthy routine.");
  }

  return suggestions.slice(0, 4);
}
