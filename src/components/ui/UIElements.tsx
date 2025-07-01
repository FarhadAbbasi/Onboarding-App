import React from "react";

/* ------------------------------------------------------------------
   🧩 ZERO‑DEPENDENCY, DYNAMIC UI ELEMENTS (React + TailwindCSS)
   ------------------------------------------------------------------
   • No external design system — only plain JSX + utility classes
   • Ideal for drag‑and‑drop builders or static sites
   • TypeScript‑friendly with comprehensive customization options
   • Dynamic theming and styling capabilities
   ------------------------------------------------------------------ */

//   IMPORT:
//   Headline,  Subheadline,  CTA,  FeatureCard,
//   TextInput,  StyledLink,  AlertMessage,  Testimonial,  Footer,

// Utility to merge class names ------------------------------------------------
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ────────────────────────────────────────────────────────────────────────────
// Primitive building blocks (Button, Card, Input, Alert, Separator)
// ────────────────────────────────────────────────────────────────────────────

type PrimitiveProps<T extends keyof React.JSX.IntrinsicElements> = {
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

// Color scheme type for dynamic theming
export type ColorScheme = 
  | "indigo" | "blue" | "green" | "red" | "yellow" | "purple" 
  | "pink" | "gray" | "emerald" | "cyan" | "orange" | "slate";

export type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// Color utility functions
const getColorClasses = (color: ColorScheme, variant: 'solid' | 'outline' | 'ghost' = 'solid') => {
  const colorMap = {
    indigo: {
      solid: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-600",
      outline: "border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-600",
      ghost: "text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-600"
    },
    blue: {
      solid: "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-600",
      outline: "border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-600",
      ghost: "text-blue-600 hover:bg-blue-50 focus:ring-blue-600"
    },
    green: {
      solid: "bg-green-600 text-white hover:bg-green-500 focus:ring-green-600",
      outline: "border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-600",
      ghost: "text-green-600 hover:bg-green-50 focus:ring-green-600"
    },
    red: {
      solid: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-600",
      outline: "border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-600",
      ghost: "text-red-600 hover:bg-red-50 focus:ring-red-600"
    },
    yellow: {
      solid: "bg-yellow-600 text-white hover:bg-yellow-500 focus:ring-yellow-600",
      outline: "border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-600",
      ghost: "text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-600"
    },
    purple: {
      solid: "bg-purple-600 text-white hover:bg-purple-500 focus:ring-purple-600",
      outline: "border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-600",
      ghost: "text-purple-600 hover:bg-purple-50 focus:ring-purple-600"
    },
    pink: {
      solid: "bg-pink-600 text-white hover:bg-pink-500 focus:ring-pink-600",
      outline: "border-pink-600 text-pink-600 hover:bg-pink-50 focus:ring-pink-600",
      ghost: "text-pink-600 hover:bg-pink-50 focus:ring-pink-600"
    },
    gray: {
      solid: "bg-gray-600 text-white hover:bg-gray-500 focus:ring-gray-600",
      outline: "border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-600",
      ghost: "text-gray-600 hover:bg-gray-50 focus:ring-gray-600"
    },
    emerald: {
      solid: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-600",
      outline: "border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-600",
      ghost: "text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-600"
    },
    cyan: {
      solid: "bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-600",
      outline: "border-cyan-600 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-600",
      ghost: "text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-600"
    },
    orange: {
      solid: "bg-orange-600 text-white hover:bg-orange-500 focus:ring-orange-600",
      outline: "border-orange-600 text-orange-600 hover:bg-orange-50 focus:ring-orange-600",
      ghost: "text-orange-600 hover:bg-orange-50 focus:ring-orange-600"
    },
    slate: {
      solid: "bg-slate-600 text-white hover:bg-slate-500 focus:ring-slate-600",
      outline: "border-slate-600 text-slate-600 hover:bg-slate-50 focus:ring-slate-600",
      ghost: "text-slate-600 hover:bg-slate-50 focus:ring-slate-600"
    }
  };
  return colorMap[color][variant];
};

// Text color utility for components
const getTextColorClasses = (color: ColorScheme, variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
  const colorMap = {
    indigo: {
      primary: "text-indigo-900",
      secondary: "text-indigo-600", 
      accent: "text-indigo-500"
    },
    blue: {
      primary: "text-blue-900",
      secondary: "text-blue-600",
      accent: "text-blue-500"
    },
    green: {
      primary: "text-green-900",
      secondary: "text-green-600",
      accent: "text-green-500"
    },
    red: {
      primary: "text-red-900",
      secondary: "text-red-600",
      accent: "text-red-500"
    },
    yellow: {
      primary: "text-yellow-900",
      secondary: "text-yellow-600",
      accent: "text-yellow-500"
    },
    purple: {
      primary: "text-purple-900",
      secondary: "text-purple-600",
      accent: "text-purple-500"
    },
    pink: {
      primary: "text-pink-900",
      secondary: "text-pink-600",
      accent: "text-pink-500"
    },
    gray: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      accent: "text-gray-500"
    },
    emerald: {
      primary: "text-emerald-900",
      secondary: "text-emerald-600",
      accent: "text-emerald-500"
    },
    cyan: {
      primary: "text-cyan-900",
      secondary: "text-cyan-600",
      accent: "text-cyan-500"
    },
    orange: {
      primary: "text-orange-900",
      secondary: "text-orange-600",
      accent: "text-orange-500"
    },
    slate: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      accent: "text-slate-500"
    }
  };
  return colorMap[color][variant];
};

