import React from "react";
import type { ElementType } from "react";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface TextProps extends TypographyProps {
  variant?: "body" | "small" | "muted" | "lead";
  as?: "p" | "span" | "div";
}

// Heading Components
export function Heading({ 
  level = 1, 
  as, 
  children, 
  className = "" 
}: HeadingProps) {

const Component: ElementType = as ?? (`h${level}` as ElementType);

  
  const headingClasses = {
    1: "text-4xl md:text-5xl font-bold text-gray-900",
    2: "text-3xl md:text-4xl font-bold text-gray-900",
    3: "text-2xl md:text-3xl font-semibold text-gray-900",
    4: "text-xl md:text-2xl font-semibold text-gray-900",
    5: "text-lg md:text-xl font-semibold text-gray-900",
    6: "text-base md:text-lg font-semibold text-gray-900",
  };

  return (
    <Component className={`${headingClasses[level]} ${className}`}>
      {children}
    </Component>
  );
}

// Text Components
export function Text({ 
  variant = "body", 
  as = "p", 
  children, 
  className = "" 
}: TextProps) {
  const Component = as;
  
  const textClasses = {
    body: "text-base text-gray-700",
    small: "text-sm text-gray-600",
    muted: "text-sm text-gray-500",
    lead: "text-lg text-gray-600",
  };

  return (
    <Component className={`${textClasses[variant]} ${className}`}>
      {children}
    </Component>
  );
}

// Specialized Text Components
export function Title({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={`text-3xl md:text-4xl font-bold text-gray-900 ${className}`}>
      {children}
    </h1>
  );
}

export function Subtitle({ children, className = "" }: TypographyProps) {
  return (
    <h2 className={`text-xl md:text-2xl font-semibold text-gray-800 ${className}`}>
      {children}
    </h2>
  );
}

export function Caption({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-xs text-gray-500 uppercase tracking-wide ${className}`}>
      {children}
    </p>
  );
}

export function Label({ children, className = "", htmlFor }: TypographyProps & { htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  );
}

export function Error({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-sm text-red-600 ${className}`}>
      {children}
    </p>
  );
}

export function Success({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-sm text-green-600 ${className}`}>
      {children}
    </p>
  );
}
