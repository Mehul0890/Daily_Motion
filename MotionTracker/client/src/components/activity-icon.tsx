import {
  Briefcase,
  BookOpen,
  Dumbbell,
  Moon,
  Book,
  Smartphone,
  Gamepad2,
  Brain,
  ChefHat,
  Palette,
  Clock,
  Music,
  Coffee,
  Tv,
  Plane,
  Heart,
  ShoppingCart,
  MessageCircle,
  Camera,
  Pencil,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  BookOpen,
  Dumbbell,
  Moon,
  Book,
  Smartphone,
  Gamepad2,
  Brain,
  ChefHat,
  Palette,
  Clock,
  Music,
  Coffee,
  Tv,
  Plane,
  Heart,
  ShoppingCart,
  MessageCircle,
  Camera,
  Pencil,
};

export const availableIcons = Object.keys(iconMap);

type ActivityIconProps = {
  icon: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function ActivityIcon({ icon, color, size = "md", className = "" }: ActivityIconProps) {
  const IconComponent = iconMap[icon] || Clock;
  const sizeClass = sizeClasses[size];

  return (
    <IconComponent
      className={`${sizeClass} ${className}`}
      style={color ? { color } : undefined}
    />
  );
}

type ActivityBadgeProps = {
  icon: string;
  color: string;
  name: string;
  size?: "sm" | "md" | "lg";
};

const badgeSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function ActivityBadge({ icon, color, name, size = "md" }: ActivityBadgeProps) {
  const badgeSize = badgeSizes[size];

  return (
    <div
      className={`${badgeSize} rounded-xl flex items-center justify-center`}
      style={{ backgroundColor: `${color}20` }}
      title={name}
    >
      <ActivityIcon icon={icon} color={color} size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} />
    </div>
  );
}
