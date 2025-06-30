import React, { cloneElement, type ReactElement, useState } from 'react';
import { CustomizationPanel, type CustomizableProps, useCustomization } from './CustomizationPanel';

export interface CustomizableWrapperProps {
  children: ReactElement;
  onCustomize?: (customizations: CustomizableProps) => void;
  defaultProps?: CustomizableProps;
}

export function CustomizableWrapper({ 
  children, 
  onCustomize,
  defaultProps = {}
}: CustomizableWrapperProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [currentProps, setCurrentProps] = useState<CustomizableProps>(defaultProps);

  const handleCustomize = (updates: CustomizableProps) => {
    const newProps = { ...currentProps, ...updates };
    setCurrentProps(newProps);
    onCustomize?.(newProps);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPanel(true);
  };

  // Safely merge props
  const childProps = (children.props as any) || {};
  const enhancedProps = {
    ...childProps,
    ...currentProps,
    className: `${childProps.className || ''} ${currentProps.className || ''}`.trim(),
    style: {
      ...childProps.style,
      ...currentProps.style,
    },
    onContextMenu: handleRightClick,
  };

  const enhancedChild = cloneElement(children, enhancedProps);

  return (
    <>
      {enhancedChild}
      
      <CustomizationPanel
        open={showPanel}
        onClose={() => setShowPanel(false)}
        element={children}
        onUpdate={handleCustomize}
        currentProps={currentProps}
      />
    </>
  );
}

// Pre-built customizable components
export const CustomizableButton: React.FC<any> = (props) => (
  <CustomizableWrapper elementType="Button" defaultProps={{ colorScheme: 'indigo', size: 'md', variant: 'solid' }}>
    <button {...props} />
  </CustomizableWrapper>
);

export const CustomizableCard: React.FC<any> = (props) => (
  <CustomizableWrapper elementType="Card" defaultProps={{ colorScheme: 'gray', variant: 'default' }}>
    <div {...props} />
  </CustomizableWrapper>
);

export const CustomizableHeadline: React.FC<any> = (props) => (
  <CustomizableWrapper elementType="Headline" defaultProps={{ colorScheme: 'gray', size: 'xl' }}>
    <h1 {...props} />
  </CustomizableWrapper>
); 