import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import type { 
  UIScreen, 
  UIComponent, 
  UIFlow,
  TitleComponent,
  InputComponent,
  ButtonComponent,
  OptionGroupComponent,
  ImageComponent,
  ProgressBarComponent,
  SliderComponent,
  CardComponent,
  ToggleComponent,
  SpacerComponent,
  BottomSheetComponent
} from '../../types/ui-schema';
import { 
  MobilePhone,
  MobileText,
  MobileInput,
  MobileButton,
  MobileImage,
  MobileOptionGroup,
  MobileProgressBar,
  MobileSlider,
  MobileCard,
  MobileToggle,
  MobileSpacer,
  MobileNavigation,
  MobileBottomSheet,
  MobileProgressDots,
  MobilePlaceholderIllustration,
  MobileLoadingSpinner,
  MobileCardGrid,
  Screen
} from './UIElements';

// Component mapper - converts JSON components to React components
export const renderUIComponent = (
  component: UIComponent, 
  index: number, 
  editMode: boolean = false,
  onEdit?: (componentIndex: number) => void,
  onDelete?: (componentIndex: number) => void,
  theme?: UIFlow['theme']
): React.ReactElement => {
  const key = `${component.type}-${index}`;

  const ComponentWrapper = ({ children }: { children: React.ReactNode }) => {
    // Apply padding styles based on component props
    const paddingStyle = {
      paddingTop: `${component.props.paddingTop || 0}px`,
      paddingRight: `${component.props.paddingRight || 0}px`,
      paddingBottom: `${component.props.paddingBottom || 0}px`,
      paddingLeft: `${component.props.paddingLeft || 0}px`,
    };

    if (!editMode) {
      return (
        <div style={paddingStyle}>
          {children}
        </div>
      );
    }

    return (
      <div 
        className="group relative"
        style={{ position: 'relative', ...paddingStyle }}
      >
        {children}
        
        {/* Edit overlay - only visible on hover in edit mode */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-md transition-colors pointer-events-none" />
        
        {/* Edit buttons */}
        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-md rounded-md p-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(index);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(index);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  switch (component.type) {
    case 'Title':
      const titleComp = component as TitleComponent;
      
      // Merge all styling sources with proper precedence
      const mergedStyles: React.CSSProperties = {
        // Start with theme font if available
        ...(theme?.fontFamily ? { fontFamily: theme.fontFamily } : {}),
        // Apply component base styles
        ...(component.styles || {}),
        // Apply component custom styles (higher precedence)
        ...(component.customStyles || {}),
        // Apply props style (highest precedence)
        ...(titleComp.props.style || {})
      };
      
      return (
        <ComponentWrapper key={key}>
          <MobileText
            text={titleComp.props.text}
            variant={titleComp.props.variant || 'body'}
            alignment={titleComp.props.alignment || 'left'}
            color={titleComp.props.color || theme?.textColor || '#1F2937'}
            fontWeight={titleComp.props.fontWeight || 'normal'}

            style={mergedStyles}
          />
        </ComponentWrapper>
      );

    case 'Input':
      const inputComp = component as InputComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileInput
            placeholder={inputComp.props.placeholder}
            type={inputComp.props.type}
            label={inputComp.props.label}
            required={inputComp.props.required}
            value={inputComp.props.value}
            color={inputComp.props.color}
          />
        </ComponentWrapper>
      );

    case 'Button':
      const buttonComp = component as ButtonComponent;
      
      // Merge all styling sources with proper precedence
      const buttonVariant = buttonComp.props.variant || 'primary';
      const hasCustomBackground = !!buttonComp.props.style?.backgroundColor;
      
      const buttonMergedStyles: React.CSSProperties = {
        // Start with theme defaults based on variant (only if no custom backgroundColor)
        ...(!hasCustomBackground && theme ? (() => {
          switch (buttonVariant) {
            case 'primary':
              return {
                backgroundColor: theme.primaryColor,
                color: '#FFFFFF'
              };
            case 'secondary':
              return {
                backgroundColor: '#F3F4F6', // Light gray background
                color: theme.primaryColor || '#374151' // Theme color text or dark fallback
              };
            case 'ghost':
              return {
                backgroundColor: 'transparent',
                color: theme.primaryColor || '#374151',
                border: `2px solid ${theme.primaryColor || '#D1D5DB'}`
              };
            default:
              return {};
          }
        })() : {}),
        // Apply component base styles
        ...(component.styles || {}),
        // Apply component custom styles (higher precedence)
        ...(component.customStyles || {}),
        // Apply props style (highest precedence)
        ...(buttonComp.props.style || {}),
        // Ensure proper text color contrast for custom background colors
        ...(hasCustomBackground ? {
          color: buttonComp.props.style?.color || (
            // Smart contrast: white text for dark backgrounds, dark text for light backgrounds
            buttonVariant === 'secondary' ? (theme?.primaryColor || '#374151') : '#FFFFFF'
          )
        } : {})
      };
      
      return (
        <ComponentWrapper key={key}>
          <MobileButton
            text={buttonComp.props.text}
            variant={buttonComp.props.variant || 'primary'}
            fullWidth={buttonComp.props.fullWidth !== false}
            disabled={buttonComp.props.disabled}
            rounded={buttonComp.props.rounded}
            style={buttonMergedStyles}
          />
        </ComponentWrapper>
      );

    case 'OptionGroup':
      const optionComp = component as OptionGroupComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileOptionGroup
            title={optionComp.props.title}
            options={optionComp.props.options}
            type={optionComp.props.type || 'radio'}
            multiSelect={optionComp.props.multiSelect}
            value={optionComp.props.value}
            color={(optionComp.props as any).color}
          />
        </ComponentWrapper>
      );

    case 'Image':
      const imageComp = component as ImageComponent;
      // Skip rendering if src is missing or invalid
      if (!imageComp.props?.src) {
        console.warn('Image component missing src property, skipping render');
        return <div key={key} className="hidden" />;
      }
      return (
        <ComponentWrapper key={key}>
          <MobileImage
            src={imageComp.props.src}
            alt={imageComp.props.alt || ''}
            size={imageComp.props.size || 'md'}
            alignment={imageComp.props.alignment || 'center'}
            borderRadius={imageComp.props.borderRadius || 'md'}
          />
        </ComponentWrapper>
      );

    case 'ProgressBar':
      const progressComp = component as ProgressBarComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileProgressBar
            value={progressComp.props.value}
            max={progressComp.props.max}
            color={progressComp.props.color || theme?.primaryColor || '#3B82F6'}
            label={progressComp.props.label}
            showPercentage={progressComp.props.showPercentage}
          />
        </ComponentWrapper>
      );

    case 'Slider':
      const sliderComp = component as SliderComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileSlider
            label={sliderComp.props.label}
            min={sliderComp.props.min}
            max={sliderComp.props.max}
            step={sliderComp.props.step}
            unit={sliderComp.props.unit}
            value={sliderComp.props.initialValue}
            color={sliderComp.props.color || theme?.primaryColor || '#3B82F6'}
          />
        </ComponentWrapper>
      );

    case 'Card':
      const cardComp = component as CardComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileCard
            title={cardComp.props.title}
            content={cardComp.props.content}
            highlighted={cardComp.props.highlighted}
            clickable={cardComp.props.clickable}
            imageUrl={cardComp.props.imageUrl}
          />
        </ComponentWrapper>
      );

    case 'ToggleSwitch':
      const toggleComp = component as ToggleComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileToggle
            label={toggleComp.props.label}
            value={toggleComp.props.value}
            color={toggleComp.props.color || theme?.primaryColor || '#3B82F6'}
            description={toggleComp.props.description}
          />
        </ComponentWrapper>
      );

    case 'Spacer':
      const spacerComp = component as SpacerComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileSpacer
            height={spacerComp.props.height || 'md'}
          />
        </ComponentWrapper>
      );

    case 'BottomSheet':
      const bottomSheetComp = component as BottomSheetComponent;
      return (
        <ComponentWrapper key={key}>
          <MobileBottomSheet
            title={bottomSheetComp.props.title}
            content={bottomSheetComp.props.content}
            trigger_text={bottomSheetComp.props.trigger_text}
            action_text={bottomSheetComp.props.action_text}
            variant={bottomSheetComp.props.variant}
            isOpen={bottomSheetComp.props.isOpen}
          />
        </ComponentWrapper>
      );

    case 'ProgressDots':
      const progressDotsComp = component as any;
      return (
        <ComponentWrapper key={key}>
          <MobileProgressDots
            total={progressDotsComp.props.total}
            current={progressDotsComp.props.current}
            color={progressDotsComp.props.color || theme?.primaryColor || '#3B82F6'}
          />
        </ComponentWrapper>
      );

    case 'PlaceholderIllustration':
      const illustrationComp = component as any;
      return (
        <ComponentWrapper key={key}>
          <MobilePlaceholderIllustration
            type={illustrationComp.props.type}
            color={illustrationComp.props.color || theme?.primaryColor || '#3B82F6'}
            className={illustrationComp.props.className}
          />
        </ComponentWrapper>
      );

    case 'LoadingSpinner':
      const spinnerComp = component as any;
      return (
        <ComponentWrapper key={key}>
          <MobileLoadingSpinner
            size={spinnerComp.props.size}
            color={spinnerComp.props.color || theme?.primaryColor || '#3B82F6'}
          />
        </ComponentWrapper>
      );

    case 'CardGrid':
      const cardGridComp = component as any;
      return (
        <ComponentWrapper key={key}>
          <MobileCardGrid
            title={cardGridComp.props.title}
            multiSelect={cardGridComp.props.multiSelect !== false}
            columns={cardGridComp.props.columns || 2}
            selectedColor={cardGridComp.props.selectedColor || theme?.primaryColor || '#EF4444'}
            unselectedColor={cardGridComp.props.unselectedColor || '#E5E7EB'}
            options={cardGridComp.props.options || []}
            selectedValues={cardGridComp.props.selectedValues || []}
          />
        </ComponentWrapper>
      );

    default:
      console.warn(`Unknown component type: ${(component as any).type}`);
      return (
        <ComponentWrapper key={key}>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-6 my-2">
            <p className="text-sm text-yellow-800">
              Unknown component: {(component as any).type}
            </p>
          </div>
        </ComponentWrapper>
      );
  }
};

