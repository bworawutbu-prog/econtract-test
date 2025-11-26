"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ElementStyle } from "../../../store/types/FormTypes";
import { FormElementConfigData } from "./FormElementConfig";
import { getDefaultElementSize } from "../FormUtils/defaultStyle";

// ========== RESIZE HOOK ==========
interface UseElementResizeProps {
  type: string;
  elementStyle: ElementStyle;
  position?: { x: number; y: number };
  onStyleChange?: (style: ElementStyle) => void;
  onConfigChange?: (config: FormElementConfigData) => void;
  id: string;
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

interface UseElementResizeReturn {
  elementSize: { width: number; height: number };
  setElementSize: (size: { width: number; height: number }) => void;
  isResizing: boolean;
  positionOffset: { x: number; y: number };
  permanentPositionOffset: { x: number; y: number };
  resizeRef: React.RefObject<HTMLDivElement | null>;
  handleResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export const useElementResize = ({
  type,
  elementStyle,
  position,
  onStyleChange,
  onConfigChange,
  id,
  documentType, // 🎯 NEW: Document mode for template mode
}: UseElementResizeProps): UseElementResizeReturn => {
  const isTemplateMode = false;
  void documentType;
  const defaultSize = useMemo(() => getDefaultElementSize(type), [type]);
  
  const [elementSize, setElementSize] = useState({
    width: defaultSize.width,
    height: defaultSize.height,
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [positionOffset, setPositionOffset] = useState({ x: 0, y: 0 });
  const [permanentPositionOffset, setPermanentPositionOffset] = useState({ x: 0, y: 0 });
  
  const resizeRef = useRef<HTMLDivElement>(null);
  const currentSizeRef = useRef({ width: defaultSize.width, height: defaultSize.height });
  const currentPositionOffsetRef = useRef({ x: 0, y: 0 });

  // Update element size based on elementStyle changes
  useEffect(() => {
    const defaultSize = getDefaultElementSize(type);
    
    const width = elementStyle.width 
      ? (typeof elementStyle.width === 'string' 
          ? parseInt(elementStyle.width.replace('px', '')) 
          : elementStyle.width)
      : defaultSize.width;
      
    const height = elementStyle.height 
      ? (typeof elementStyle.height === 'string' 
          ? parseInt(elementStyle.height.replace('px', '')) 
          : elementStyle.height)
      : defaultSize.height;
      
    if (elementSize.width !== width || elementSize.height !== height) {
      setElementSize({ width, height });
      currentSizeRef.current = { width, height };
    }
  }, [elementStyle.width, elementStyle.height, id, type, elementSize.width, elementSize.height]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    if (isTemplateMode) {
      e.preventDefault();
      e.stopPropagation();
      return; // 🎯 NEW: Prevent resize in template mode
    }
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartMousePos({ x: e.clientX, y: e.clientY });
    setStartSize({ ...elementSize });
    setStartPosition({ x: position?.x || 0, y: position?.y || 0 });
    setPositionOffset({ x: 0, y: 0 });
    
    currentSizeRef.current = { ...elementSize };
    currentPositionOffsetRef.current = { x: 0, y: 0 };
  }, [elementSize, position, isTemplateMode]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle || !resizeRef.current) return;

    const deltaX = e.clientX - startMousePos.x;
    const deltaY = e.clientY - startMousePos.y;
    
    let newWidth = startSize.width;
    let newHeight = startSize.height;

    // Calculate new dimensions based on handle
    switch (resizeHandle) {
      case 'se':
        newWidth = startSize.width + deltaX;
        newHeight = startSize.height + deltaY;
        break;
      case 'sw':
        newWidth = startSize.width - deltaX;
        newHeight = startSize.height + deltaY;
        break;
      case 'ne':
        newWidth = startSize.width + deltaX;
        newHeight = startSize.height - deltaY;
        break;
      case 'nw':
        newWidth = startSize.width - deltaX;
        newHeight = startSize.height - deltaY;
        break;
      case 'e':
        newWidth = startSize.width + deltaX;
        break;
      case 'w':
        newWidth = startSize.width - deltaX;
        break;
      case 'n':
        newHeight = startSize.height - deltaY;
        break;
      case 's':
        newHeight = startSize.height + deltaY;
        break;
    }

    // Apply constraints
    newWidth = Math.max(50, Math.min(800, newWidth));
    newHeight = Math.max(30, Math.min(600, newHeight));

    // CSS manipulation for performance
    const element = resizeRef.current;
    const contentElement = element.querySelector('.flex-1') as HTMLElement;
    
    if (contentElement) {
      const styledContentDiv = contentElement.querySelector('div') as HTMLElement;
      
      if (styledContentDiv) {
        styledContentDiv.style.width = `${newWidth}px`;
        styledContentDiv.style.height = `${newHeight}px`;
        styledContentDiv.style.willChange = 'width, height';
      }
      
      contentElement.style.width = `${newWidth}px`;
      contentElement.style.height = `${newHeight}px`;
      contentElement.style.willChange = 'width, height';
    }
    
    // Calculate position offset for handles that need position adjustment
    let offsetX = 0;
    let offsetY = 0;
    
    switch (resizeHandle) {
      case 'nw':
        offsetX = startSize.width - newWidth;
        offsetY = startSize.height - newHeight;
        break;
      case 'n':
        offsetY = startSize.height - newHeight;
        break;
      case 'ne':
        offsetY = startSize.height - newHeight;
        break;
      case 'w':
        offsetX = startSize.width - newWidth;
        break;
      case 'sw':
        offsetX = startSize.width - newWidth;
        break;
    }
    
    currentSizeRef.current = { width: newWidth, height: newHeight };
    currentPositionOffsetRef.current = { x: offsetX, y: offsetY };
    
    if (offsetX !== 0 || offsetY !== 0) {
      element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      element.style.willChange = 'transform';
    }
  }, [isResizing, resizeHandle, startMousePos, startSize, id]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing || !resizeRef.current) return;
    
