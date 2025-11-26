/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; 

import { useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiRequest } from './apiMiddleware';

interface ApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  requiresAuth?: boolean;
}

export function useApi<T = any, P = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: ApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { accessToken } = useAppSelector(state => state.auth);
  const { requiresAuth = true, onSuccess, onError } = options;
  
  const execute = useCallback(
    async (payload?: P) => {
      setLoading(true);
      setError(null);
      
      try {
        const authToken = requiresAuth && accessToken ? accessToken : undefined;
        const result = await apiRequest(
          endpoint,
          method,
          method !== 'GET' ? payload : undefined,
          authToken
        );
        
        setData(result);
        if (onSuccess) onSuccess(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        if (onError) onError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, requiresAuth, accessToken, onSuccess, onError]
  );
  
  return { execute, data, loading, error };
} 