// Single screen renderer
interface MobileScreenProps {
  screen: UIScreen;
  onNavigate?: (action: string, target?: string) => void;
  editMode?: boolean;
  onEditComponent?: (componentIndex: number) => void;
  onDeleteComponent?: (componentIndex: number) => void;
  theme?: UIFlow['theme'];
}

export const MobileScreen: React.FC<MobileScreenProps> = ({ 
  screen, 
  onNavigate,
  editMode = false,
  onEditComponent,
  onDeleteComponent,
  theme
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `mobile-screen-${screen.id}`,
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full h-full"
    >
      <div
        ref={setNodeRef}
        className={`w-full h-full relative ${isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
      >
        <Screen
          id={screen.id}
          name={screen.name}
          bgType={screen.bgType}
          bgValue={screen.bgValue}
          overlayColor={(screen as any).overlayColor}
        >
          {screen.components.map((component, index) => (
            <motion.div
              key={`${screen.id}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5, 
                ease: "easeOut" 
              }}
            >
              {renderUIComponent(component, index, editMode, onEditComponent, onDeleteComponent, theme)}
            </motion.div>
          ))}
          
          {/* Drop zone indicator when dragging over */}
          {isOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-blue-50/80 backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-blue-700 font-medium">Drop component here</p>
                <p className="text-blue-600 text-sm">Release to add to screen</p>
              </div>
            </motion.div>
          )}
        </Screen>
      </div>
    </motion.div>
  );
};