// Background color utility for components
const getBackgroundColorClasses = (color: ColorScheme, variant: 'light' | 'medium' | 'dark' = 'light') => {
  const colorMap = {
    indigo: {
      light: "bg-indigo-50",
      medium: "bg-indigo-100", 
      dark: "bg-indigo-200"
    },
    blue: {
      light: "bg-blue-50",
      medium: "bg-blue-100",
      dark: "bg-blue-200"
    },
    green: {
      light: "bg-green-50",
      medium: "bg-green-100",
      dark: "bg-green-200"
    },
    red: {
      light: "bg-red-50",
      medium: "bg-red-100",
      dark: "bg-red-200"
    },
    yellow: {
      light: "bg-yellow-50",
      medium: "bg-yellow-100",
      dark: "bg-yellow-200"
    },
    purple: {
      light: "bg-purple-50",
      medium: "bg-purple-100",
      dark: "bg-purple-200"
    },
    pink: {
      light: "bg-pink-50",
      medium: "bg-pink-100",
      dark: "bg-pink-200"
    },
    gray: {
      light: "bg-gray-50",
      medium: "bg-gray-100",
      dark: "bg-gray-200"
    },
    emerald: {
      light: "bg-emerald-50",
      medium: "bg-emerald-100",
      dark: "bg-emerald-200"
    },
    cyan: {
      light: "bg-cyan-50",
      medium: "bg-cyan-100",
      dark: "bg-cyan-200"
    },
    orange: {
      light: "bg-orange-50",
      medium: "bg-orange-100",
      dark: "bg-orange-200"
    },
    slate: {
      light: "bg-slate-50",
      medium: "bg-slate-100",
      dark: "bg-slate-200"
    }
  };
  return colorMap[color][variant];
};

// Gradient text utility for special effects
const getGradientTextClasses = (color: ColorScheme) => {
  const gradientMap = {
    indigo: "bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent",
    blue: "bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent",
    green: "bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent",
    red: "bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent",
    yellow: "bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent",
    purple: "bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent",
    pink: "bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent",
    gray: "bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent",
    emerald: "bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent",
    cyan: "bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent",
    orange: "bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent",
    slate: "bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent"
  };
  return gradientMap[color];
};

