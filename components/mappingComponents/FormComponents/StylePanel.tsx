/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from 'lodash/debounce';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  Palette,
} from "lucide-react";
import { Dropdown , ColorPicker, Slider, Space } from "antd";
import type { Color } from "antd/es/color-picker";
import { ElementStyle } from "../../../store/types/FormTypes";
import {
  getStylePanelDefaults,
  STYLE_CONSTANTS,
} from "../FormUtils/defaultStyle";
import { enqueueSnackbar } from "notistack";

interface StylePanelProps {
  style: ElementStyle;
  onStyleChange: (style: ElementStyle) => void;
  computedDefaults?: ElementStyle; // Optional computed defaults from FormCanvas
  elementId?: string; // Add elementId to track element changes
  documentType?: string; // 🎯 NEW: Document mode (create, draft, template)
}

// Helper functions for color conversion
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbaToHex = (rgba: string): string => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return "#ffffff";

  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
};

const extractOpacityFromRgba = (rgba: string): number => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  return match && match[4] ? parseFloat(match[4]) : 1;
};

// 🎯 CENTRALIZED: getDefaultStyle replaced by getStylePanelDefaults from defaultStyle.ts

const StylePanel: React.FC<StylePanelProps> = ({
  style,
  onStyleChange,
  computedDefaults,
  elementId,
  documentType, // 🎯 NEW: Document mode for template mode
}) => {
  const isTemplateMode = false;
  void documentType;
  const [localStyle, setLocalStyle] = useState<ElementStyle>(style);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [bgOpacity, setBgOpacity] = useState<number>(0.3); // Default to 80% opacity
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [userChanges, setUserChanges] = useState<Partial<ElementStyle>>({});
  const styleRef = useRef<ElementStyle>(style);
  const previousElementIdRef = useRef<string | undefined>(elementId);

  useEffect(() => {
    // Reset all state when element changes (new element selected)
    if (previousElementIdRef.current !== elementId) {
      
      // 🎯 FIX: Force complete state reset when element changes
      // Reset all local state
      setUserChanges({});
      setIsInputFocused(false);
      
      // Parse new element's style with fresh defaults
      const dynamicDefaults = getStylePanelDefaults(style, computedDefaults);
      const newElementStyle = { ...dynamicDefaults, ...style };
      
      setLocalStyle(newElementStyle);
      styleRef.current = newElementStyle;
      previousStyleRef.current = { ...style };
      
      // Parse backgroundColor for new element
      const bgColorToUse = newElementStyle.backgroundColor || dynamicDefaults.backgroundColor;
      if (bgColorToUse) {
        if (bgColorToUse === "transparent") {
          setBgColor("#ffffff");
          setBgOpacity(0);
        } else if (bgColorToUse.startsWith("rgba")) {
          setBgColor(rgbaToHex(bgColorToUse));
          setBgOpacity(extractOpacityFromRgba(bgColorToUse));
        } else if (bgColorToUse.startsWith("#")) {
          setBgColor(bgColorToUse);
          setBgOpacity(1);
        }
      } else {
        // Default values if no background color
        setBgColor("#ffffff");
        setBgOpacity(0.3);
      }
      
      // Update ref
      previousElementIdRef.current = elementId;
    }
  }, [elementId, style, computedDefaults]);

  // Update local state when props change and no input is focused
  useEffect(() => {
    // Skip if element just changed (handled by element reset effect above)
    if (previousElementIdRef.current !== elementId) {
      return;
    }
    
    if (!isInputFocused) {
      // 🎯 CENTRALIZED: Use getStylePanelDefaults from defaultStyle.ts
      const dynamicDefaults = getStylePanelDefaults(style, computedDefaults);
      
      // 🎨 Smart merging with comprehensive user changes preservation (like Canva/Photoshop)
      // Always prioritize userChanges over incoming style to preserve user's work
      const mergedStyle = {
        ...dynamicDefaults,
        ...style,
        ...userChanges, 
        ...(style?.width && { width: style.width }),
        ...(style?.height && { height: style.height }),
      };
    
      setLocalStyle(mergedStyle);
      styleRef.current = mergedStyle;

      // Parse backgroundColor to separate color and opacity using the merged style
      const bgColorToUse =
        mergedStyle.backgroundColor || dynamicDefaults.backgroundColor;
      if (bgColorToUse) {
        if (bgColorToUse === "transparent") {
          setBgColor("#ffffff");
          setBgOpacity(0);
        } else if (bgColorToUse.startsWith("rgba")) {
          setBgColor(rgbaToHex(bgColorToUse));
          setBgOpacity(extractOpacityFromRgba(bgColorToUse));
        } else if (bgColorToUse.startsWith("#")) {
          setBgColor(bgColorToUse);
          setBgOpacity(1);
        }
      }
    }
  }, [isInputFocused, computedDefaults, elementId, style]); // 🎯 Add style dependency

  // Separate effect for style prop changes (only when incoming style changes)
  const previousStyleRef = useRef<ElementStyle | null>(null);
  useEffect(() => {
    // Update when incoming style changes (but only if not currently editing)
    if (!isInputFocused && style) {
      const styleChanged = JSON.stringify(previousStyleRef.current) !== JSON.stringify(style);
      
      if (styleChanged) {
     
        const isNewElement = !previousStyleRef.current;
        
        if (isNewElement) {
          setUserChanges({});
        }
        
        previousStyleRef.current = { ...style };
      }
    }
  }, [style, isInputFocused, userChanges]);

  // Create a debounced version of onStyleChange for less critical updates
  // For immediate visual feedback, we'll call onStyleChange directly for some properties
  const debouncedStyleChange = useCallback(
    debounce((newStyle: ElementStyle) => {
      onStyleChange(newStyle);
    }, 200), // Reduced debounce time for better responsiveness
    [onStyleChange]
  );

  // Handle style changes with immediate or debounced updates
  const handleStyleChange = useCallback(
    (property: keyof ElementStyle, value: any, immediate: boolean = false) => {
      // Don't allow direct width/height changes - these should only come from resize system
      if (property === "width" || property === "height") {
        enqueueSnackbar(`🎯 [StylePanel] Blocked attempt to change ${property} - use resize handles instead`, {
          variant: "warning",
          autoHideDuration: 3000,
        });
        return;
      }

      // Update userChanges first (this will trigger the useEffect to merge)
      setUserChanges(prev => {
        const newUserChanges = {
          ...prev,
          [property]: value
        };
        return newUserChanges;
      });

      // Create new style object with all existing properties plus the updated one
      // Always preserve width and height from current style (which comes from resize system)
      const newStyle = {
        ...styleRef.current,
        [property]: value,
        // Safely preserve width and height from current style
        ...(style?.width && { width: style.width }),
        ...(style?.height && { height: style.height }),
      };

      // Update the ref immediately to have the latest value
      styleRef.current = newStyle;

      // Update local state immediately for responsive UI
      setLocalStyle(newStyle);

      if (
        immediate ||
        [
          "color",
          "backgroundColor",
          "fontWeight",
          "fontStyle",
          "textDecoration",
          "textAlign",
          "justifyContent",
          "fontSize",
          "fontFamily",
        ].includes(property)
      ) {
        onStyleChange(newStyle);
      } else {
        // Debounce the actual propagation to parent for less critical properties
        debouncedStyleChange(newStyle);
      }
    },
    [debouncedStyleChange, onStyleChange, style?.width, style?.height]
  );

  // Handle background color change
  const handleBgColorChange = useCallback(
    (color: string | Color) => {
      const colorValue = typeof color === 'string' ? color : color.toHexString();
      setBgColor(colorValue);

      // Convert to rgba with current opacity
      // Note: handleStyleChange already preserves width/height
      if (bgOpacity === 0) {
        handleStyleChange("backgroundColor", "transparent");
      } else if (bgOpacity === 1) {
        handleStyleChange("backgroundColor", colorValue);
      } else {
        const rgb = hexToRgb(colorValue);
        if (rgb) {
          const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgOpacity})`;
          handleStyleChange("backgroundColor", rgba);
        }
      }
    },
    [bgOpacity, handleStyleChange]
  );

  // Handle background opacity change
  const handleBgOpacityChange = useCallback(
    (opacity: number) => {
      setBgOpacity(opacity);

      // Convert to appropriate format
      // Note: handleStyleChange already preserves width/height
      if (opacity === 0) {
        handleStyleChange("backgroundColor", "transparent");
      } else if (opacity === 1) {
        handleStyleChange("backgroundColor", bgColor);
      } else {
        const rgb = hexToRgb(bgColor);
        if (rgb) {
          const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
          handleStyleChange("backgroundColor", rgba);
        }
      }
    },
    [bgColor, handleStyleChange]
  );

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);

    // When user finishes editing, ensure parent has latest values
    // 🎨 Apply ALL user changes to create final style (like Canva/Photoshop)
    const finalStyle = {
      ...styleRef.current,
      // Safely preserve width and height from current style
      ...(style?.width && { width: style.width }),
      ...(style?.height && { height: style.height }),
    };


    onStyleChange(finalStyle);
  }, [onStyleChange, style?.width, style?.height, userChanges]);

  // Toggle functions for style properties with immediate updates
  const toggleFontWeight = useCallback(() => {
    const newWeight = localStyle?.fontWeight === "bold" ? "normal" : "bold";
    handleStyleChange("fontWeight", newWeight, true); // Immediate update
  }, [localStyle?.fontWeight, handleStyleChange]);

  const toggleFontStyle = useCallback(() => {
    const newStyle = localStyle?.fontStyle === "italic" ? "normal" : "italic";
    handleStyleChange("fontStyle", newStyle, true); // Immediate update
  }, [localStyle?.fontStyle, handleStyleChange]);

  const toggleTextDecoration = useCallback(() => {
    const newDecoration =
      localStyle?.textDecoration === "underline" ? "none" : "underline";
    handleStyleChange("textDecoration", newDecoration, true); // Immediate update
  }, [localStyle?.textDecoration, handleStyleChange]);

  // Reset to default styles based on current style context
  const resetStyles = useCallback(() => {
    const dynamicDefaults = getStylePanelDefaults(style, computedDefaults);
    const completelyResetStyle = {
      ...dynamicDefaults,
      width: undefined,
      height: undefined,
    };

    setUserChanges({}); // 🎨 Clear ALL user changes when resetting
    setLocalStyle(completelyResetStyle);
    styleRef.current = completelyResetStyle;
    setBgColor("#ffffff");
    setBgOpacity(0.3); // Default opacity for the red background 
    onStyleChange(completelyResetStyle);
  }, [onStyleChange, style, computedDefaults, elementId]);

  // Text align buttons data with flex equivalents
  const textAlignOptions = [
    {
      value: "left",
      icon: AlignLeft,
      textAlign: "left",
      justifyContent: "flex-start",
    },
    {
      value: "center",
      icon: AlignCenter,
      textAlign: "center",
      justifyContent: "center",
    },
    {
      value: "right",
      icon: AlignRight,
      textAlign: "right",
      justifyContent: "flex-end",
    },
    {
      value: "justify",
      icon: AlignJustify,
      textAlign: "justify",
      justifyContent: "space-between",
    },
  ];

  // Get background preview style
  const getBgPreviewStyle = () => {
    if (bgOpacity === 0) {
      return { backgroundColor: "transparent", border: "2px dashed #ccc" };
    }

    if (bgOpacity === 1) {
      return { backgroundColor: bgColor };
    }

    const rgb = hexToRgb(bgColor);
    if (rgb) {
      return {
        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgOpacity})`,
      };
    }

    return { backgroundColor: "transparent", border: "2px dashed #ccc" };
  };

  return (
    <div className="form-element style-panel flex gap-2 items-center">
      {/* Font Family */}
      <div className="flex flex-col">
        <select
          id="fontFamily"
          disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
          value={localStyle?.fontFamily || STYLE_CONSTANTS.DEFAULT_FONT_FAMILY}
          onChange={(e) => {
            if (!isTemplateMode) {
              handleStyleChange("fontFamily", e.target.value);
            }
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="p-2 border rounded-md min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="var(--font-sarabun)">Sarabun</option>
          <option value="var(--font-kanit)">Kanit</option>
          <option value="var(--font-noto-sans-thai)">Noto Sans Thai</option>
          <option value="var(--font-ibm-plex-sans-thai)">IBM Plex Sans Thai</option>
        </select>
      </div>

      {/* Font Size */}
      <div className="flex flex-col">
        <input
          id="fontSize"
          type="number"
          min={8}
          max={72}
          disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
          value={localStyle?.fontSize || STYLE_CONSTANTS.DEFAULT_FONT_SIZE}
          onChange={(e) => {
            if (!isTemplateMode) {
              handleStyleChange("fontSize", parseInt(e.target.value));
            }
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="p-2 border rounded-md w-16 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Font Weight Toggle */}
      <button
        disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
        onClick={() => {
          if (!isTemplateMode) {
            toggleFontWeight();
          }
        }}
        className={`p-2 rounded-md transition-colors ${
          localStyle?.fontWeight === "bold"
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-50"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      {/* Font Style Toggle */}
      <button
        disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
        onClick={() => {
          if (!isTemplateMode) {
            toggleFontStyle();
          }
        }}
        className={`p-2 rounded-md transition-colors ${
          localStyle?.fontStyle === "italic"
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-50"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      {/* Text Decoration Toggle */}
      <button
        disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
        onClick={() => {
          if (!isTemplateMode) {
            toggleTextDecoration();
          }
        }}
        className={`p-2 rounded-md transition-colors ${
          localStyle?.textDecoration === "underline"
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-50"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Underline"
      >
        <Underline size={16} />
      </button>

      {/* Text Align Icons */}
      <div className="flex rounded-md overflow-hidden">
        {textAlignOptions?.map(
          ({ value, icon: Icon, textAlign, justifyContent }) => (
            <button
              key={value}
              disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
              onClick={() => {
                if (!isTemplateMode) {
                  // Set both textAlign and justifyContent for compatibility with immediate updates
                  handleStyleChange("textAlign", textAlign, true);
                  handleStyleChange("justifyContent", justifyContent, true);
                }
              }}
              className={`p-2 transition-colors ${
                localStyle?.textAlign === textAlign ||
                localStyle?.justifyContent === justifyContent
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={`Align ${value}`}
            >
              <Icon size={16} />
            </button>
          )
        )}
      </div>

      {/* Text Color */}
      <div className="flex flex-col">
        <input
          id="color"
          type="color"
          disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
          value={localStyle?.color || STYLE_CONSTANTS.DEFAULT_COLOR}
          onChange={(e) => {
            if (!isTemplateMode) {
              handleStyleChange("color", e.target.value);
            }
          }}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="p-1 border rounded-md w-10 h-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Text Color"
        />
      </div>

      {/* Background Color Dropdown */}
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
        // overlayStyle={{ zIndex: 99999 }}
        overlayClassName="z-50"
        popupRender={() => (
          <div className="p-3 bg-white border rounded-lg shadow-lg min-w-[200px]" style={{ zIndex: 99999 }}>
            <div className="space-y-3">
              {/* Color Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <ColorPicker
                  disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
                  value={bgColor}
                  onChange={(color) => {
                    if (!isTemplateMode) {
                      handleBgColorChange(color);
                    }
                  }}
                  showText
                  size="small"
                  getPopupContainer={() => document.body}
                  // panelRender={(_, { components: { Picker, Presets } }) => (
                  //   <div style={{ zIndex: 999999 }}>
                  //     <Picker />
                  //     <Presets />
                  //   </div>
                  // )}
                />
              </div>

              {/* Opacity Section */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mt-2">
                  Opacity: {Math.round(bgOpacity * 100)}%
                </label>
                <Slider
                  disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
                  value={bgOpacity}
                  onChange={(value) => {
                    if (!isTemplateMode) {
                      handleBgOpacityChange(value);
                    }
                  }}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </div>
          </div>
        )}
      >
        <button
          disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
          className="flex items-center gap-1 p-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Background Color & Opacity"
        >
          <div className="w-4 h-4 rounded border" style={getBgPreviewStyle()} />
          <Palette size={12} />
        </button>
      </Dropdown>

      {/* Reset Button */}
      <button
        disabled={isTemplateMode} // 🎯 NEW: Disable in template mode
        onClick={() => {
          if (!isTemplateMode) {
            resetStyles();
          }
        }}
        className="p-2 rounded-md text-gray-700 hover:bg-gray-50 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset to Default"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

export default StylePanel;