// Main MobileFrame component - renders entire UI flows
interface MobileFrameProps {
  screen?: UIScreen;
  flow?: UIFlow;
  currentScreenIndex?: number;
  onScreenChange?: (index: number) => void;
  showNavigation?: boolean;
  className?: string;
  editMode?: boolean;
  onEditComponent?: (componentIndex: number) => void;
  onDeleteComponent?: (componentIndex: number) => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  screen,
  flow,
  currentScreenIndex = 0,
  onScreenChange,
  showNavigation = true,
  className,
  editMode = false,
  onEditComponent,
  onDeleteComponent
}) => {
  const [screenIndex, setScreenIndex] = useState(currentScreenIndex);

  // Update internal screenIndex when currentScreenIndex prop changes
  useEffect(() => {
    setScreenIndex(currentScreenIndex);
  }, [currentScreenIndex]);

  // Single screen mode
  if (screen && !flow) {
    return (
      <MobilePhone className={className}>
        <MobileScreen 
          screen={screen} 
          editMode={editMode}
          onEditComponent={onEditComponent}
          onDeleteComponent={onDeleteComponent}
          theme={undefined}
        />
      </MobilePhone>
    );
  }

  // Flow mode
  if (flow && flow.screens.length > 0) {
    const currentScreen = flow.screens[screenIndex];
    
    const handleNext = () => {
      const nextIndex = Math.min(screenIndex + 1, flow.screens.length - 1);
      setScreenIndex(nextIndex);
      onScreenChange?.(nextIndex);
    };

    const handleBack = () => {
      const prevIndex = Math.max(screenIndex - 1, 0);
      setScreenIndex(prevIndex);
      onScreenChange?.(prevIndex);
    };

    return (
      <div className={className}>
        <MobilePhone>
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <MobileScreen 
                key={screenIndex} 
                screen={currentScreen}
                editMode={editMode}
                onEditComponent={onEditComponent}
                onDeleteComponent={onDeleteComponent}
                theme={flow.theme}
              />
            </AnimatePresence>
          </div>
        </MobilePhone>
        
        {showNavigation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MobileNavigation
              currentScreen={screenIndex}
              totalScreens={flow.screens.length}
              onNext={screenIndex < flow.screens.length - 1 ? handleNext : undefined}
              onBack={screenIndex > 0 ? handleBack : undefined}
            />
          </motion.div>
        )}
      </div>
    );
  }

  // Empty state
  return (
    <MobilePhone className={className}>
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No screen or flow provided</p>
        </div>
      </div>
    </MobilePhone>
  );
};

