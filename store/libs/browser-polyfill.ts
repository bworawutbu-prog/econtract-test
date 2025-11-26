"use client";

// Browser compatibility polyfills
if (typeof window !== 'undefined') {
  // Polyfill for Promise.withResolvers()
  if (typeof Promise !== 'undefined' && !(Promise as any).withResolvers) {
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

  // Ensure required APIs are available
  if (!window.ArrayBuffer) {
    console.warn('ArrayBuffer not available - PDF loading may fail');
  }
  
  if (!window.Uint8Array) {
    console.warn('Uint8Array not available - PDF loading may fail');
  }

  // Polyfill for TextEncoder if not available
  if (!window.TextEncoder) {
    (window as any).TextEncoder = class TextEncoder {
      encode(input: string): Uint8Array {
        const utf8 = unescape(encodeURIComponent(input));
        const result = new Uint8Array(utf8.length);
        for (let i = 0; i < utf8.length; i++) {
          result[i] = utf8.charCodeAt(i);
        }
        return result;
      }
    };
  }

  // Polyfill for TextDecoder if not available
  if (!window.TextDecoder) {
    (window as any).TextDecoder = class TextDecoder {
      decode(input: Uint8Array): string {
        return decodeURIComponent(escape(String.fromCharCode.apply(null, input as any)));
      }
    };
  }
}

export {}; 