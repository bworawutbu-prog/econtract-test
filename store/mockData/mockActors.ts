"use client";
export interface Actor {
    id: string;
    name: string;
    role: string;
    type: "creator" | "signer" | "approver";
    order: number;
  }
  
  export const mockActors: Actor[] = []; 