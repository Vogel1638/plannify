import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: boolean;
}

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
}

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  wrap?: boolean;
  gap?: "sm" | "md" | "lg";
}

interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

const containerSizes = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const gridCols = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

const gaps = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export function Container({ 
  children, 
  className = "", 
  size = "lg", 
  padding = true 
}: ContainerProps) {
  const sizeClass = containerSizes[size];
  const paddingClass = padding ? "px-4 sm:px-6 lg:px-8" : "";
  
  return (
    <div className={`mx-auto ${sizeClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

export function Grid({ 
  children, 
  className = "", 
  cols = 3, 
  gap = "md" 
}: GridProps) {
  const colsClass = gridCols[cols];
  const gapClass = gaps[gap];
  
  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

export function Flex({ 
  children, 
  className = "", 
  direction = "row", 
  justify = "start", 
  align = "start", 
  wrap = false,
  gap = "md"
}: FlexProps) {
  const directionClass = direction === "col" ? "flex-col" : "flex-row";
  const justifyClass = `justify-${justify}`;
  const alignClass = `items-${align}`;
  const wrapClass = wrap ? "flex-wrap" : "flex-nowrap";
  const gapClass = gaps[gap];
  
  return (
    <div className={`flex ${directionClass} ${justifyClass} ${alignClass} ${wrapClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

type Spacing = "none" | "sm" | "md" | "lg" | "xl";

const spacingClasses: Record<Spacing, string> = {
  none: "",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};


export function Stack({
  children,
  className = "",
  spacing = "md",
}: StackProps & { spacing?: Spacing }) {
  const spacingClass = spacingClasses[spacing];

  return (
    <div className={`${spacingClass} ${className}`}>
      {children}
    </div>
  );
}

export function Divider({ 
  className = "", 
  orientation = "horizontal" 
}: DividerProps) {
  const orientationClass = orientation === "vertical" ? "w-px h-full" : "h-px w-full";
  
  return (
    <div className={`bg-gray-200 ${orientationClass} ${className}`} />
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  background?: "white" | "gray" | "transparent";
}

const sectionPadding = {
  none: "",
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
};

const sectionBackground = {
  white: "bg-white",
  gray: "bg-gray-50",
  transparent: "",
};

export function Section({ 
  children, 
  className = "", 
  padding = "md", 
  background = "white" 
}: SectionProps) {
  const paddingClass = sectionPadding[padding];
  const backgroundClass = sectionBackground[background];
  
  return (
    <section className={`${paddingClass} ${backgroundClass} ${className}`}>
      {children}
    </section>
  );
}

interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const spacerSizes = {
  xs: "h-2",
  sm: "h-4",
  md: "h-8",
  lg: "h-12",
  xl: "h-16",
};

export function Spacer({ size = "md", className = "" }: SpacerProps) {
  return <div className={`${spacerSizes[size]} ${className}`} />;
}
