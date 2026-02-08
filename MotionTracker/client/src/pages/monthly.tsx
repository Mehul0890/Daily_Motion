import { useState } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Trophy, AlertTriangle, Lightbulb, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/lib/activity-context";
import { ActivityBadge } from "@/components/activity-icon";
import { cn } from "@/lib/utils";

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

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHeatmapColor(minutes: number, maxMinutes: number): string {
  if (minutes === 0) return "bg-muted/30";
  const intensity = Math.min(minutes / maxMinutes, 1);
  if (intensity < 0.25) return "bg-primary/20";
  if (intensity < 0.5) return "bg-primary/40";
  if (intensity < 0.75) return "bg-primary/60";
  return "bg-primary/80";
}

export default function MonthlyInsights() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getMonthlyStats, getDailyStats } = useActivity();

  const monthlyStats = getMonthlyStats(selectedDate);
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const goToPreviousMonth = () => setSelectedDate(subMonths(selectedDate, 1));
  const goToNextMonth = () => setSelectedDate(addMonths(selectedDate, 1));
  const isCurrentMonth = format(monthStart, "yyyy-MM") === format(new Date(), "yyyy-MM");

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const maxDayMinutes = Math.max(...monthlyStats.dailyHeatmap.map(d => d.minutes), 1);

  const firstDayOfWeek = getDay(monthStart);
  const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const paddingDays = Array(startPadding).fill(null);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const selectedDayStats = selectedDay ? getDailyStats(selectedDay) : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 md:pb-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-monthly-title">
            Monthly Analytics
          </h1>
          <p className="text-muted-foreground">{format(selectedDate, "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            data-testid="button-next-month"
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
              <p className="text-3xl font-bold" data-testid="text-monthly-total">
                {Math.floor(monthlyStats.totalMinutes / 60)}h
              </p>
              <p className="text-sm text-muted-foreground">
                ~{Math.round(monthlyStats.totalMinutes / daysInMonth.length / 60 * 10) / 10}h/day
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Most Productive</p>
              </div>
              <p className="text-lg font-bold" data-testid="text-most-productive-day">
                {monthlyStats.mostProductiveDay
                  ? format(new Date(monthlyStats.mostProductiveDay), "MMM d")
                  : "N/A"}
              </p>
              {monthlyStats.mostProductiveDay && (
                <p className="text-sm text-muted-foreground">
                  {Math.floor(
                    (monthlyStats.dailyHeatmap.find(d => d.date === monthlyStats.mostProductiveDay)?.minutes || 0) / 60
                  )}h tracked
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-muted-foreground">Needs Attention</p>
              </div>
              <p className="text-lg font-bold" data-testid="text-least-productive-day">
                {monthlyStats.leastProductiveDay
                  ? format(new Date(monthlyStats.leastProductiveDay), "MMM d")
                  : "N/A"}
              </p>
              {monthlyStats.leastProductiveDay && (
                <p className="text-sm text-muted-foreground">
                  {Math.floor(
                    (monthlyStats.dailyHeatmap.find(d => d.date === monthlyStats.leastProductiveDay)?.minutes || 0) / 60
                  )}h tracked
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, index) => (
                <div key={`pad-${index}`} className="aspect-square" />
              ))}

              {daysInMonth.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayData = monthlyStats.dailyHeatmap.find(d => d.date === dateStr);
                const minutes = dayData?.minutes || 0;
                const colorClass = getHeatmapColor(minutes, maxDayMinutes);
                const isSelected = selectedDay === dateStr;

                return (
                  <motion.button
                    key={dateStr}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all",
                      colorClass,
                      isToday(day) && "ring-2 ring-primary ring-offset-1",
                      isSelected && "ring-2 ring-foreground",
                      "hover:ring-1 hover:ring-foreground/50"
                    )}
                    title={`${format(day, "MMM d")}: ${Math.floor(minutes / 60)}h ${minutes % 60}m`}
                    data-testid={`day-${dateStr}`}
                  >
                    {format(day, "d")}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-sm bg-muted/30" />
                <div className="h-3 w-3 rounded-sm bg-primary/20" />
                <div className="h-3 w-3 rounded-sm bg-primary/40" />
                <div className="h-3 w-3 rounded-sm bg-primary/60" />
                <div className="h-3 w-3 rounded-sm bg-primary/80" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedDayStats && selectedDayStats.activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {format(new Date(selectedDay!), "EEEE, MMMM d")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedDayStats.activities.map((activity) => (
                  <div
                    key={activity.activityType.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <ActivityBadge
                      icon={activity.activityType.icon}
                      color={activity.activityType.color}
                      name={activity.activityType.name}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.activityType.name}</p>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.floor(activity.minutes / 60)}h {activity.minutes % 60}m
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyStats.topActivities.length > 0 ? (
              <div className="space-y-3">
                {monthlyStats.topActivities.map((activity, index) => (
                  <div
                    key={activity.activityType.id}
                    className="flex items-center gap-3"
                    data-testid={`top-activity-${index}`}
                  >
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <ActivityBadge
                      icon={activity.activityType.icon}
                      color={activity.activityType.color}
                      name={activity.activityType.name}
                      size="md"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{activity.activityType.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(activity.minutes / 60)}h {activity.minutes % 60}m total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {Math.round(activity.minutes / monthlyStats.totalMinutes * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">of total</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No activities tracked this month
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {monthlyStats.suggestions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {monthlyStats.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    data-testid={`suggestion-${index}`}
                  >
                    <span className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-xs font-medium text-accent-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm">{suggestion}</p>
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
