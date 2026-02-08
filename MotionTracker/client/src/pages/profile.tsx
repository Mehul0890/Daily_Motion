import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, LogOut, Edit2, Save, X, Trophy, Flame, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { useActivity } from "@/lib/activity-context";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, updateUser, logout } = useAuth();
  const { streak, logs, getMonthlyStats } = useActivity();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || "",
      email: user?.email || "",
    },
  });

  const monthlyStats = getMonthlyStats(new Date());
  const totalLogsCount = logs.length;
  const daysTracked = new Set(logs.map(l => l.date)).size;

  const onSubmit = (data: ProfileFormValues) => {
    updateUser({
      displayName: data.displayName,
      email: data.email || undefined,
    });
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been saved.",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    setLocation("/login");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 md:pb-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" data-testid="text-profile-title">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account and view stats
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white">
                    {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Flame className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                data-testid="input-display-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                data-testid="input-email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" data-testid="button-save-profile">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                          data-testid="button-cancel-edit"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold" data-testid="text-display-name">
                      {user?.displayName || user?.username}
                    </h2>
                    <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                      <User className="h-4 w-4" />
                      @{user?.username}
                    </p>
                    {user?.email && (
                      <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </p>
                    )}
                    <div className="flex justify-center sm:justify-start gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        data-testid="button-edit-profile"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        data-testid="button-logout"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-current-streak">
                {streak.currentStreak}
              </p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-longest-streak">
                {streak.longestStreak}
              </p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-logs">
                {totalLogsCount}
              </p>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-days-tracked">
                {daysTracked}
              </p>
              <p className="text-sm text-muted-foreground">Days Tracked</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Month</CardTitle>
            <CardDescription>
              {format(new Date(), "MMMM yyyy")} summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Total Hours</span>
                <span className="font-bold" data-testid="text-monthly-hours">
                  {Math.floor(monthlyStats.totalMinutes / 60)}h {monthlyStats.totalMinutes % 60}m
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Activities Tracked</span>
                <span className="font-bold" data-testid="text-monthly-activities">
                  {monthlyStats.topActivities.length}
                </span>
              </div>
              {monthlyStats.mostProductiveDay && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Best Day</span>
                  <span className="font-bold" data-testid="text-best-day">
                    {format(new Date(monthlyStats.mostProductiveDay), "MMM d")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Achievements</CardTitle>
            <CardDescription>
              Your milestones and badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                className={`flex flex-col items-center p-4 rounded-xl border ${
                  streak.currentStreak >= 7
                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                    : "bg-muted/30 opacity-50"
                }`}
                data-testid="badge-7-day-streak"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-2">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">7 Day Streak</p>
              </div>

              <div
                className={`flex flex-col items-center p-4 rounded-xl border ${
                  daysTracked >= 30
                    ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
                    : "bg-muted/30 opacity-50"
                }`}
                data-testid="badge-30-days"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">30 Days Active</p>
              </div>

              <div
                className={`flex flex-col items-center p-4 rounded-xl border ${
                  totalLogsCount >= 100
                    ? "bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20"
                    : "bg-muted/30 opacity-50"
                }`}
                data-testid="badge-100-logs"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">100 Entries</p>
              </div>

              <div
                className={`flex flex-col items-center p-4 rounded-xl border ${
                  streak.longestStreak >= 30
                    ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20"
                    : "bg-muted/30 opacity-50"
                }`}
                data-testid="badge-30-streak"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-center">30 Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