// Icon color utilities for components with icons
const getIconClasses = (color: ColorScheme, variant: 'background' | 'text' | 'solid' = 'background') => {
  const iconColorMap = {
    indigo: {
      background: "bg-indigo-100 text-indigo-600",
      text: "text-indigo-600", 
      solid: "bg-indigo-500"
    },
    blue: {
      background: "bg-blue-100 text-blue-600",
      text: "text-blue-600",
      solid: "bg-blue-500"
    },
    green: {
      background: "bg-green-100 text-green-600", 
      text: "text-green-600",
      solid: "bg-green-500"
    },
    red: {
      background: "bg-red-100 text-red-600",
      text: "text-red-600", 
      solid: "bg-red-500"
    },
    yellow: {
      background: "bg-yellow-100 text-yellow-600",
      text: "text-yellow-600",
      solid: "bg-yellow-500"
    },
    purple: {
      background: "bg-purple-100 text-purple-600",
      text: "text-purple-600",
      solid: "bg-purple-500"
    },
    pink: {
      background: "bg-pink-100 text-pink-600",
      text: "text-pink-600",
      solid: "bg-pink-500"
    },
    gray: {
      background: "bg-gray-100 text-gray-600",
      text: "text-gray-600",
      solid: "bg-gray-500"
    },
    emerald: {
      background: "bg-emerald-100 text-emerald-600",
      text: "text-emerald-600",
      solid: "bg-emerald-500"
    },
    cyan: {
      background: "bg-cyan-100 text-cyan-600",
      text: "text-cyan-600",
      solid: "bg-cyan-500"
    },
    orange: {
      background: "bg-orange-100 text-orange-600",
      text: "text-orange-600",
      solid: "bg-orange-500"
    },
    slate: {
      background: "bg-slate-100 text-slate-600",
      text: "text-slate-600",
      solid: "bg-slate-500"
    }
  };
  return iconColorMap[color][variant];
};

const getSizeClasses = (size: Size, type: 'text' | 'padding' | 'icon' = 'text') => {
  const sizeMap = {
    text: {
      xs: "text-xs",
      sm: "text-sm", 
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl"
    },
    padding: {
      xs: "px-2 py-1",
      sm: "px-3 py-1.5",
      md: "px-4 py-2", 
      lg: "px-6 py-3",
      xl: "px-8 py-4",
      "2xl": "px-10 py-5"
    },
    icon: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6", 
      xl: "h-8 w-8",
      "2xl": "h-10 w-10"
    }
  };
  return sizeMap[type][size];
};

// 1. Enhanced Button ---------------------------------------------------------
export interface ButtonProps extends PrimitiveProps<"button"> {
  variant?: "solid" | "outline" | "ghost";
  colorScheme?: ColorScheme;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "solid",
  colorScheme = "indigo",
  size = "md",
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const variantClasses = variant === "outline" ? "border" : variant === "ghost" ? "" : "";
  const colorClasses = getColorClasses(colorScheme, variant);
  const sizeClasses = getSizeClasses(size, 'padding');
  const textSizeClasses = getSizeClasses(size, 'text');
  
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        baseClasses,
        variantClasses,
        colorClasses,
        sizeClasses,
        textSizeClasses,
        className,
      )}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : leftIcon ? (
        <span className={cn("mr-2", getSizeClasses(size, 'icon'))}>{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !isLoading && (
        <span className={cn("ml-2", getSizeClasses(size, 'icon'))}>{rightIcon}</span>
      )}
    </button>
  );
};

// 2. Enhanced Card -----------------------------------------------------------
export interface CardProps extends PrimitiveProps<"div"> {
  variant?: "default" | "bordered" | "shadow" | "elevated";
  colorScheme?: ColorScheme;
  padding?: Size;
}

