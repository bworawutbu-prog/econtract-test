"use client"

import * as fabric from "fabric";

interface TextOptions {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  fill: string;
}

/**
 * เพิ่มรูปสี่เหลี่ยมลงใน Canvas
 */
export const addRectangle = (
  canvas: fabric.Canvas, 
  saveCurrentPageObjects: () => void,
  left: number = 100,
  top: number = 100
) => {
  if (!canvas) return;
  const id = `rect-${Date.now()}`;
  const rectangle = new fabric.Rect({
    top: top,
    left: left,
    width: 100,
    height: 60,
    fill: "rgba(216, 77, 66, 0.3)",
    id: id,
    visible: true,
  });
  canvas.add(rectangle);
  canvas.renderAll();
  saveCurrentPageObjects();
  return rectangle;
};

/**
 * เพิ่มรูปวงกลมลงใน Canvas
 */
export const addCircle = (
  canvas: fabric.Canvas, 
  saveCurrentPageObjects: () => void,
  left: number = 100,
  top: number = 100
) => {
  if (!canvas) return;
  const id = `circle-${Date.now()}`;
  const circle = new fabric.Circle({
    top: top,
    left: left,
    radius: 50,
    fill: "rgba(66, 216, 96, 0.3)",
    id: id,
    visible: true,
  });
  canvas.add(circle);
  canvas.renderAll();
  saveCurrentPageObjects();
  return circle;
};

/**
 * เพิ่มข้อความลงใน Canvas
 */
export const addText = (
  canvas: fabric.Canvas, 
  textOptions: TextOptions,
  saveCurrentPageObjects: () => void,
  setSelectedObject: (obj: fabric.Object | null) => void,
  setShowSettings: (show: boolean) => void,
  setShowTextEditor: (show: boolean) => void,
  left: number = 100,
  top: number = 100
) => {
  if (!canvas) return;
  const id = `text-${Date.now()}`;
  const text = new fabric.IText("New Text", {
    left: left,
    top: top,
    fontFamily: textOptions.fontFamily,
    fontSize: textOptions.fontSize,
    fontWeight: textOptions.fontWeight,
    fontStyle: textOptions.fontStyle,
    textAlign: textOptions.textAlign,
    fill: textOptions.fill,
    backgroundColor: "transparent",
    id: id,
    visible: true,
    required: false,
    maxCharacters: null,
    maxLines: null,
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  setSelectedObject(text);
  setShowSettings(true);
  setShowTextEditor(true);
  saveCurrentPageObjects();
  return text;
};

/**
 * ฟังก์ชันเสริมสำหรับการสร้างรูปแบบอื่นๆ ในอนาคต
 */
export const createCanvasObject = {
  rectangle: addRectangle,
  circle: addCircle,
  text: addText,
}; 