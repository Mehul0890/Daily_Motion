import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Plus, BarChart3, Calendar, Settings, User, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { useActivity } from "@/lib/activity-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/add", icon: Plus, label: "Add" },
  { href: "/weekly", icon: BarChart3, label: "Weekly" },
  { href: "/monthly", icon: Calendar, label: "Monthly" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function TopNav() {
  const { streak } = useActivity();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline">Daily Motion</span>
        </Link>

        <div className="flex items-center gap-2">
          {streak.currentStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400"
              data-testid="text-streak-counter"
            >
              <Flame className="h-4 w-4" />
              <span className="font-semibold text-sm">{streak.currentStreak}</span>
            </motion.div>
          )}
          
          <ThemeToggle />
          
          <Link href="/profile" data-testid="link-profile">
            <Avatar className="h-9 w-9 border-2 border-primary/20 hover-elevate cursor-pointer">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-medium">
                {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className="relative flex flex-col items-center justify-center w-16 h-14"
            >
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-1 rounded-xl bg-primary/10"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10", item.href === "/add" && "h-6 w-6")} />
                <span className="text-xs font-medium relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav() {
  const [location] = useLocation();
  const { streak } = useActivity();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 glass border-r border-border/50 p-4">
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Daily Motion</h1>
          <p className="text-xs text-muted-foreground">Track your habits</p>
        </div>
      </div>

      {streak.currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
          data-testid="text-streak-sidebar"
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {streak.currentStreak} day streak!
              </p>
              <p className="text-xs text-muted-foreground">
                Best: {streak.longestStreak} days
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`sidenav-${item.label.toLowerCase()}`}
            >
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover-elevate"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSideNav"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", duration: 0.3 }}
                  />
                )}
                <Icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border/50">
        <Link href="/profile" data-testid="sidenav-profile">
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover-elevate"
            whileHover={{ x: 4 }}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
