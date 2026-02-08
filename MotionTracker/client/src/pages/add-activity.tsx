import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Clock, Check, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActivity } from "@/lib/activity-context";
import { useToast } from "@/hooks/use-toast";
import { ActivityBadge, ActivityIcon, availableIcons } from "@/components/activity-icon";
import { cn } from "@/lib/utils";

const activitySchema = z.object({
  activityTypeId: z.string().min(1, "Please select an activity"),
  hours: z.number().min(0).max(24),
  minutes: z.number().min(0).max(59),
  notes: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

const customActivitySchema = z.object({
  name: z.string().min(1, "Name is required").max(30),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  category: z.enum(["productive", "leisure", "health", "other"]),
});

type CustomActivityFormValues = z.infer<typeof customActivitySchema>;

const colorOptions = [
  "#3B82F6", "#8B5CF6", "#14B8A6", "#F59E0B", "#EF4444",
  "#EC4899", "#10B981", "#6366F1", "#F97316", "#06B6D4",
];

const quickTimes = [
  { label: "15m", hours: 0, minutes: 15 },
  { label: "30m", hours: 0, minutes: 30 },
  { label: "1h", hours: 1, minutes: 0 },
  { label: "2h", hours: 2, minutes: 0 },
];

export default function AddActivity() {
  const [, setLocation] = useLocation();
  const { activities, addActivity, addLog, logs, deleteLog, getDailyStats } = useActivity();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLogs = logs.filter((log) => log.date === today);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityTypeId: "",
      hours: 0,
      minutes: 30,
      notes: "",
    },
  });

  const customForm = useForm<CustomActivityFormValues>({
    resolver: zodResolver(customActivitySchema),
    defaultValues: {
      name: "",
      icon: "Clock",
      color: "#3B82F6",
      category: "other",
    },
  });

  const hours = form.watch("hours");
  const minutes = form.watch("minutes");

  const incrementHours = () => {
    if (hours < 24) form.setValue("hours", hours + 1);
  };

  const decrementHours = () => {
    if (hours > 0) form.setValue("hours", hours - 1);
  };

  const incrementMinutes = () => {
    if (minutes < 55) {
      form.setValue("minutes", minutes + 5);
    } else if (hours < 24) {
      form.setValue("minutes", 0);
      form.setValue("hours", hours + 1);
    }
  };

  const decrementMinutes = () => {
    if (minutes >= 5) {
      form.setValue("minutes", minutes - 5);
    } else if (hours > 0) {
      form.setValue("minutes", 55);
      form.setValue("hours", hours - 1);
    }
  };

  const setQuickTime = (h: number, m: number) => {
    form.setValue("hours", h);
    form.setValue("minutes", m);
  };

  const onSubmit = (data: ActivityFormValues) => {
    const totalMinutes = data.hours * 60 + data.minutes;
    if (totalMinutes === 0) {
      toast({
        title: "Invalid time",
        description: "Please enter at least 1 minute.",
        variant: "destructive",
      });
      return;
    }

    addLog({
      activityTypeId: data.activityTypeId,
      date: today,
      minutes: totalMinutes,
      notes: data.notes || null,
    });

    const activity = activities.find((a) => a.id === data.activityTypeId);
    toast({
      title: "Activity logged!",
      description: `Added ${data.hours}h ${data.minutes}m of ${activity?.name}`,
    });

    form.reset();
    setSelectedActivity(null);
  };

  const onCreateActivity = (data: CustomActivityFormValues) => {
    addActivity(data);
    toast({
      title: "Activity created!",
      description: `${data.name} has been added to your activities.`,
    });
    customForm.reset();
    setIsCreateDialogOpen(false);
  };

  const handleDeleteLog = (logId: string) => {
    deleteLog(logId);
    toast({
      title: "Activity removed",
      description: "The activity log has been deleted.",
    });
  };

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
    form.setValue("activityTypeId", activityId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-add-activity-title">
            Log Activity
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2" data-testid="button-create-activity">
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Activity</DialogTitle>
            </DialogHeader>
            <Form {...customForm}>
              <form onSubmit={customForm.handleSubmit(onCreateActivity)} className="space-y-4">
                <FormField
                  control={customForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Yoga, Journaling"
                          data-testid="input-custom-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="productive">Productive</SelectItem>
                          <SelectItem value="leisure">Leisure</SelectItem>
                          <SelectItem value="health">Health</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <div className="grid grid-cols-5 gap-2">
                        {availableIcons.slice(0, 10).map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => field.onChange(iconName)}
                            className={cn(
                              "p-2 rounded-lg border transition-colors",
                              field.value === iconName
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                            data-testid={`icon-${iconName}`}
                          >
                            <ActivityIcon icon={iconName} size="md" />
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={customForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="flex gap-2 flex-wrap">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            className={cn(
                              "h-8 w-8 rounded-full transition-transform",
                              field.value === color && "ring-2 ring-offset-2 ring-primary scale-110"
                            )}
                            style={{ backgroundColor: color }}
                            data-testid={`color-${color}`}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" data-testid="button-save-custom">
                  Create Activity
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {activities.map((activity) => (
                  <motion.button
                    key={activity.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleActivitySelect(activity.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                      selectedActivity === activity.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    )}
                    data-testid={`select-activity-${activity.id}`}
                  >
                    <ActivityBadge
                      icon={activity.icon}
                      color={activity.color}
                      name={activity.name}
                      size="md"
                    />
                    <span className="text-xs font-medium text-center line-clamp-1">
                      {activity.name}
                    </span>
                  </motion.button>
                ))}
              </div>
              {form.formState.errors.activityTypeId && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.activityTypeId.message}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementHours}
                    data-testid="button-increment-hours"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <span className="text-4xl font-bold tabular-nums" data-testid="text-hours">
                      {String(hours).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-muted-foreground">hours</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrementHours}
                    data-testid="button-decrement-hours"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <span className="text-4xl font-bold text-muted-foreground">:</span>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={incrementMinutes}
                    data-testid="button-increment-minutes"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="text-center">
                    <span className="text-4xl font-bold tabular-nums" data-testid="text-minutes">
                      {String(minutes).padStart(2, "0")}
                    </span>
                    <p className="text-xs text-muted-foreground">minutes</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={decrementMinutes}
                    data-testid="button-decrement-minutes"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {quickTimes.map((qt) => (
                  <Button
                    key={qt.label}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuickTime(qt.hours, qt.minutes)}
                    data-testid={`quick-time-${qt.label}`}
                  >
                    {qt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any notes about this activity..."
                    className="resize-none"
                    data-testid="input-notes"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full gradient-primary text-white border-0"
            data-testid="button-save-activity"
          >
            <Check className="h-5 w-5 mr-2" />
            Log Activity
          </Button>
        </form>
      </Form>

      {todayLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <AnimatePresence>
                {todayLogs.map((log) => {
                  const activity = activities.find((a) => a.id === log.activityTypeId);
                  if (!activity) return null;

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      data-testid={`log-${log.id}`}
                    >
                      <ActivityBadge
                        icon={activity.icon}
                        color={activity.color}
                        name={activity.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.floor(log.minutes / 60)}h {log.minutes % 60}m
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLog(log.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        data-testid={`delete-log-${log.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
