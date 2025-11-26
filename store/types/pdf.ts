"use client"

import { Object as FabricObject } from 'fabric';

export interface LayerObject {
    id: string;
    type: string;
    visible: boolean;
    object: FabricObject;
    pageNumber: number;
  }
  
/**
 * PageObjectData represents stored data for objects on a PDF page.
 * Note: The 'visible' property exists at both the top level and in properties.
 * - Top level 'visible': Controls if the layer should appear in UI layer management
 * - properties.visible: Represents the actual fabric.js object visibility on canvas
 */
export interface PageObjectData {
    id: string;
    type: string;
    visible: boolean; // Layer visibility state (for layer management UI)
    pageNumber: number;
    properties: {
      type: string;
      top: number;
      left: number;
      width?: number;
      height?: number;
      radius?: number;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
      scaleX: number;
      scaleY: number;
      angle: number;
      visible: boolean; // Canvas object visibility state
      text?: string;
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: string;
      fontStyle?: string;
      textAlign?: string;
      backgroundColor?: string;
    };
  }