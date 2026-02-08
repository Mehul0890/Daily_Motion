import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, Sun, Clock, Trash2, Download, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const reminderTimes = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
];

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );
  const [reminderTime, setReminderTime] = useState(user?.dailyReminderTime ?? "09:00");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      toast({
        title: "Notifications enabled",
        description: "You'll receive daily reminders to track your activities.",
      });
      setNotificationsEnabled(true);
      updateUser({ notificationsEnabled: true });

      new Notification("Daily Motion", {
        body: "Notifications are now enabled!",
        icon: "/favicon.png",
      });
    } else {
      toast({
        title: "Permission denied",
        description: "You can enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== "granted") {
      await requestNotificationPermission();
    } else {
      setNotificationsEnabled(enabled);
      updateUser({ notificationsEnabled: enabled });
      toast({
        title: enabled ? "Notifications enabled" : "Notifications disabled",
        description: enabled
          ? "You'll receive reminders to track your activities."
          : "You won't receive any notifications.",
      });
    }
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    updateUser({ dailyReminderTime: time });
    toast({
      title: "Reminder time updated",
      description: `Daily reminders will be sent at ${reminderTimes.find(t => t.value === time)?.label}`,
    });
  };

  const handleClearData = () => {
    localStorage.clear();
    toast({
      title: "Data cleared",
      description: "All your data has been deleted. The page will reload.",
    });
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleExportData = () => {
    const data = {
      activities: localStorage.getItem("daily-motion-activities"),
      logs: localStorage.getItem("daily-motion-logs"),
      streak: localStorage.getItem("daily-motion-streak"),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-motion-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been downloaded as a JSON file.",
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20 md:pb-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your preferences and app settings
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how Daily Motion looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={resolvedTheme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  data-testid="button-theme-light"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={resolvedTheme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  data-testid="button-theme-dark"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure reminder notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationPermission === "denied" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Notifications are blocked. Please enable them in your browser settings.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded to track your activities
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
                disabled={notificationPermission === "denied"}
                data-testid="switch-notifications"
              />
            </div>

            {notificationsEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <Label>Reminder Time</Label>
                  <p className="text-sm text-muted-foreground">
                    When to send daily reminders
                  </p>
                </div>
                <Select value={reminderTime} onValueChange={handleReminderTimeChange}>
                  <SelectTrigger className="w-[140px]" data-testid="select-reminder-time">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTimes.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your activities and logs
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData} data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" data-testid="button-delete-data">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your activities, logs, and settings will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="button-confirm-delete"
                      >
                        Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Daily Motion is a habit tracking app designed to help you visualize and improve your daily routines.
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
