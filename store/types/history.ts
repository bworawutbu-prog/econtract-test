"use client"

export interface HistoryAction {
  type: 'move' | 'scale' | 'rotate' | 'text' | 'add' | 'delete' | 'modify';
  objectId: string;
  before: {
    left?: number;
    top?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
    text?: string;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    // ... other properties
  };
  after: {
    left?: number;
    top?: number;
    scaleX?: number;
    scaleY?: number;
    angle?: number;
    text?: string;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    // ... other properties
  };
  timestamp: number;
} 