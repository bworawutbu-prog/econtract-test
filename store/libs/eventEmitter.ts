"use client";

type Listener<T = any> = (payload?: T) => void;

class EventEmitter {
  private events: { [key: string]: Listener[] } = {};

  on<T = any>(eventName: string, listener: Listener<T>): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  off<T = any>(eventName: string, listenerToRemove: Listener<T>): void {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(
      (listener) => listener !== listenerToRemove
    );
  }

  emit<T = any>(eventName: string, payload?: T): void {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach((listener) => listener(payload));
  }
}

const appEmitter = new EventEmitter();
export default appEmitter;