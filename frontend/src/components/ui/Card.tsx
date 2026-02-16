import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const shadowClasses = {
  none: "",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export function Card({ 
  children, 
  className = "", 
  padding = "md", 
  shadow = "sm", 
  border = true,
  hover = false,
  onClick
}: CardProps) {
  const baseClasses = "bg-white rounded-lg";
  const paddingClass = paddingClasses[padding];
  const shadowClass = shadowClasses[shadow];
  const borderClass = border ? "border border-gray-200" : "";
  const hoverClass = hover ? "hover:shadow-lg transition-shadow duration-200" : "";
  
  return (
    <div
      className={`${baseClasses} ${paddingClass} ${shadowClass} ${borderClass} ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", as: Component = "h3" }: CardTitleProps) {
  return (
    <Component className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

// Specialized Card Components
interface EventCardProps {
  title: string;
  description: string;
  date: string;
  location?: string;
  participants?: number;
  maxParticipants?: number;
  isPublic?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EventCard({ 
  title, 
  description, 
  date, 
  location, 
  participants, 
  maxParticipants, 
  isPublic = true,
  onClick,
  className = "" 
}: EventCardProps) {
  return (
    <Card 
      className={`cursor-pointer ${className}`} 
      hover={true}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{title}</CardTitle>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPublic ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {isPublic ? 'Öffentlich' : 'Privat'}
          </span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            <span>{new Date(date).toLocaleDateString('de-DE')}</span>
          </div>
          
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📍</span>
              <span>{location}</span>
            </div>
          )}
          
          {maxParticipants && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">👥</span>
              <span>{participants || 0} / {maxParticipants} Teilnehmer</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  className?: string;
}

export function UserCard({ name, email, avatar, role, className = "" }: UserCardProps) {
  return (
    <Card className={className}>
      <CardBody>
        <div className="flex items-center space-x-3">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-sm text-gray-500 truncate">{email}</p>
            {role && (
              <p className="text-xs text-gray-400">{role}</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