export const Card: React.FC<CardProps> = ({ 
  className, 
  variant = "default",
  colorScheme,
  padding = "lg",
  ...props 
}) => {
  const baseClasses = "rounded-2xl bg-white";
  const variantClasses = {
    default: "border border-gray-100 shadow-sm",
    bordered: "border-2 border-gray-200",
    shadow: "shadow-md",
    elevated: "shadow-lg shadow-gray-200/50"
  }[variant];
  
  const paddingClasses = {
    xs: "p-2",
    sm: "p-3", 
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
    "2xl": "p-10"
  }[padding];

  const colorClasses = colorScheme ? `border-${colorScheme}-200 bg-${colorScheme}-50/30` : "";
  
  return (
    <div
      {...props}
      className={cn(baseClasses, variantClasses, paddingClasses, colorClasses, className)}
    />
  );
};

export const CardHeader: React.FC<PrimitiveProps<"div">> = ({ className, ...props }) => (
  <div {...props} className={cn("mb-4", className)} />
);

export const CardContent: React.FC<PrimitiveProps<"div">> = ({ className, ...props }) => (
  <div {...props} className={cn("", className)} />
);

// 3. Enhanced Input ----------------------------------------------------------
export interface InputProps extends Omit<PrimitiveProps<"input">, "size"> {
  variant?: "default" | "filled" | "flushed";
  colorScheme?: ColorScheme;
  size?: Size;
  error?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  className, 
  variant = "default",
  colorScheme = "indigo",
  size = "md",
  error,
  ...props 
}) => {
  const baseClasses = "block w-full rounded-md transition-colors duration-150 placeholder-gray-400 focus:outline-none";
  
  const variantClasses = {
    default: "border bg-white shadow-sm",
    filled: "border-0 bg-gray-100",
    flushed: "border-0 border-b-2 rounded-none bg-transparent px-0"
  }[variant];

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base", 
    xl: "px-5 py-4 text-lg",
    "2xl": "px-6 py-5 text-xl"
  }[size];

  const colorClasses = error 
    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500"
    : `border-gray-300 focus:border-${colorScheme}-500 focus:ring-2 focus:ring-${colorScheme}-500`;
  
  return (
    <input
      {...props}
      className={cn(baseClasses, variantClasses, sizeClasses, colorClasses, className)}
    />
  );
};

// 4. Enhanced Alert ----------------------------------------------------------
export interface AlertProps extends PrimitiveProps<"div"> {
  variant?: "info" | "success" | "error" | "warning";
  colorScheme?: ColorScheme;
}

export const Alert: React.FC<AlertProps> = ({ 
  className, 
  variant = "info",
  colorScheme,
  ...props 
}) => {
  const baseClasses = "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-sm";
  
  const variantClasses = colorScheme ? {
    info: `border-${colorScheme}-200 bg-${colorScheme}-50 text-${colorScheme}-700`,
    success: `border-${colorScheme}-200 bg-${colorScheme}-50 text-${colorScheme}-700`,
    error: `border-${colorScheme}-200 bg-${colorScheme}-50 text-${colorScheme}-700`,
    warning: `border-${colorScheme}-200 bg-${colorScheme}-50 text-${colorScheme}-700`
  }[variant] : {
    info: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700"
  }[variant];
  
  return (
    <div
      {...props}
      role="alert"
      className={cn(baseClasses, variantClasses, className)}
    />
  );
};

export const AlertTitle: React.FC<PrimitiveProps<"span">> = ({ className, ...props }) => (
  <span {...props} className={cn("font-medium", className)} />
);

export const AlertDescription: React.FC<PrimitiveProps<"div">> = ({ className, ...props }) => (
  <div {...props} className={cn("", className)} />
);

// 5. Enhanced Separator ------------------------------------------------------
export interface SeparatorProps extends PrimitiveProps<"hr"> {
  colorScheme?: ColorScheme;
  thickness?: "thin" | "medium" | "thick";
}

export const Separator: React.FC<SeparatorProps> = ({ 
  className, 
  colorScheme = "gray",
  thickness = "thin",
  ...props 
}) => {
  const thicknessClasses = {
    thin: "border-t",
    medium: "border-t-2", 
    thick: "border-t-4"
  }[thickness];
  
  const colorClasses = `border-${colorScheme}-200`;
  
  return (
    <hr {...props} className={cn(thicknessClasses, colorClasses, className)} />
  );
};

