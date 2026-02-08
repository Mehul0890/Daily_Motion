import { useState } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/lib/activity-context";
import { ActivityBadge } from "@/components/activity-icon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function WeeklyAnalytics() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getWeeklyStats, activities } = useActivity();

  const weeklyStats = getWeeklyStats(selectedDate);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  const goToPreviousWeek = () => setSelectedDate(subWeeks(selectedDate, 1));
  const goToNextWeek = () => setSelectedDate(addWeeks(selectedDate, 1));
  const isCurrentWeek = format(weekStart, "yyyy-MM-dd") === format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const barChartData = weeklyStats.activityBreakdown.map((item) => ({
    name: item.activityType.name,
    minutes: item.minutes,
    hours: Math.round(item.minutes / 60 * 10) / 10,
    color: item.activityType.color,
    change: item.changePercentage,
  }));

  const dailyChartData = weeklyStats.dailyBreakdown.map((day) => ({
    name: format(new Date(day.date), "EEE"),
    date: day.date,
    minutes: day.totalMinutes,
    hours: Math.round(day.totalMinutes / 60 * 10) / 10,
    productive: day.productiveMinutes,
    leisure: day.leisureMinutes,
  }));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 md:pb-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-weekly-title">
            Weekly Report
          </h1>
          <p className="text-muted-foreground">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousWeek}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextWeek}
            disabled={isCurrentWeek}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Time</p>
              <p className="text-3xl font-bold" data-testid="text-weekly-total-time">
                {Math.floor(weeklyStats.totalMinutes / 60)}h {weeklyStats.totalMinutes % 60}m
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
              <p className="text-3xl font-bold" data-testid="text-daily-average">
                {Math.round(weeklyStats.totalMinutes / 7 / 60 * 10) / 10}h
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Activities Tracked</p>
              <p className="text-3xl font-bold" data-testid="text-activities-count">
                {weeklyStats.activityBreakdown.length}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}h`}
                    domain={[0, "auto"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                            <p className="font-medium">{format(new Date(data.date), "EEEE, MMM d")}</p>
                            <p className="text-sm text-muted-foreground">
                              Total: {Math.floor(data.minutes / 60)}h {data.minutes % 60}m
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {dailyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Activity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}h`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm">
                                {Math.floor(data.minutes / 60)}h {data.minutes % 60}m
                              </p>
                              {data.change !== 0 && (
                                <p className={`text-sm ${data.change > 0 ? "text-green-600" : "text-red-600"}`}>
                                  {data.change > 0 ? "+" : ""}{Math.round(data.change)}% vs last week
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No activities tracked this week
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Weekly Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyStats.activityBreakdown.length > 0 ? (
              <div className="space-y-3">
                {weeklyStats.activityBreakdown.slice(0, 5).map((activity) => (
                  <div
                    key={activity.activityType.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-testid={`comparison-${activity.activityType.id}`}
                  >
                    <ActivityBadge
                      icon={activity.activityType.icon}
                      color={activity.activityType.color}
                      name={activity.activityType.name}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.activityType.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {Math.floor(activity.minutes / 60)}h {activity.minutes % 60}m
                        </span>
                        <span>vs</span>
                        <span>
                          {Math.floor(activity.previousWeekMinutes / 60)}h {activity.previousWeekMinutes % 60}m last week
                        </span>
                      </div>
                    </div>
                    {activity.changePercentage !== 0 && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          activity.changePercentage > 0
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comparison data available
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {weeklyStats.insights.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {weeklyStats.insights.map((insight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm"
                    data-testid={`insight-${index}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
