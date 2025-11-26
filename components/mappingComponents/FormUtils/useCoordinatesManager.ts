"use client";

import { useCallback, useRef } from 'react';
import { FormItem } from '../../../store/types';
import { PageFormItems } from './pdfFormManager';

interface CoordinatesManagerProps {
  pageNumber: number;
  setPageFormItems: (updateFn: (prev: PageFormItems) => PageFormItems) => void;
  setCurrentPageItems: (items: FormItem[]) => void;
}

export function useCoordinatesManager({
  pageNumber,
  setPageFormItems,
  setCurrentPageItems
}: CoordinatesManagerProps) {
  // ใช้ useRef เพื่อเก็บ timeout สำหรับ debounce
  const coordinatesUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<{ [key: string]: string }>({});

  const handleCoordinatesUpdate = useCallback((
    elementId: string, 
    coordinates: { llx: number; lly: number; urx: number; ury: number }
  ) => {
    // สร้าง key สำหรับตรวจสอบการเปลี่ยนแปลง
    const coordinatesKey = `${coordinates.llx}-${coordinates.lly}-${coordinates.urx}-${coordinates.ury}`;
    const lastKey = lastUpdateRef.current[elementId];
    
    // ถ้า coordinates ไม่เปลี่ยนแปลง ไม่ต้องอัพเดท
    if (lastKey === coordinatesKey) {
      
      return;
    }
    
    
    
    // บันทึก coordinates ล่าสุด
    lastUpdateRef.current[elementId] = coordinatesKey;
    
    // ยกเลิก timeout เก่าถ้ามี
    if (coordinatesUpdateTimeoutRef.current) {
      clearTimeout(coordinatesUpdateTimeoutRef.current);
    }
    
    // ตั้ง timeout ใหม่เพื่อ debounce การอัพเดท
    coordinatesUpdateTimeoutRef.current = setTimeout(() => {
      
      
      // อัพเดท pageFormItems
      setPageFormItems(prev => {
        const currentPageItemsFromState = prev[pageNumber] || [];
        let hasChanges = false;
        
        const updatedItems = (currentPageItemsFromState ?? []).map(item => {
          if (item.id === elementId) {
            // ตรวจสอบว่า coordinates เปลี่ยนแปลงจริงหรือไม่
            const hasChanged = !item.coordinates || 
              item.coordinates.llx !== coordinates.llx ||
              item.coordinates.lly !== coordinates.lly ||
              item.coordinates.urx !== coordinates.urx ||
              item.coordinates.ury !== coordinates.ury;
              
            if (hasChanged) {
              
              hasChanges = true;
              return {
                ...item,
                coordinates: coordinates
              };
            }
          }
          return item;
        });
        
        // อัพเดท currentPageItems ถ้ามีการเปลี่ยนแปลง
        if (hasChanges) {
          // ใช้ requestAnimationFrame เพื่อหลีกเลี่ยง state update conflicts
          requestAnimationFrame(() => {
            setCurrentPageItems(updatedItems);
          });
        }
        
        return hasChanges ? {
          ...prev,
          [pageNumber]: updatedItems
        } : prev;
      });
    }, 50); // ลด debounce time เหลือ 50ms
  }, [pageNumber, setPageFormItems, setCurrentPageItems]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (coordinatesUpdateTimeoutRef.current) {
      clearTimeout(coordinatesUpdateTimeoutRef.current);
      coordinatesUpdateTimeoutRef.current = null;
    }
    lastUpdateRef.current = {};
  }, []);

  return {
    handleCoordinatesUpdate,
    cleanup
  };
} 