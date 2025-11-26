/**
 * Responsive Utilities for PDF Template
 * Inspired by Canva.com responsive behavior
 */

import { useState, useEffect, useCallback, RefObject } from 'react';

export interface ViewportDimensions {
  width: number;
  height: number;
}

export interface ResponsiveConfig {
  viewport: ViewportDimensions;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  containerPadding: number;
  optimalScale: number;
}

// Breakpoints inspired by Canva
export const BREAKPOINTS = {
  mobile: 640,    // sm
  tablet: 1024,   // lg
  desktop: 1280,  // xl
} as const;

/**
 * Hook to track viewport dimensions and device type
 */
export function useViewport(): ResponsiveConfig {
  const [viewport, setViewport] = useState<ViewportDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add resize listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const isMobile = viewport.width < BREAKPOINTS.mobile;
  const isTablet = viewport.width >= BREAKPOINTS.mobile && viewport.width < BREAKPOINTS.tablet;
  const isDesktop = viewport.width >= BREAKPOINTS.tablet;

  // Calculate optimal padding based on device
  const containerPadding = isMobile ? 8 : isTablet ? 16 : 32;

  // Calculate optimal scale (placeholder - will be enhanced)
  const optimalScale = calculateOptimalScale(viewport, isMobile, isTablet);

  return {
    viewport,
    isMobile,
    isTablet,
    isDesktop,
    containerPadding,
    optimalScale,
  };
}

/**
 * Calculate optimal scale for PDF based on viewport
 */
function calculateOptimalScale(
  viewport: ViewportDimensions,
  isMobile: boolean,
  isTablet: boolean
): number {
  if (isMobile) {
    return 0.75; // Smaller scale for mobile
  } else if (isTablet) {
    return 0.85; // Medium scale for tablet
  }
  return 1.0; // Full scale for desktop
}

/**
 * Hook to calculate responsive PDF scale based on container and PDF dimensions
 */
export function useResponsivePdfScale(
  containerRef: RefObject<HTMLDivElement | null>,
  pdfDimensions: { width: number; height: number } | null,
  manualScale: number,
  viewport: ResponsiveConfig
): number {
  const [responsiveScale, setResponsiveScale] = useState<number>(1.0);

  useEffect(() => {
    if (!containerRef.current || !pdfDimensions) {
      setResponsiveScale(manualScale);
      return;
    }

    // 🎯 FIXED: On desktop, use manual scale only (no auto-scaling to prevent stretching)
    if (viewport.isDesktop) {
      setResponsiveScale(manualScale);
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth - (viewport.containerPadding * 2);
    const containerHeight = container.clientHeight - (viewport.containerPadding * 2);

    // Calculate scale to fit PDF in container
    const scaleByWidth = containerWidth / pdfDimensions.width;
    const scaleByHeight = containerHeight / pdfDimensions.height;

    // Use the smaller scale to ensure PDF fits in both dimensions
    let autoScale = Math.min(scaleByWidth, scaleByHeight);

    // Apply device-specific constraints
    if (viewport.isMobile) {
      // On mobile, prioritize width fit
      autoScale = Math.min(scaleByWidth, 1.0);
    } else if (viewport.isTablet) {
      // On tablet, allow slight overflow vertically
      autoScale = Math.min(scaleByWidth, scaleByHeight * 1.1);
    }

    // Clamp scale between 0.1 and 3.0
    autoScale = Math.max(0.1, Math.min(3.0, autoScale));

    // Combine with manual scale (zoom)
    const finalScale = autoScale * manualScale;

    setResponsiveScale(finalScale);
  }, [containerRef, pdfDimensions, manualScale, viewport]);

  return responsiveScale;
}

/**
 * Get responsive container styles
 */
export function getResponsiveContainerStyles(viewport: ResponsiveConfig): React.CSSProperties {
  return {
    padding: viewport.isMobile ? '0.5rem' : viewport.isTablet ? '1rem' : '2rem',
    scrollbarGutter: 'stable',
  };
}

/**
 * Get responsive PDF wrapper styles
 */
export function getResponsivePdfWrapperStyles(viewport: ResponsiveConfig): React.CSSProperties {
  return {
    marginBottom: viewport.isMobile ? '2rem' : '3rem',
    transition: 'all 0.3s ease-in-out',
  };
}

/**
 * Calculate responsive page spacing
 */
export function getPageSpacing(viewport: ResponsiveConfig): string {
  if (viewport.isMobile) return 'space-y-2';
  if (viewport.isTablet) return 'space-y-3';
  return 'space-y-4';
}

/**
 * Hook for touch gesture support (pinch zoom for mobile)
 */
export function useTouchGestures(
  elementRef: RefObject<HTMLDivElement | null>,
  onPinchZoom?: (scale: number) => void
) {
  useEffect(() => {
    if (!elementRef.current || !onPinchZoom) return;

    const element = elementRef.current;
    let initialDistance = 0;
    let initialScale = 1;

    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        onPinchZoom(initialScale * scale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance = 0;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, onPinchZoom]);
}