"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { RootState } from '@/store';
import { authStorage, authOperations } from './localStorage';
import { AuthUser } from "@/store/types/user";

// ===== TYPES & INTERFACES =====
export interface UserData extends AuthUser {
  account_id?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  contentPadding?: boolean;
}

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isPdfLayout?: boolean;
  isMobile?: boolean;
  contentPadding?: boolean;
}

export interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userData: UserData | null;
  isPdfLayout?: boolean;
  isMobile?: boolean;
  colorBgContainer: string;
  handleLogout: () => void;
}

// ===== UTILITY FUNCTIONS =====
export const checkAuthStatus = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  // 🔐 CENTRALIZED - Use authStorage from localStorage utility
  return authStorage.isAuthenticated();
};

export const getAuthHeaders = (state: RootState) => {
  const { accessToken } = state.auth;
  
  if (!accessToken) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

export const getStoredUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;

  // 🔐 CENTRALIZED - Use authStorage from localStorage utility
  return authStorage.getUser();
};

export const requireAuth = (gssp: any) => {
  return async (context: any) => {
    const { req } = context;
    
    // Check for token in cookies or headers
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // Redirect to login page if no token
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    // Call the original getServerSideProps
    return await gssp(context);
  };
};

// ===== REACT HOOKS =====

/**
 * Custom hook to handle authentication status and actions
 * Replaces the old useAuthStatus from authHooks.ts
 */
export function useAuthStatus() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    // 🔐 CENTRALIZED - Use authStorage from localStorage utility
    const storedUserData = authStorage.getUser();
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  const handleLogout = () => {
    // 🔐 CENTRALIZED - Use authOperations from localStorage utility
    authOperations.logout();
    router.push("/login");
  };

  return { userData, handleLogout };
}

/**
 * Enhanced authentication hook with more features
 * Provides comprehensive auth state and methods
 */
export function useAuth() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isGuest: boolean;
    user: UserData | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    isGuest: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // 🔐 CENTRALIZED - Use authOperations from localStorage utility
    const currentState = authOperations.getAuthState();
    setAuthState({
      ...currentState,
      loading: false,
    });
  }, []);

  const login = async (authData: {
    accessToken: string;
    refreshToken?: string;
    user: UserData;
  }) => {
    // 🔐 CENTRALIZED - Use authOperations from localStorage utility
    authOperations.login(authData);
    
    setAuthState({
      isAuthenticated: true,
      isGuest: false,
      user: authData.user,
      loading: false,
    });
  };

  const logout = () => {
    // 🔐 CENTRALIZED - Use authOperations from localStorage utility
    authOperations.logout();
    
    setAuthState({
      isAuthenticated: false,
      isGuest: false,
      user: null,
      loading: false,
    });
  };

  const refreshAuthState = () => {
    const currentState = authOperations.getAuthState();
    setAuthState({
      ...currentState,
      loading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
    refreshAuthState,
    isAdmin: authState.user?.role === 'Admin' || authState.user?.role === 'Super Admin',
    isDesigner: authState.user?.role === 'Designer',
    isMember: authState.user?.role === 'Member',
    isSuperAdmin: authState.user?.role === 'Super Admin',
  };
}

/**
 * Hook for checking if user has specific permissions
 */
export function useAuthPermissions() {
  const { user } = useAuth();
  
  const hasPermission = (requiredRole: string | string[]) => {
    if (!user?.role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };

  const hasAnyPermission = (roles: string[]) => {
    return roles.some(role => hasPermission(role));
  };

  const hasAllPermissions = (roles: string[]) => {
    return roles.every(role => hasPermission(role));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: hasPermission(['Admin', 'Super Admin']),
    isDesigner: hasPermission('Designer'),
    isMember: hasPermission('Member'),
    isSuperAdmin: hasPermission('Super Admin'),
  };
}

// ===== AUTH UTILITIES =====
export const authUtils = {
  checkAuthStatus,
  getStoredUserData,
  getAuthHeaders,
  requireAuth,
};

// Export everything for easy access
export default {
  utils: authUtils,
  hooks: {
    useAuthStatus,
    useAuth,
    useAuthPermissions,
  },
  types: {} as {
    UserData: UserData;
    LayoutProps: LayoutProps;
    SidebarProps: SidebarProps;
    HeaderProps: HeaderProps;
  },
}; 