import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  dot?: boolean;
}

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "cancelled";
  className?: string;
}

interface EventBadgeProps {
  type: "public" | "private" | "draft";
  className?: string;
}

const badgeVariants = {
  default: "bg-gray-100 text-gray-800",
  primary: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-base",
};

export function Badge({ 
  children, 
  variant = "default", 
  size = "md", 
  className = "", 
  dot = false 
}: BadgeProps) {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  const variantClasses = badgeVariants[variant];
  const sizeClasses = badgeSizes[size];
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {dot && (
        <span className="w-1.5 h-1.5 bg-current rounded-full mr-1.5" />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: "success" as const, children: "Aktiv" },
    inactive: { variant: "default" as const, children: "Inaktiv" },
    pending: { variant: "warning" as const, children: "Ausstehend" },
    completed: { variant: "success" as const, children: "Abgeschlossen" },
    cancelled: { variant: "error" as const, children: "Abgebrochen" },
  };

  const config = statusConfig[status] || { variant: "default" as const, children: status || "Unbekannt" };

  return (
    <Badge variant={config.variant} className={className}>
      {config.children}
    </Badge>
  );
}

export function EventBadge({ type, className = "" }: EventBadgeProps) {
  const typeConfig = {
    public: { variant: "success" as const, children: "Öffentlich" },
    private: { variant: "primary" as const, children: "Privat" },
    draft: { variant: "warning" as const, children: "Entwurf" },
  };
  
  const config = typeConfig[type];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.children}
    </Badge>
  );
}

interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function NotificationBadge({ count, max = 99, className = "" }: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${className}`}>
      {displayCount}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "urgent";
  className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { variant: "info" as const, children: "Niedrig" },
    medium: { variant: "warning" as const, children: "Mittel" },
    high: { variant: "error" as const, children: "Hoch" },
    urgent: { variant: "error" as const, children: "Dringend" },
  };
  
  const config = priorityConfig[priority];
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.children}
    </Badge>
  );
}