    const element = resizeRef.current;
    const contentElement = element.querySelector('.flex-1') as HTMLElement;
    
    if (contentElement) {
      const styledContentDiv = contentElement.querySelector('div') as HTMLElement;
      
      if (styledContentDiv) {
        styledContentDiv.style.willChange = 'auto';
        styledContentDiv.style.width = '';
        styledContentDiv.style.height = '';
      }
      
      contentElement.style.willChange = 'auto';
      contentElement.style.width = '';
      contentElement.style.height = '';
    }
    element.style.willChange = 'auto';
    element.style.transform = '';
    
    const finalSize = currentSizeRef.current;
    const finalPositionOffset = currentPositionOffsetRef.current;
    
    setElementSize(finalSize);
    setPositionOffset(finalPositionOffset);
    setIsResizing(false);
    setResizeHandle(null);
    
    // Calculate new position by combining original position with all offsets
    const newPosition = {
      x: (position?.x || 0) + permanentPositionOffset.x + finalPositionOffset.x,
      y: (position?.y || 0) + permanentPositionOffset.y + finalPositionOffset.y,
    };
    
    // Reset position offsets since we're updating the actual position
    setPermanentPositionOffset({ x: 0, y: 0 });
    setPositionOffset({ x: 0, y: 0 });
    currentPositionOffsetRef.current = { x: 0, y: 0 };
    
    // Update style (width/height)
    if (onStyleChange) {
      const newStyle = {
        ...elementStyle,
        width: `${finalSize.width}px`,
        height: `${finalSize.height}px`,
      };
      onStyleChange(newStyle);
    }
    
    // Update position via config change if position actually changed
    if (onConfigChange && (finalPositionOffset.x !== 0 || finalPositionOffset.y !== 0)) {
      const configData: FormElementConfigData = {
        id: id,
        label: '', // Will be ignored in handleFormElementConfig
        position: newPosition,
        style: {
          ...elementStyle,
          width: `${finalSize.width}px`,
          height: `${finalSize.height}px`,
        }
      };
      onConfigChange(configData);
    }
  }, [isResizing, onStyleChange, onConfigChange, elementStyle, id, position, permanentPositionOffset]);

  // Add global event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'nw-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    elementSize,
    setElementSize,
    isResizing,
    positionOffset,
    permanentPositionOffset,
    resizeRef,
    handleResizeStart,
  };
};

// ========== RESIZE HANDLES COMPONENT ==========
interface ResizeHandleProps {
  isSelected: boolean;
  isInputFocused: boolean;
  isUserEditingInModal: boolean;
  isFrontend: () => boolean;
  handleResizeStart: (e: React.MouseEvent, handle: string) => void;
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

export const ResizeHandles: React.FC<ResizeHandleProps> = ({
  isSelected,
  isInputFocused,
  isUserEditingInModal,
  isFrontend,
  handleResizeStart,
  documentType, // 🎯 NEW: Document mode for template mode
}) => {
  const isTemplateMode = false;
  void documentType;
  if (!isSelected || isInputFocused || isUserEditingInModal || isFrontend() || isTemplateMode) return null;

  const handleStyle = {
    position: 'absolute' as const,
    width: '8px',
    height: '8px',
    backgroundColor: '#1890ff',
    border: '1px solid #fff',
    borderRadius: '999px',
    cursor: 'nw-resize',
    zIndex: 1000, // Below formHandle (1001)
  };

  const handles = [
    { id: 'nw', style: { ...handleStyle, top: '-4px', left: '-4px', cursor: 'nw-resize' } },
    { id: 'n', style: { ...handleStyle, top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 'ne', style: { ...handleStyle, top: '-4px', right: '-4px', cursor: 'ne-resize' } },
    { id: 'e', style: { ...handleStyle, top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'se', style: { ...handleStyle, bottom: '-4px', right: '-4px', cursor: 'se-resize' } },
    { id: 's', style: { ...handleStyle, bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'sw', style: { ...handleStyle, bottom: '-4px', left: '-4px', cursor: 'sw-resize' } },
    { id: 'w', style: { ...handleStyle, top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ];

  return (
    <>
      {handles?.map(({ id, style }) => (
        <div
          key={id}
          style={style}
          onMouseDown={(e) => handleResizeStart(e, id)}
          className="resize-handle"
        />
      ))}
    </>
  );
}; 