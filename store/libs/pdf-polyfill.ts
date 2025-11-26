"use client";

// Polyfill for Promise.withResolvers() - สำหรับ browser ที่ไม่รองรับ
if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
  (Promise as any).withResolvers = function withResolvers() {
    let resolve: (value: any) => void;
    let reject: (reason?: any) => void;
    
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return {
      promise,
      resolve: resolve!,
      reject: reject!
    };
  };
}

// Additional polyfills for older browsers
if (typeof window !== 'undefined') {
  // Ensure ArrayBuffer is available
  if (!window.ArrayBuffer) {
    console.warn('ArrayBuffer not available - PDF loading may fail');
  }
  
  // Ensure Uint8Array is available
  if (!window.Uint8Array) {
    console.warn('Uint8Array not available - PDF loading may fail');
  }
}

export {}; 