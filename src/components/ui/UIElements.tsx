import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { iconMap } from "../../lib/iconMap";

// Utility for class name concatenation
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ===== MOBILE UI COMPONENT SYSTEM =====

// Core types for mobile components
export type BackgroundType = "color" | "gradient" | "image";
export type TextVariant = "h1" | "h2" | "h3" | "body" | "caption";
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type InputType = "text" | "email" | "password" | "number";
export type OptionType = "radio" | "checkbox";

// Base props for all mobile components
export interface BaseMobileProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ===== SCREEN COMPONENT =====
export interface ScreenConfig extends BaseMobileProps {
  name: string;
  bgType?: BackgroundType;
  bgValue?: string;
  overlayColor?: string;
  children?: React.ReactNode;
}

export const Screen: React.FC<ScreenConfig> = ({
  id,
  name,
  bgType = "color",
  bgValue = "#FFFFFF",
  overlayColor,
  children,
  className,
  style,
  ...props
}) => {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Generate fallback gradient for failed images
  const generateFallbackGradient = (): string => {
    const entertainmentGradients = [
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    const defaultGradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    // Use a gradient based on the screen name/id for consistency
    const gradients = name?.toLowerCase().includes('entertainment') ? entertainmentGradients : defaultGradients;
    const index = parseInt(id?.slice(-1) || '0') || 0;
    return gradients[index % gradients.length];
  };

  // Test image loading when bgType is image
  useEffect(() => {
    if (bgType === 'image' && bgValue && bgValue.startsWith('http')) {
      console.log(`🖼️ Testing image load for screen ${id}:`, bgValue);
      setImageLoadFailed(false);
      setImageSrc(null);
      
      const img = new Image();
      const timeout = setTimeout(() => {
        console.warn(`⏱️ Image load timeout for screen ${id}:`, bgValue);
        setImageLoadFailed(true);
      }, 3000);
      
      img.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ Image loaded successfully for screen ${id}:`, bgValue);
        setImageSrc(bgValue);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn(`❌ Image failed to load for screen ${id}:`, bgValue);
        setImageLoadFailed(true);
      };
      
      img.src = bgValue;
    }
  }, [bgType, bgValue, id]);

  const getBackgroundStyle = () => {
    switch (bgType) {
      case "color":
        return { backgroundColor: bgValue };
      case "gradient":
        return { 
          background: bgValue,
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        };
      case "image":
        if (imageLoadFailed) {
          // Use gradient fallback for failed images
          const fallbackGradient = generateFallbackGradient();
          console.log(`🎨 Using gradient fallback for screen ${id}:`, fallbackGradient);
          return { 
            background: fallbackGradient,
            backgroundAttachment: 'fixed',
            minHeight: '100vh'
          };
        }
        return { 
          position: 'relative' as const,
          minHeight: '100vh'
        };
      default:
        return { backgroundColor: "#FFFFFF" };
    }
  };

  return (
    <div
      id={id}
      className={cn("w-full min-h-full flex flex-col justify-start relative overflow-y-auto", className)}
      style={{ ...getBackgroundStyle(), ...style }}
      {...props}
    >
      {/* Fixed background image that doesn't scroll - only show if image loaded successfully */}
      {bgType === 'image' && imageSrc && !imageLoadFailed && (
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
      
      {/* Overlay for background images - simple solid overlay for better control */}
      {overlayColor && bgType === 'image' && imageSrc && !imageLoadFailed && (
        <div 
          className="absolute inset-0 z-10"
          style={{ 
            backgroundColor: overlayColor
          }}
        />
      )}
      <div className="relative z-20 flex-1 flex flex-col justify-start px-6 py-4 space-y-2">
        {children}
      </div>
    </div>
  );
};

// ===== TEXT COMPONENT =====
export interface TextConfig extends BaseMobileProps {
  text: string;
  variant?: TextVariant;
  alignment?: "left" | "center" | "right";
  color?: string;
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
}

export const MobileText: React.FC<TextConfig> = ({
  text,
  variant = "body",
  alignment = "left",
  color = "#000000",
  fontWeight = "normal",
  className,
  style,
  ...props
}) => {
  const variantClasses = {
    h1: "text-3xl font-bold leading-tight",
    h2: "text-2xl font-semibold leading-tight",
    h3: "text-xl font-medium leading-tight", 
    body: "text-base leading-relaxed",
    caption: "text-sm leading-normal"
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  };

  const fontWeightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold", 
    bold: "font-bold"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        variantClasses[variant],
        alignmentClasses[alignment],
        fontWeightClasses[fontWeight],
        "px-6 py-2",
        className // Pass the entire className to preserve Tailwind classes
      )}
      style={{
        color,
        ...style,
        // If style includes fontFamily, add proper fallbacks
        ...(style?.fontFamily ? {
          fontFamily: `${style.fontFamily}, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
        } : {})
      }}
      {...props}
    >
      {text}
    </motion.div>
  );
};

