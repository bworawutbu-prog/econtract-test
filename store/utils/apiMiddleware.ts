/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
"use client";

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com';

// API request helper
export const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  token?: string
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    // Handle specific error statuses
    if (response.status === 401) {
      throw new Error('401: Unauthorized');
    } else if (response.status === 403) {
      throw new Error('403: Forbidden');
    } else if (response.status === 404) {
      throw new Error('404: Not Found');
    } else if (response.status === 429) {
      throw new Error('429: Too Many Requests');
    }
    
    // General error
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

// Create a thunk factory with auth token
export const createApiThunk = <ReturnType, ArgType>(
  typePrefix: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  requiresAuth: boolean = true
) => {
  return createAsyncThunk<ReturnType, ArgType, { state: RootState }>(
    typePrefix,
    async (arg, { getState, rejectWithValue }) => {
      try {
        const state = getState();
        const token = requiresAuth ? state.auth.accessToken : "";
        
        const response = await apiRequest(
          endpoint,
          method,
          method !== 'GET' ? arg : "",
          token ?? ""
        );
        
        return response as ReturnType;
      } catch (error: any) {
        return rejectWithValue(error.message || 'An error occurred');
      }
    }
  );
}; 