// ────────────────────────────────────────────────────────────────────────────
// Enhanced Composite / Themed Elements
// ────────────────────────────────────────────────────────────────────────────

// 1️⃣ Enhanced Headline ------------------------------------------------------
export interface HeadlineProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  align?: "left" | "center" | "right";
  colorScheme?: ColorScheme;
  className?: string;
  gradient?: boolean;
}

export const Headline: React.FC<HeadlineProps> = ({
  children,
  as = "h1",
  size = "2xl",
  align = "center",
  colorScheme,
  className,
  gradient = false,
}) => {
  const Tag = as as any;
  
  const sizeClasses = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl", 
    lg: "text-2xl md:text-3xl",
    xl: "text-3xl md:text-4xl",
    "2xl": "text-4xl md:text-5xl",
    "3xl": "text-5xl md:text-6xl",
    "4xl": "text-6xl md:text-7xl"
  }[size];
  
  const alignClasses = {
    left: "text-left",
    center: "text-center", 
    right: "text-right"
  }[align];

  const colorClasses = colorScheme 
    ? gradient 
      ? getGradientTextClasses(colorScheme)
      : getTextColorClasses(colorScheme, 'primary')
    : "text-gray-900";

  const baseClasses = "font-bold tracking-tight leading-tight";
  
  return (
    <Tag className={cn(baseClasses, sizeClasses, alignClasses, colorClasses, className)}>
      {children}
    </Tag>
  );
};

// 2️⃣ Enhanced Subheadline ---------------------------------------------------
export interface SubheadlineProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  size?: Size;
  colorScheme?: ColorScheme;
  className?: string;
}

export const Subheadline: React.FC<SubheadlineProps> = ({
  children,
  align = "center",
  size = "lg",
  colorScheme,
  className,
}) => {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }[align];
  
  const sizeClasses = getSizeClasses(size, 'text');
  const colorClasses = colorScheme ? getTextColorClasses(colorScheme, 'secondary') : "text-gray-600";
  
  return (
    <p className={cn("mt-2", sizeClasses, alignClasses, colorClasses, className)}>
      {children}
    </p>
  );
};

// 3️⃣ Enhanced CTA Section --------------------------------------------------
export interface CTAProps {
  button_text: string;
  headline?: string;
  colorScheme?: ColorScheme;
  size?: Size;
  variant?: "solid" | "outline" | "ghost";
  headlineSize?: Size;
  headlineColorScheme?: ColorScheme;
  className?: string;
}

export const CTA: React.FC<CTAProps> = ({ 
  button_text,
  headline,
  colorScheme = "indigo",
  size = "lg",
  variant = "solid",
  headlineSize = "xl",
  headlineColorScheme = "gray",
  className
}) => {
  const headlineSizeMap = {
    xs: "text-lg",
    sm: "text-xl", 
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl"
  }[headlineSize];

  const headlineColorClass = headlineColorScheme !== 'gray' 
    ? getGradientTextClasses(headlineColorScheme)
    : getTextColorClasses(headlineColorScheme, 'primary');

  return (
    <div className={cn("text-center space-y-6 py-8", className)}>
      {headline && (
        <div className={cn(
          headlineSizeMap, 
          headlineColorClass,
          "font-bold leading-tight"
        )}>
          {headline}
        </div>
      )}
      <div className="flex justify-center">
        <Button 
          size={size}
          colorScheme={colorScheme}
          variant={variant}
          className={cn(
            "font-semibold shadow-lg transform transition-all duration-200", 
            "hover:scale-105 hover:shadow-xl",
            size === "lg" ? "px-8 py-4 text-lg" : size === "xl" ? "px-10 py-5 text-xl" : ""
          )}
        >
          {button_text}
        </Button>
      </div>
    </div>
  );
};

