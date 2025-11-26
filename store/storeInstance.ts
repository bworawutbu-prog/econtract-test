/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// 🎯 FIXED: Separate store instance to avoid circular dependencies
// Use lazy import to break circular dependency chain
// This file exports a getter function that lazily imports the store

let storeInstance: any = null;

export function getStore() {
  if (!storeInstance) {
    // Use require for lazy loading to break circular dependency
    const storeModule = require("./index");
    storeInstance = storeModule.store;
  }
  return storeInstance;
}

// For backward compatibility, export store as a getter
export const store = {
  getState: () => getStore().getState(),
  dispatch: (action: any) => getStore().dispatch(action),
  subscribe: (listener: any) => getStore().subscribe(listener),
  replaceReducer: (nextReducer: any) => getStore().replaceReducer(nextReducer),
};