// AI Generator Integration Component
interface AIGeneratorFrameProps {
  generatedJSON?: string;
  onError?: (error: string) => void;
  className?: string;
}

export const AIGeneratorFrame: React.FC<AIGeneratorFrameProps> = ({
  generatedJSON,
  onError,
  className
}) => {
  if (!generatedJSON) {
    return (
      <MobilePhone className={className}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <div className="text-blue-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Generate UI with AI</p>
          </div>
        </div>
      </MobilePhone>
    );
  }

  try {
    const parsed = JSON.parse(generatedJSON);
    
    // Handle single screen
    if (parsed.components) {
      return <MobileFrame screen={parsed as UIScreen} className={className} />;
    }
    
    // Handle flow
    if (parsed.screens) {
      return <MobileFrame flow={parsed as UIFlow} className={className} />;
    }
    
    // Handle array of screens
    if (Array.isArray(parsed)) {
      const flow: UIFlow = {
        id: 'generated-flow',
        name: 'AI Generated Flow',
        screens: parsed
      };
      return <MobileFrame flow={flow} className={className} />;
    }

    throw new Error('Invalid JSON structure');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
    onError?.(errorMessage);
    
    return (
      <MobilePhone className={className}>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 text-sm font-medium">JSON Parse Error</p>
            <p className="text-gray-500 text-xs mt-1">{errorMessage}</p>
          </div>
        </div>
      </MobilePhone>
    );
  }
};

export default MobileFrame;