// ===== INPUT COMPONENT =====
export interface InputConfig extends BaseMobileProps {
  placeholder?: string;
  type?: InputType;
  label?: string;
  icon?: React.ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  color?: string;
}

export const MobileInput: React.FC<InputConfig> = ({
  placeholder,
  type = "text",
  label,
  icon,
  required = false,
  value,
  onChange,
  color,
  className,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("px-6 py-3", className)} 
      style={style} 
      {...props}
    >
      {label && (
        <motion.label 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}
      <div className="relative">
        {icon && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            {icon}
          </motion.div>
        )}
        <motion.input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            "w-full px-4 py-4 border-2 rounded-2xl text-base transition-all duration-200",
            "focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
            "placeholder-gray-400 bg-gray-50 focus:bg-white",
            "shadow-sm hover:shadow-md focus:shadow-lg",
            isFocused ? "border-blue-500 bg-white" : "border-gray-200",
            icon ? "pl-12" : ""
          )}
          style={{ color: color || '#111827' }}
        />
      </div>
    </motion.div>
  );
};

// ===== BUTTON COMPONENT =====
export interface ButtonConfig extends BaseMobileProps {
  text: string;
  action?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const MobileButton: React.FC<ButtonConfig> = ({
  text,
  action,
  variant = "primary",
  icon,
  fullWidth = true,
  disabled = false,
  rounded = 'lg',
  className,
  style,
  ...props
}) => {
  // Clean up the button styling to avoid conflicts
  const getButtonStyle = () => {
    const baseStyle: React.CSSProperties = {
      border: 'none',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1',
      minHeight: '56px',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      transition: 'all 0.2s ease-out',
      transform: 'translateZ(0)', // Enable hardware acceleration
      width: '100%',
      ...style
    };

    // Apply variant-specific styles
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: style?.backgroundColor || '#3B82F6',
          color: style?.color || '#FFFFFF',
          boxShadow: `0 4px 14px 0 ${style?.backgroundColor || '#3B82F6'}40`,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: style?.backgroundColor || '#F3F4F6',
          color: style?.color || '#374151',
          boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: style?.color || '#374151',
          border: '2px solid #D1D5DB',
          boxShadow: 'none',
        };
      default:
        return baseStyle;
    }
  };

  const getRoundedClass = () => {
    switch (rounded) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-lg';
      case 'md': return 'rounded-xl';
      case 'lg': return 'rounded-2xl';
      case 'xl': return 'rounded-3xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  return (
    <div className="px-6 py-3">
      <motion.button
        onClick={action}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          "focus:outline-none focus:ring-4 focus:ring-blue-500/20",
          "disabled:opacity-50",
          fullWidth ? "w-full" : "inline-flex",
          getRoundedClass(),
          className
        )}
        style={getButtonStyle()}
        {...props}
      >
        {icon && (
          <motion.span
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
        <span>{text}</span>
      </motion.button>
    </div>
  );
};

// ===== IMAGE COMPONENT =====
export interface ImageConfig extends BaseMobileProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  alignment?: "left" | "center" | "right";
  borderRadius?: "none" | "sm" | "md" | "lg" | "full";
}

