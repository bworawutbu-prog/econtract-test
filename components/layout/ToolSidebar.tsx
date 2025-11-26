"use client";
import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import {
  TypeIcon,
  Calendar1Icon,
  SignatureIcon,
  Square,
  Circle,
  Pencil,
  Eraser,
  Image,
  Save,
  ChevronLeft,
  LayoutGrid,
  Upload
} from "lucide-react";

type IconNames =
  | "TypeIcon"
  | "Calendar1Icon"
  | "SignatureIcon"
  | "Square"
  | "Circle"
  | "Pencil"
  | "Eraser"
  | "Image";

interface ToolCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  tools: EditRouteConfig[];
}

interface EditRouteConfig {
  title: string;
  icon?: IconNames;
  toolType: string;
  options?: {
    color?: boolean;
    shapes?: boolean;
    upload?: boolean;
  };
}

interface ToolSidebarProps {
  activeTool: string;
  isVisible: boolean;
  color: string;
  onColorChange: (color: string) => void;
  onToolSelect: (tool: string) => void;
  onAddText: () => void;
  onAddDate: () => void;
  onAddSignature: () => void;
  onToggleVisibility: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const toolCategories: ToolCategory[] = [
  {
    id: "elements",
    title: "Elements",
    icon: <LayoutGrid size={24} />,
    tools: [
      {
        title: "Text",
        icon: "TypeIcon",
        toolType: "text",
        options: { color: true }
      },
      {
        title: "Shapes",
        icon: "Square",
        toolType: "shape",
        options: { color: true, shapes: true }
      },
      {
        title: "Date/Time",
        icon: "Calendar1Icon",
        toolType: "date"
      },
      {
        title: "Signature",
        icon: "SignatureIcon",
        toolType: "signature"
      }
    ]
  },
  {
    id: "draw",
    title: "Drawing Tools",
    icon: <Pencil size={24} />,
    tools: [
      {
        title: "Draw",
        icon: "Pencil",
        toolType: "draw",
        options: { color: true }
      },
      {
        title: "Erase",
        icon: "Eraser",
        toolType: "eraser"
      }
    ]
  },
  {
    id: "uploads",
    title: "Uploads",
    icon: <Upload size={24} />,
    tools: [
      {
        title: "Image",
        icon: "Image",
        toolType: "image",
        options: { upload: true }
      }
    ]
  }
];

const IconMap: Record<
  IconNames,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  TypeIcon,
  Calendar1Icon,
  SignatureIcon,
  Square,
  Circle,
  Pencil,
  Eraser,
  Image
};

const renderIcon = (iconName?: IconNames) => {
  if (!iconName) return <></>;
  const IconComponent = IconMap[iconName];
  return IconComponent ? React.createElement(IconComponent, { size: 20 }) : <></>;
};

const ToolSidebar: React.FC<ToolSidebarProps> = ({
  activeTool,
  isVisible,
  color,
  onColorChange,
  onToolSelect,
  onAddText,
  onAddDate,
  onAddSignature,
  onToggleVisibility,
  onImageUpload,
  onSave
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("elements");

  if (!isVisible) return <></>;

  const handleToolClick = (toolType: string) => {
    onToolSelect(toolType);
    switch (toolType) {
      case "text":
        onAddText();
        break;
      case "date":
        onAddDate();
        break;
      case "signature":
        onAddSignature();
        break;
      default:
        break;
    }
  };

  const renderColorPicker = () => (
    <div className="flex items-center gap-2 mt-4">
      <span>Color:</span>
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-8 h-8 rounded-md cursor-pointer border-0"
      />
    </div>
  );

  const renderToolOptions = (tool: EditRouteConfig) => {
    const icon = renderIcon(tool.icon);

    if (tool.toolType === "image") {
      return (
        <label className="w-full cursor-pointer">
          <Button className="w-full flex items-center gap-2">
            {icon}
            <span>{tool.title}</span>
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
        </label>
      );
    }

    return (
      <Button
        onClick={() => handleToolClick(tool.toolType)}
        className={`w-full flex items-center gap-2 ${
          activeTool === tool.toolType ? "bg-blue-50" : ""
        }`}
      >
        {icon}
        <span>{tool.title}</span>
      </Button>
    );
  };

  return (
    <div className="flex h-full">
      {/* Category Sidebar */}
      <div className="bg-white shadow-md w-16 flex flex-col items-center py-4">
        {toolCategories?.map((category) => (
          <Tooltip key={category.id} title={category.title} placement="right">
            <Button
              type={activeCategory === category.id ? "primary" : "text"}
              onClick={() => setActiveCategory(category.id)}
              className="mb-2 flex items-center justify-center w-12 h-12"
            >
              {category.icon}
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* Tools Panel */}
      <div className="bg-white shadow-md w-64 relative">
        <div className="absolute top-1/2 -translate-y-1/2 -right-4">
          <button
            onClick={onToggleVisibility}
            className="p-1 bg-white shadow-theme py-2 rounded-lg"
          >
            <ChevronLeft size={20} color="#0153BD" />
          </button>
        </div>

        <div className="p-4">
          {toolCategories?.map((category) => (
            category.id === activeCategory && (
              <div key={category?.id}>
                <h3 className="font-medium mb-4">{category?.title}</h3>
                <div className="space-y-2">
                  {category?.tools?.map((tool) => (
                    <div key={tool.toolType}>
                      {renderToolOptions(tool)}
                      {tool.options?.color && activeTool === tool.toolType && renderColorPicker()}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        <div className="mt-8 border-t p-4">
          <Button
            onClick={onSave}
            type="primary"
            className="w-full flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolSidebar;