// 🎯 Enhanced Feature List --------------------------------------------------
export interface FeatureListProps {
  title?: string;
  features: string[];
  colorScheme?: ColorScheme;
  size?: Size;
  titleSize?: Size;
  titleColorScheme?: ColorScheme;
  variant?: "bullets" | "checkmarks" | "numbers" | "icons";
  className?: string;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  title = "Key Features",
  features,
  colorScheme = "indigo",
  size = "md",
  titleSize = "xl",
  titleColorScheme = "gray",
  variant = "checkmarks",
  className
}) => {
  const getIcon = (index: number) => {
    switch (variant) {
      case "checkmarks":
        return (
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", getIconClasses(colorScheme, 'background'))}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "bullets":
        return <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-2", getIconClasses(colorScheme, 'solid'))} />;
      case "numbers":
        return (
          <div className={cn("w-6 h-6 rounded-full text-white flex items-center justify-center text-sm font-semibold flex-shrink-0", getIconClasses(colorScheme, 'solid'))}>
            {index + 1}
          </div>
        );
      case "icons":
        return (
          <div className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0", getIconClasses(colorScheme, 'background'))}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const titleSizeMap = {
    xs: "text-sm",
    sm: "text-base", 
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
    "2xl": "text-3xl"
  }[titleSize];

  const featureSizeMap = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl"
  }[size];

  return (
    <div className={cn("space-y-6", className)}>
      {title && (
        <div className={cn(titleSizeMap, getTextColorClasses(titleColorScheme, 'primary'), "font-bold text-center mb-8")}>
          {title}
        </div>
      )}
      
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            {getIcon(index)}
            <span className={cn(featureSizeMap, "text-gray-700 leading-relaxed")}>
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4️⃣ Enhanced Feature Card --------------------------------------------------
export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorScheme?: ColorScheme;
  variant?: "default" | "bordered" | "shadow" | "elevated";
  iconSize?: Size;
  className?: string;
  hover?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description,
  colorScheme = "indigo",
  variant = "default",
  iconSize = "lg",
  className,
  hover = true
}) => {
  const hoverClasses = hover ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1" : "";
  const iconClasses = cn("flex items-center justify-center rounded-full mb-2", getIconClasses(colorScheme, 'background'));
  const iconSizeClasses = {
    xs: "h-8 w-8",
    sm: "h-10 w-10", 
    md: "h-12 w-12",
    lg: "h-14 w-14",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20"
  }[iconSize];

  return (
    <Card 
      variant={variant}
      className={cn("flex h-full flex-col items-center text-center", hoverClasses, className)}
    >
      <CardHeader>
        <div className={cn(iconClasses, iconSizeClasses)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

// 5️⃣ Enhanced Text Input ----------------------------------------------------
export interface TextInputProps extends InputProps {
  label?: string;
  message?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ 
  label, 
  message, 
  error, 
  leftIcon,
  rightIcon,
  required,
  className, 
  size = "md",
  ...props 
}) => {
  const inputId = props.id || props.name || 'input';
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <Input
          {...props}
          id={inputId}
          size={size}
          error={error}
          className={cn(
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            className
          )}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {message && (
        <p className={cn("mt-1 text-xs", error ? "text-red-500" : "text-gray-500")}>
          {message}
        </p>
      )}
    </div>
  );
};

// 6️⃣ Enhanced Styled Link ---------------------------------------------------
export interface StyledLinkProps extends React.ComponentProps<"a"> {
  colorScheme?: ColorScheme;
  variant?: "default" | "subtle" | "bold";
  underline?: boolean;
}

export const StyledLink: React.FC<StyledLinkProps> = ({ 
  children, 
  className,
  colorScheme = "indigo",
  variant = "default",
  underline = true,
  ...props 
}) => {
  const baseClasses = "transition-colors duration-150";
  const colorClasses = `text-${colorScheme}-600 hover:text-${colorScheme}-500`;
  const variantClasses = {
    default: "",
    subtle: "opacity-80 hover:opacity-100",
    bold: "font-semibold"
  }[variant];
  const underlineClasses = underline ? "underline-offset-4 hover:underline" : "";
  
  return (
    <a
      {...props}
      className={cn(baseClasses, colorClasses, variantClasses, underlineClasses, className)}
    >
      {children}
    </a>
  );
};

// 7️⃣ Enhanced Alert Message -------------------------------------------------
export interface AlertMessageProps {
  variant?: "info" | "success" | "error" | "warning";
  title?: string;
  children: React.ReactNode;
  colorScheme?: ColorScheme;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ 
  variant = "info", 
  title, 
  children,
  colorScheme,
  icon,
  closable,
  onClose,
  className
}) => {
  const iconElement = icon || (
    <div className="flex-shrink-0">
      {variant === "success" && "✓"}
      {variant === "error" && "✕"}
      {variant === "warning" && "⚠"}
      {variant === "info" && "ℹ"}
    </div>
  );

  return (
    <Alert variant={variant} colorScheme={colorScheme} className={className}>
      {iconElement}
      <div className="flex-1">
        {title && <AlertTitle className="font-medium">{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </div>
      {closable && onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      )}
    </Alert>
  );
};

// 8️⃣ Enhanced Testimonial ---------------------------------------------------
export interface TestimonialProps {
  quote: string;
  avatarUrl: string;
  name: string;
  role?: string;
  colorScheme?: ColorScheme;
  variant?: "default" | "bordered" | "shadow";
  className?: string;
}

export const Testimonial: React.FC<TestimonialProps> = ({ 
  quote, 
  avatarUrl, 
  name, 
  role,
  colorScheme,
  variant = "default",
  className
}) => {
  const quoteColorClasses = colorScheme ? `text-${colorScheme}-900` : "text-gray-900";
  
  return (
    <figure className={cn("max-w-md", className)}>
      <Card variant={variant} colorScheme={colorScheme}>
        <blockquote className={cn("mb-4 italic leading-relaxed", quoteColorClasses)}>
          "{quote}"
        </blockquote>
        <Separator className="my-3" colorScheme={colorScheme} />
        <figcaption className="flex items-center gap-3">
          <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <div className="text-sm font-semibold text-gray-900">{name}</div>
            {role && <div className="text-xs text-gray-500">{role}</div>}
          </div>
        </figcaption>
      </Card>
    </figure>
  );
};

// 9️⃣ Enhanced Footer --------------------------------------------------------
export interface FooterProps {
  brand?: string;
  links: { label: string; href: string }[];
  colorScheme?: ColorScheme;
  variant?: "default" | "dark" | "branded";
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  brand = "YourBrand", 
  links,
  colorScheme = "gray",
  variant = "default",
  className
}) => {
  const variantClasses = {
    default: "bg-gray-50 border-gray-200 text-gray-900",
    dark: "bg-gray-900 border-gray-800 text-gray-100",
    branded: colorScheme ? `bg-${colorScheme}-50 border-${colorScheme}-200 text-${colorScheme}-900` : "bg-gray-50 border-gray-200 text-gray-900"
  }[variant];

  return (
    <footer className={cn("w-full border-t py-8", variantClasses, className)}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <span className="text-lg font-semibold">{brand}</span>
        <nav className="flex flex-wrap gap-4 text-sm">
          {links.map((l) => (
            <StyledLink 
              key={l.href} 
              href={l.href} 
              colorScheme={colorScheme}
              className="font-medium"
            >
              {l.label}
            </StyledLink>
          ))}
        </nav>
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} {brand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// Convenience collective export ----------------------------------------------
export const UiElements = {
  Headline,
  Subheadline,
  CTA,
  FeatureCard,
  TextInput,
  StyledLink,
  AlertMessage,
  Testimonial,
  Footer,
  Button,
  Card,
  Input,
  Alert,
  Separator,
  FeatureList,
};