export const MobileImage: React.FC<ImageConfig> = ({
  src,
  alt,
  size = "md",
  alignment = "center",
  borderRadius = "md",
  className,
  style,
  ...props
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48"
  };

  const alignmentClasses = {
    left: "self-start",
    center: "self-center",
    right: "self-end"
  };

  const borderRadiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  };

  return (
    <div className={cn("px-6 py-3 flex justify-center", className)} style={style} {...props}>
      <img
        src={src}
        alt={alt}
        className={cn(
          sizeClasses[size],
          borderRadiusClasses[borderRadius],
          "object-cover"
        )}
      />
    </div>
  );
};

// ===== OPTION GROUP COMPONENT =====
export interface OptionConfig {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface OptionGroupConfig extends BaseMobileProps {
  title?: string;
  options: OptionConfig[];
  type?: OptionType;
  multiSelect?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  icon?: React.ReactNode;
  color?: string;
}

export const MobileOptionGroup: React.FC<OptionGroupConfig> = ({
  title,
  options,
  type = "radio",
  multiSelect = false,
  value,
  onChange,
  icon,
  color,
  className,
  style,
  ...props
}) => {
  const handleOptionChange = (optionValue: string) => {
    if (type === "checkbox" || multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
    }
  };

  return (
    <div className={cn("px-6 py-3", className)} style={style} {...props}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span>{icon}</span>}
          <h3 
            className="text-lg font-medium"
            style={{ color: color || '#111827' }}
          >
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = Array.isArray(value) 
            ? value.includes(option.value)
            : value === option.value;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionChange(option.value)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left",
                isSelected 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {option.icon && <span>{option.icon}</span>}
              <span 
                className="flex-1 font-medium"
                style={{ color: color || '#111827' }}
              >
                {option.label}
              </span>
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center",
                type === "radio" ? "rounded-full" : "rounded",
                isSelected 
                  ? "border-blue-500 bg-blue-500" 
                  : "border-gray-300"
              )}>
                {isSelected && (
                  <div className={cn(
                    "bg-white",
                    type === "radio" ? "w-2 h-2 rounded-full" : "w-3 h-3 rounded-sm"
                  )} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ===== MOBILE PHONE CONTAINER =====
export interface MobilePhoneProps {
  children: React.ReactNode;
  className?: string;
}

export const MobilePhone: React.FC<MobilePhoneProps> = ({ children, className }) => {
  return (
    <div className={cn("relative w-[390px] h-[844px] mx-auto", className)}>
      {/* Phone Frame with enhanced styling */}
      <div className="absolute inset-0 rounded-[36px] shadow-2xl border-[6px] border-gray-900 bg-gray-900 overflow-hidden">
        {/* Dynamic Island (iPhone 14 Pro style) */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50"></div>
        
        {/* Screen Area */}
        <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black">
          {/* Status Bar with gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/20 to-transparent flex items-center justify-between px-6 z-50 pt-2">
            <div className="text-sm font-semibold text-white">9:41</div>
            <div className="flex items-center gap-1">
              {/* Enhanced signal/battery icons */}
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full opacity-75"></div>
                <div className="w-1 h-3 bg-white rounded-full opacity-50"></div>
                <div className="w-1 h-3 bg-white rounded-full opacity-25"></div>
              </div>
              <div className="w-6 h-3 border border-white rounded-sm ml-1">
                <div className="w-4 h-2 bg-green-400 rounded-sm m-0.5"></div>
              </div>
            </div>
          </div>
          
          {/* Screen Content - Made scrollable */}
          <div className="absolute inset-0 bg-white rounded-[30px] overflow-y-auto overflow-x-hidden">
            <div className="h-full pt-14">
              <div className="h-full">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== SCREEN NAVIGATION =====
export interface NavigationConfig {
  currentScreen: number;
  totalScreens: number;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
}

export const MobileNavigation: React.FC<NavigationConfig> = ({
  currentScreen,
  totalScreens,
  onNext,
  onBack,
  onSkip,
  showProgress = true
}) => {
  return (
    <div className="mt-6 space-y-4">
      {showProgress && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">
              Step {currentScreen + 1} of {totalScreens}
            </span>
            {onSkip && (
              <button onClick={onSkip} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Skip
              </button>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${((currentScreen + 1) / totalScreens) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
      
      <div className="flex gap-3">
        {onBack && currentScreen > 0 && (
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-base transition-all duration-200 hover:bg-gray-200"
          >
            ← Back
          </motion.button>
        )}
        {onNext && (
          <motion.button
            onClick={onNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-base transition-all duration-200 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
          >
            {currentScreen === totalScreens - 1 ? "Finish" : "Next →"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

// ===== COMPONENT RENDERER =====
export type MobileComponentType = 
  | "screen"
  | "text" 
  | "input"
  | "button"
  | "image"
  | "optionGroup"
  | "navigation";

export interface MobileComponentConfig {
  type: MobileComponentType;
  props: any;
  children?: MobileComponentConfig[];
}

export const renderMobileComponent = (config: MobileComponentConfig): React.ReactElement => {
  const { type, props, children } = config;

  switch (type) {
    case "screen":
      return (
        <Screen key={props.id} {...props}>
          {children?.map(renderMobileComponent)}
        </Screen>
      );
    case "text":
      return <MobileText key={props.id} {...props} />;
    case "input":
      return <MobileInput key={props.id} {...props} />;
    case "button":
      return <MobileButton key={props.id} {...props} />;
    case "image":
      return <MobileImage key={props.id} {...props} />;
    case "optionGroup":
      return <MobileOptionGroup key={props.id} {...props} />;
    case "navigation":
      return <MobileNavigation key={props.id} {...props} />;
    default:
      return <div key={props.id}>Unknown component type: {type}</div>;
  }
};

// ===== MOBILE APP SYSTEM =====
export interface MobileAppProps {
  screens: MobileComponentConfig[];
  currentScreenIndex?: number;
  onScreenChange?: (index: number) => void;
}

export const MobileApp: React.FC<MobileAppProps> = ({
  screens,
  currentScreenIndex = 0,
  onScreenChange
}) => {
  const [screenIndex, setScreenIndex] = useState(currentScreenIndex);

  const handleNext = () => {
    const nextIndex = Math.min(screenIndex + 1, screens.length - 1);
    setScreenIndex(nextIndex);
    onScreenChange?.(nextIndex);
  };

  const handleBack = () => {
    const prevIndex = Math.max(screenIndex - 1, 0);
    setScreenIndex(prevIndex);
    onScreenChange?.(prevIndex);
  };

  const currentScreen = screens[screenIndex];

  return (
    <MobilePhone>
      <div className="relative w-full h-full">
        {currentScreen && renderMobileComponent(currentScreen)}
        
        <MobileNavigation
          currentScreen={screenIndex}
          totalScreens={screens.length}
          onNext={screenIndex < screens.length - 1 ? handleNext : undefined}
          onBack={screenIndex > 0 ? handleBack : undefined}
        />
      </div>
    </MobilePhone>
  );
};

// ===== ADVANCED MOBILE COMPONENTS =====

// Progress Bar Component
export interface ProgressBarConfig extends BaseMobileProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export const MobileProgressBar: React.FC<ProgressBarConfig> = ({
  value,
  max,
  color = "#3B82F6",
  label,
  showPercentage = true,
  className,
  style,
  ...props
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("px-6 py-4", className)} 
      style={style} 
      {...props}
    >
      {label && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {showPercentage && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm font-bold text-gray-900"
            >
              {percentage}%
            </motion.span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
        <motion.div 
          className="h-4 rounded-full shadow-sm"
          style={{ 
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: `0 2px 4px ${color}40`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

// Slider Component
export interface SliderConfig extends BaseMobileProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  value?: number;
  onChange?: (value: number) => void;
  color?: string;
}

export const MobileSlider: React.FC<SliderConfig> = ({
  label,
  min,
  max,
  step = 1,
  unit = "",
  value = min,
  onChange,
  color = "#3B82F6",
  className,
  style,
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue: number) => {
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("px-6 py-4", className)} 
      style={style} 
      {...props}
    >
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <motion.span 
          key={currentValue}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full"
        >
          {currentValue}{unit}
        </motion.span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider shadow-inner"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${((currentValue - min) / (max - min)) * 100}%, #E5E7EB ${((currentValue - min) / (max - min)) * 100}%, #E5E7EB 100%)`
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span className="font-medium">{min}{unit}</span>
        <span className="font-medium">{max}{unit}</span>
      </div>
    </motion.div>
  );
};

// Card Component
export interface CardConfig extends BaseMobileProps {
  title: string;
  content?: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
  clickable?: boolean;
  imageUrl?: string;
  onClick?: () => void;
}

export const MobileCard: React.FC<CardConfig> = ({
  title,
  content,
  icon,
  highlighted = false,
  clickable = false,
  imageUrl,
  onClick,
  className,
  style,
  ...props
}) => {
  const baseClasses = cn(
    "mx-6 my-3 p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm",
    highlighted 
      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/10" 
      : "border-gray-200 bg-white hover:border-gray-300",
    clickable 
      ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-98" 
      : "hover:shadow-md",
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={baseClasses}
      style={style}
      onClick={clickable ? onClick : undefined}
      whileHover={clickable ? { scale: 1.02 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/25"
          >
            {icon}
          </motion.div>
        )}
        {imageUrl && (
          <motion.img 
            src={imageUrl} 
            alt={title}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="flex-shrink-0 w-12 h-12 rounded-xl object-cover shadow-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <motion.h3 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold text-gray-900 mb-2 text-lg"
          >
            {title}
          </motion.h3>
          {content && (
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-gray-600 leading-relaxed"
            >
              {content}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Toggle Switch Component
export interface ToggleConfig extends BaseMobileProps {
  label: string;
  value: boolean;
  onChange?: (value: boolean) => void;
  color?: string;
  description?: string;
}

export const MobileToggle: React.FC<ToggleConfig> = ({
  label,
  value,
  onChange,
  color = "#3B82F6",
  description,
  className,
  style,
  ...props
}) => {
  const [isEnabled, setIsEnabled] = useState(value);

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("px-6 py-4", className)} style={style} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-900">{label}</div>
          {description && (
            <div className="text-sm text-gray-500 mt-1">{description}</div>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2",
            isEnabled ? "bg-blue-600" : "bg-gray-200"
          )}
          style={isEnabled ? { backgroundColor: color } : {}}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out",
              isEnabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>
    </div>
  );
};

// Spacer Component
export interface SpacerConfig extends BaseMobileProps {
  height?: "sm" | "md" | "lg" | "xl";
}

export const MobileSpacer: React.FC<SpacerConfig> = ({
  height = "md",
  className,
  ...props
}) => {
  const heightClasses = {
    sm: "h-4",
    md: "h-8",
    lg: "h-12",
    xl: "h-16"
  };

  return <div className={cn(heightClasses[height], className)} {...props} />;
};

// ===== FORM GROUP COMPONENT =====
export interface FormGroupConfig extends BaseMobileProps {
  title: string;
  description?: string;
  fields: Array<{
    id: string;
    type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    value?: string;
    rows?: number;
  }>;
  layout?: 'vertical' | 'horizontal';
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export const MobileFormGroup: React.FC<FormGroupConfig> = ({
  title,
  description,
  fields,
  layout = 'vertical',
  showProgress = false,
  currentStep = 1,
  totalSteps = 1,
  className,
  style,
  ...props
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: FormGroupConfig['fields'][0], index: number) => {
    const isRequired = field.required;
    const isFocused = focusedField === field.id;
    const fieldValue = formData[field.id] || field.value || '';

    return (
      <motion.div
        key={field.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="space-y-2"
      >
        <label className="block text-sm font-semibold text-gray-700">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {field.type === 'select' ? (
          <motion.select
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onFocus={() => setFocusedField(field.id)}
            onBlur={() => setFocusedField(null)}
            whileFocus={{ scale: 1.01 }}
            className={cn(
              "w-full px-4 py-3 border-2 rounded-2xl text-base transition-all duration-200",
              "focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
              "bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg",
              isFocused ? "border-blue-500 bg-white" : "border-gray-200"
            )}
          >
            <option value="">{field.placeholder || `Choose ${field.label.toLowerCase()}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </motion.select>
        ) : field.type === 'textarea' ? (
          <motion.textarea
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onFocus={() => setFocusedField(field.id)}
            onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            whileFocus={{ scale: 1.01 }}
            className={cn(
              "w-full px-4 py-3 border-2 rounded-2xl text-base transition-all duration-200",
              "focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
              "bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg",
              "resize-none",
              isFocused ? "border-blue-500 bg-white" : "border-gray-200"
            )}
          />
        ) : (
          <motion.input
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            onFocus={() => setFocusedField(field.id)}
            onBlur={() => setFocusedField(null)}
            placeholder={field.placeholder}
            whileFocus={{ scale: 1.01 }}
            className={cn(
              "w-full px-4 py-3 border-2 rounded-2xl text-base transition-all duration-200",
              "focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500",
              "bg-gray-50 focus:bg-white shadow-sm hover:shadow-md focus:shadow-lg",
              isFocused ? "border-blue-500 bg-white" : "border-gray-200"
            )}
          />
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("mx-6 my-4", className)}
      style={style}
      {...props}
    >
      {/* Header */}
      <div className="mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-sm leading-relaxed"
          >
            {description}
          </motion.p>
        )}
        
        {/* Progress Indicator */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-center justify-between"
          >
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-medium text-blue-600">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Form Fields */}
      <div className={cn(
        "space-y-4",
        layout === 'horizontal' && "grid grid-cols-2 gap-4 space-y-0"
      )}>
        {fields.map((field, index) => renderField(field, index))}
      </div>
    </motion.div>
  );
};

// ===== BOTTOM SHEET COMPONENT =====

export interface BottomSheetConfig extends BaseMobileProps {
  title: string;
  content: string;
  trigger_text: string;
  action_text?: string;
  variant?: "default" | "success" | "warning" | "info";
  isOpen?: boolean;
}

export const MobileBottomSheet: React.FC<BottomSheetConfig> = ({
  title,
  content,
  trigger_text,
  action_text = "Got it",
  variant = "default",
  isOpen: initialOpen = false,
  className,
  style,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const variantStyles = {
    default: {
      bg: "bg-white",
      triggerBg: "bg-blue-600 hover:bg-blue-700",
      triggerText: "text-white",
      accent: "text-blue-600"
    },
    success: {
      bg: "bg-white",
      triggerBg: "bg-green-600 hover:bg-green-700", 
      triggerText: "text-white",
      accent: "text-green-600"
    },
    warning: {
      bg: "bg-white",
      triggerBg: "bg-yellow-600 hover:bg-yellow-700",
      triggerText: "text-white", 
      accent: "text-yellow-600"
    },
    info: {
      bg: "bg-white",
      triggerBg: "bg-indigo-600 hover:bg-indigo-700",
      triggerText: "text-white",
      accent: "text-indigo-600"
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn("relative", className)} style={style} {...props}>
      {/* Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full py-3 px-4 rounded-xl font-medium transition-colors",
          styles.triggerBg,
          styles.triggerText
        )}
      >
        {trigger_text}
      </motion.button>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                mass: 0.8
              }}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto",
                styles.bg,
                "rounded-t-3xl shadow-2xl border-t border-gray-200"
              )}
            >
              {/* Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Content */}
              <div className="px-6 pb-8">
                <h3 className={cn(
                  "text-xl font-bold mb-3",
                  styles.accent
                )}>
                  {title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {content}
                </p>

                {/* Action Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-medium transition-colors",
                    styles.triggerBg,
                    styles.triggerText
                  )}
                >
                  {action_text}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== PROGRESS DOTS COMPONENT =====
export interface MobileProgressDotsProps extends BaseMobileProps {
  total: number;
  current: number;
  color?: string;
}

export const MobileProgressDots: React.FC<MobileProgressDotsProps> = ({
  total,
  current,
  color = '#3B82F6',
  className,
  ...props
}) => {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...props}>
      {Array.from({ length: total }, (_, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: index === current ? 1.2 : 1,
            width: index === current ? 32 : 8,
            height: 8
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="rounded-full transition-all duration-300"
          style={{
            backgroundColor: index === current ? color : index < current ? color : '#E5E7EB',
            opacity: index === current ? 1 : index < current ? 0.5 : 0.3
          }}
        />
      ))}
    </div>
  );
};

// ===== PLACEHOLDER ILLUSTRATION COMPONENT =====
export interface MobilePlaceholderIllustrationProps extends BaseMobileProps {
  type: 'welcome' | 'features' | 'success' | 'team' | 'analytics' | 'security' | 'customize' | 'rocket';
  color?: string;
}

export const MobilePlaceholderIllustration: React.FC<MobilePlaceholderIllustrationProps> = ({
  type,
  color = '#3B82F6',
  className,
  ...props
}) => {
  const illustrations: Record<typeof type, JSX.Element> = {
    welcome: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="50" y="40" width="200" height="120" rx="20" fill={color} opacity="0.1"/>
        <circle cx="150" cy="100" r="40" fill={color} opacity="0.2"/>
        <path d="M130 100 L145 115 L170 85" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    features: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="40" y="50" width="60" height="60" rx="10" fill={color} opacity="0.2"/>
        <rect x="120" y="50" width="60" height="60" rx="10" fill={color} opacity="0.2"/>
        <rect x="200" y="50" width="60" height="60" rx="10" fill={color} opacity="0.2"/>
        <circle cx="70" cy="80" r="15" fill={color} opacity="0.4"/>
        <circle cx="150" cy="80" r="15" fill={color} opacity="0.4"/>
        <circle cx="230" cy="80" r="15" fill={color} opacity="0.4"/>
      </svg>
    ),
    success: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="150" cy="100" r="60" fill={color} opacity="0.1"/>
        <circle cx="150" cy="100" r="45" fill={color} opacity="0.2"/>
        <path d="M120 100 L140 120 L180 80" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    team: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="100" cy="80" r="25" fill={color} opacity="0.2"/>
        <circle cx="150" cy="80" r="25" fill={color} opacity="0.2"/>
        <circle cx="200" cy="80" r="25" fill={color} opacity="0.2"/>
        <path d="M60 140 Q100 120 140 140" fill={color} opacity="0.1"/>
        <path d="M110 140 Q150 120 190 140" fill={color} opacity="0.1"/>
        <path d="M160 140 Q200 120 240 140" fill={color} opacity="0.1"/>
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="60" y="120" width="30" height="40" fill={color} opacity="0.2"/>
        <rect x="100" y="90" width="30" height="70" fill={color} opacity="0.3"/>
        <rect x="140" y="60" width="30" height="100" fill={color} opacity="0.4"/>
        <rect x="180" y="80" width="30" height="80" fill={color} opacity="0.3"/>
        <rect x="220" y="100" width="30" height="60" fill={color} opacity="0.2"/>
      </svg>
    ),
    security: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M150 40 L200 60 L200 120 C200 140 150 160 150 160 S100 140 100 120 L100 60 Z" fill={color} opacity="0.1"/>
        <path d="M150 60 L180 70 L180 110 C180 120 150 130 150 130 S120 120 120 110 L120 70 Z" fill={color} opacity="0.2"/>
        <circle cx="150" cy="95" r="15" fill={color} opacity="0.3"/>
        <rect x="145" y="90" width="10" height="15" rx="2" fill={color} opacity="0.4"/>
      </svg>
    ),
    customize: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="80" y="60" width="140" height="80" rx="10" fill={color} opacity="0.1"/>
        <circle cx="110" cy="90" r="8" fill={color} opacity="0.3"/>
        <circle cx="150" cy="90" r="8" fill={color} opacity="0.3"/>
        <circle cx="190" cy="90" r="8" fill={color} opacity="0.3"/>
        <rect x="100" y="110" width="100" height="8" rx="4" fill={color} opacity="0.2"/>
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M150 140 L130 100 Q150 40 170 100 Z" fill={color} opacity="0.2"/>
        <path d="M150 100 L140 80 Q150 60 160 80 Z" fill={color} opacity="0.3"/>
        <circle cx="150" cy="90" r="5" fill={color} opacity="0.4"/>
        <path d="M130 140 L120 160 L140 150 M170 140 L180 160 L160 150" stroke={color} strokeWidth="3" opacity="0.3"/>
      </svg>
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {illustrations[type]}
    </motion.div>
  );
};

// ===== LOADING SPINNER COMPONENT =====
export interface MobileLoadingSpinnerProps extends BaseMobileProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const MobileLoadingSpinner: React.FC<MobileLoadingSpinnerProps> = ({
  size = 'md',
  color = '#3B82F6',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <motion.div
        className={cn("rounded-full border-2 border-gray-200", sizeClasses[size])}
        style={{ borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

// ===== CARD GRID COMPONENT =====
export interface MobileCardGridProps extends BaseMobileProps {
  title?: string;
  multiSelect?: boolean;
  columns?: 2 | 3;
  selectedColor?: string;
  unselectedColor?: string;
  options: {
    id: string;
    title: string;
    description: string;
    icon: string;
    value: string;
  }[];
  selectedValues?: string[];
  onChange?: (selectedValues: string[]) => void;
}

export const MobileCardGrid: React.FC<MobileCardGridProps> = ({
  title,
  multiSelect = true,
  columns = 2,
  selectedColor = '#EF4444',
  unselectedColor = '#E5E7EB',
  options,
  selectedValues = [],
  onChange,
  className,
  ...props
}) => {
  const [selected, setSelected] = useState<string[]>(selectedValues);

  const handleCardSelect = (value: string) => {
    let newSelected: string[];
    
    if (multiSelect) {
      newSelected = selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value];
    } else {
      newSelected = selected.includes(value) ? [] : [value];
    }
    
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  // Use single column for compact, modern list layout
  const gridCols = 'grid-cols-1';

  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {title && (
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-semibold text-white text-center mb-6"
        >
          {title}
        </motion.h3>
      )}
      
      <div className={cn("grid gap-3", gridCols)}>
        {options.map((option, index) => {
          const isSelected = selected.includes(option.value);
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: "easeOut" 
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardSelect(option.value)}
              className={cn(
                "relative flex items-center gap-4 p-2 rounded-lg border transition-all duration-300",
                "bg-white/90 backdrop-blur-lg text-left",
                "hover:bg-white/95 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              )}
              style={{
                borderColor: isSelected ? selectedColor : unselectedColor,
                boxShadow: isSelected 
                  ? `0 4px 12px ${selectedColor}40` 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm"
              >
{(() => {
                  try {
                    // Check if it's a Lucide icon name or fallback to text/emoji
                    const IconComponent = iconMap && iconMap[option.icon];
                    return IconComponent ? (
                      <IconComponent size={24} className="text-gray-700" />
                    ) : (
                      // <Star size={24} className="text-gray-700" />
                      <span className="text-lg">{option.icon}</span>
                    );
                  } catch (error) {
                    console.warn('Error rendering icon:', option.icon, error);
                    return <span className="text-lg">{option.icon}</span>;
                  }
                })()}
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="font-poppins font-semibold text-base text-gray-900 truncate"
                >
                  {option.title}
                </motion.h4>
              </div>
              
              {/* Selection indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isSelected ? 1 : 0.7 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected 
                    ? "border-transparent" 
                    : "border-gray-300"
                )}
                style={{ 
                  backgroundColor: isSelected ? selectedColor : 'transparent'
                }}
              >
                {isSelected && (
                  <svg 
                    className="w-3 h-3 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      
      {multiSelect && selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-white/80">
            {selected.length} selected
          </p>
        </motion.div>
      )}
    </div>
  );
};

