import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, TrendingUp, TrendingDown, Clock, Flame, Target, Zap } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActivity } from "@/lib/activity-context";
import { useAuth } from "@/lib/auth-context";
import { ActivityBadge } from "@/components/activity-icon";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { getDailyStats, getWeeklyStats, streak, getTodayMinutes } = useActivity();

  const today = format(new Date(), "yyyy-MM-dd");
  const dailyStats = getDailyStats(today);
  const weeklyStats = getWeeklyStats(new Date());
  const todayMinutes = getTodayMinutes();

  const productivePercentage = dailyStats.totalMinutes > 0
    ? Math.round((dailyStats.productiveMinutes / dailyStats.totalMinutes) * 100)
    : 0;

  const dailyGoal = 480;
  const goalProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const chartData = dailyStats.activities.map((a) => ({
    name: a.activityType.name,
    value: a.minutes,
    color: a.activityType.color,
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 md:pb-6"
    >
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold" data-testid="text-greeting">
          {greeting()}, {user?.displayName || user?.username || "there"}!
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <p className="text-2xl font-bold" data-testid="text-today-minutes">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </p>
              <p className="text-sm text-muted-foreground">Total tracked</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="text-2xl font-bold" data-testid="text-current-streak">
                {streak.currentStreak}
              </p>
              <p className="text-sm text-muted-foreground">
                {streak.currentStreak === 1 ? "Day" : "Days"} in a row
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-green-500" />
                <span className="text-xs text-muted-foreground">Goal</span>
              </div>
              <p className="text-2xl font-bold" data-testid="text-goal-progress">
                {Math.round(goalProgress)}%
              </p>
              <Progress value={goalProgress} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <span className="text-xs text-muted-foreground">Productive</span>
              </div>
              <p className="text-2xl font-bold" data-testid="text-productive-percentage">
                {productivePercentage}%
              </p>
              <p className="text-sm text-muted-foreground">Of total time</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">Today's Activities</CardTitle>
              <Link href="/add">
                <Button size="sm" className="gap-1" data-testid="button-add-activity">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dailyStats.activities.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                                  <p className="font-medium">{data.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {Math.floor(data.value / 60)}h {data.value % 60}m
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {dailyStats.activities.slice(0, 5).map((activity) => (
                      <div
                        key={activity.activityType.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
                        data-testid={`activity-${activity.activityType.id}`}
                      >
                        <ActivityBadge
                          icon={activity.activityType.icon}
                          color={activity.activityType.color}
                          name={activity.activityType.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {activity.activityType.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(activity.minutes / 60)}h {activity.minutes % 60}m
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(activity.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No activities tracked today</p>
                  <Link href="/add">
                    <Button className="gap-2" data-testid="button-start-tracking">
                      <Plus className="h-4 w-4" />
                      Start Tracking
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-lg">Weekly Overview</CardTitle>
              <Link href="/weekly">
                <Button variant="ghost" size="sm" data-testid="link-weekly-details">
                  View Details
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-xl font-bold" data-testid="text-weekly-total">
                      {Math.floor(weeklyStats.totalMinutes / 60)}h {weeklyStats.totalMinutes % 60}m
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Top Activities</p>
                  {weeklyStats.activityBreakdown.slice(0, 3).map((activity) => (
                    <div
                      key={activity.activityType.id}
                      className="flex items-center gap-3"
                      data-testid={`weekly-activity-${activity.activityType.id}`}
                    >
                      <ActivityBadge
                        icon={activity.activityType.icon}
                        color={activity.activityType.color}
                        name={activity.activityType.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.activityType.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(activity.minutes / 60)}h {activity.minutes % 60}m
                        </p>
                      </div>
                      {activity.changePercentage !== 0 && (
                        <div className={`flex items-center gap-1 text-xs ${
                          activity.changePercentage > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {activity.changePercentage > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(Math.round(activity.changePercentage))}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {weeklyStats.insights.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Insights</p>
                    <p className="text-sm" data-testid="text-weekly-insight">
                      {weeklyStats.insights[0]}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Link href="/add" className="md:hidden">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full gradient-primary flex items-center justify-center shadow-lg z-40"
          data-testid="fab-add-activity"
        >
          <Plus className="h-6 w-6 text-white" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
