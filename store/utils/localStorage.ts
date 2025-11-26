"use client";

import { deleteCookie } from "cookies-next/client";

// 🔐 CENTRALIZED LOCALSTORAGE MANAGEMENT
// จัดการ localStorage ทั้งหมดในที่เดียว เพื่อความสอดคล้องและง่ายต่อการบำรุงรักษา

// ===== STORAGE KEYS CONSTANTS =====
export const STORAGE_KEYS = {
  // Main authentication tokens
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN: 'token',
  USER: 'user',
  VALIDATE_DATA: 'validateData',
  
  // Redux persist data
  PERSIST_AUTH: 'persist:auth',
  PERSIST_UI: 'persist:ui',
  
  // Alternative token formats (for backward compatibility)
  ALT_ACCESS_TOKEN: 'access_token',
  ALT_REFRESH_TOKEN: 'refresh_token',
  ALT_USER_DATA: 'user_data',
  
  // Auth-related data
  GUEST_NAME: 'guestName',
  IS_GUEST: 'isGuest',
  REMEMBER_ME: 'remember_me',
  LOGIN_STATUS: 'login_status',
  LOGOUT_STATUS: 'logout_status',
  LOGIN_MESSAGE_SHOWN: 'login_message_shown',
  
  // Certificate Authority data
  CERTIFICATE_AUTHORITY: 'certificateAuthority',
  
  // Development/cache data
  ALLY_SUPPORTS_CACHE: 'ally-supports-cache',
  NUXT_DEVTOOLS_FRAME_STATE: 'nuxt-devtools-frame-state',
  NUXT_LOADING_ENABLE_ANIMATION: 'nuxt-loading-enable-animation',
  ONE_DATA: 'oneData',
} as const;

export const SESSION_STORAGE_KEYS = {
  IS_GUEST: 'isGuest',
  PENDING_TRANSACTION_PAYLOAD: 'pendingTransactionPayload',
  USER_DATA: 'user_data',
  LOGIN_STATUS: 'login_status',
  LOGIN_MESSAGE_SHOWN: 'login_message_shown',
} as const;

// ===== BASIC STORAGE OPERATIONS =====
export const storageUtils = {
  // Safe localStorage operations
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') {
      console.warn(`⚠️ Window undefined, cannot set localStorage item ${key}`);
      return;
    }
    try {
      localStorage.setItem(key, value);
      const retrieved = localStorage.getItem(key);
      const success = retrieved === value;
    } catch (error) {
      console.error(`❌ Failed to set localStorage item ${key}:`, error);
    }
  },

  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get localStorage item ${key}:`, error);
      return null;
    }
  },

  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item ${key}:`, error);
    }
  },

  // Safe sessionStorage operations  
  setSessionItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set sessionStorage item ${key}:`, error);
    }
  },

  getSessionItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get sessionStorage item ${key}:`, error);
      return null;
    }
  },

  removeSessionItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove sessionStorage item ${key}:`, error);
    }
  },
};

// ===== AUTH-SPECIFIC OPERATIONS =====
export const authStorage = {
  // Store authentication tokens
  setTokens: (accessToken: string, refreshToken?: string) => {
    
    storageUtils.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storageUtils.setItem(STORAGE_KEYS.TOKEN, accessToken);
    
    if (refreshToken) {
      storageUtils.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  // Get authentication tokens
  getAccessToken: (): string | null => {
    return storageUtils.getItem(STORAGE_KEYS.ACCESS_TOKEN) || 
           storageUtils.getItem(STORAGE_KEYS.TOKEN) ||
           storageUtils.getSessionItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return storageUtils.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // Store user data
  setUser: (userData: any) => {
    const userDataString = JSON.stringify(userData);
    storageUtils.setItem(STORAGE_KEYS.USER, userDataString);
  },

  // Get user data
  getUser: (): any | null => {
    const localUserData = storageUtils.getItem(STORAGE_KEYS.USER);
    const sessionUserData = storageUtils.getSessionItem(STORAGE_KEYS.USER);
    
    try {
      return localUserData 
        ? JSON.parse(localUserData) 
        : sessionUserData 
        ? JSON.parse(sessionUserData) 
        : null;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const accessToken = authStorage.getAccessToken();
    return !!accessToken;
  },

  // Check if user is guest
  isGuest: (): boolean => {
    return storageUtils.getSessionItem(SESSION_STORAGE_KEYS.IS_GUEST) === "true";
  },

  // Store certificate authority data
  setCertificateAuthority: (caData: any) => {
    const caDataString = JSON.stringify(caData);
    storageUtils.setItem(STORAGE_KEYS.CERTIFICATE_AUTHORITY, caDataString);
  },

  // Get certificate authority data
  getCertificateAuthority: (): any | null => {
    const caData = storageUtils.getItem(STORAGE_KEYS.CERTIFICATE_AUTHORITY);
    
    try {
      return caData ? JSON.parse(caData) : null;
    } catch (error) {
      console.error('Failed to parse certificate authority data:', error);
      return null;
    }
  },

  // Clear certificate authority data
  clearCertificateAuthority: () => {
    storageUtils.removeItem(STORAGE_KEYS.CERTIFICATE_AUTHORITY);
  },

  // Helper functions สำหรับการใช้งาน Certificate Authority ข้อมูล
  getOfficerCredentials: (): any[] => {
    const caData = authStorage.getCertificateAuthority();
    if (!caData?.data?.credentials) return [];
    
    return caData.data.credentials.filter((cred: any) => cred.isOfficer);
  },

  getLegalEntityCredentials: (): any[] => {
    const caData = authStorage.getCertificateAuthority();
    if (!caData?.data?.credentials) return [];
    
    return caData.data.credentials.filter((cred: any) => cred.isLegalEntity);
  },

  getCredentialsSummary: (): { total: number; officers: number; legalEntities: number } | null => {
    const caData = authStorage.getCertificateAuthority();
    return caData?.data?.summary || null;
  },

  // ค้นหา credential โดย credentialId
  findCredentialById: (credentialId: string): any | null => {
    const caData = authStorage.getCertificateAuthority();
    if (!caData?.data?.credentials) return null;
    
    return caData.data.credentials.find((cred: any) => cred.credentialId === credentialId) || null;
  },

  // ตรวจสอบว่ามี credential ประเภทใดบ้าง
  hasOfficerCredentials: (): boolean => {
    const summary = authStorage.getCredentialsSummary();
    return summary ? summary.officers > 0 : false;
  },

  hasLegalEntityCredentials: (): boolean => {
    const summary = authStorage.getCredentialsSummary();
    return summary ? summary.legalEntities > 0 : false;
  },
};

// ===== COMPREHENSIVE CLEANUP =====
export const clearAllUserSession = (preserveUISettings: boolean = false) => {
  if (typeof window === 'undefined') return;
  
  // ✅ Main authentication tokens (from console application keys)
  const authKeys = [
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.TOKEN,
    STORAGE_KEYS.USER,
    STORAGE_KEYS.VALIDATE_DATA,
  ];

  // ✅ Redux persist data
  const persistKeys = [
    STORAGE_KEYS.PERSIST_AUTH,
    // Only include PERSIST_UI if not preserving UI settings
    ...(preserveUISettings ? [] : [STORAGE_KEYS.PERSIST_UI]),
  ];

  // ✅ Alternative token formats
  const altKeys = [
    STORAGE_KEYS.ALT_ACCESS_TOKEN,
    STORAGE_KEYS.ALT_REFRESH_TOKEN,
    STORAGE_KEYS.ALT_USER_DATA,
  ];

  // ✅ Auth-related data
  const authRelatedKeys = [
    STORAGE_KEYS.GUEST_NAME,
    // STORAGE_KEYS.IS_GUEST,
    STORAGE_KEYS.REMEMBER_ME,
    STORAGE_KEYS.LOGIN_STATUS,
    STORAGE_KEYS.LOGOUT_STATUS,
    STORAGE_KEYS.LOGIN_MESSAGE_SHOWN,
    STORAGE_KEYS.CERTIFICATE_AUTHORITY,
  ];

  // ✅ Development/cache data
  const devKeys = [
    STORAGE_KEYS.ALLY_SUPPORTS_CACHE,
    STORAGE_KEYS.NUXT_DEVTOOLS_FRAME_STATE,
    STORAGE_KEYS.NUXT_LOADING_ENABLE_ANIMATION,
    STORAGE_KEYS.ONE_DATA,
  ];

  // Clear all localStorage items
  [...authKeys, ...persistKeys, ...altKeys, ...authRelatedKeys, ...devKeys]
    .forEach(key => storageUtils.removeItem(key));

  // ✅ Clear sessionStorage
  Object.values(SESSION_STORAGE_KEYS)
    .forEach(key => storageUtils.removeSessionItem(key));
  
  const uiNote = preserveUISettings ? ' (UI settings preserved)' : '';
  // deleteCookie("user")
  // deleteCookie("accessToken");
  // deleteCookie("refreshToken");
  // deleteCookie("user");
};

// ===== SPECIFIC AUTH OPERATIONS =====
export const authOperations = {
  // Login - store all auth data
  login: (authData: {
    accessToken: string;
    refreshToken?: string;
    user: any;
  }) => {
    // Store tokens
    authStorage.setTokens(authData.accessToken, authData.refreshToken);
    
    // Store user data
    authStorage.setUser(authData.user);
    
  },

  // Logout - clear all auth data (by default clears UI settings too)
  logout: (preserveUISettings: boolean = false) => {
    clearAllUserSession(preserveUISettings);
  },

  // Check token expiration and validity
  isTokenValid: (): boolean => {
    // This can be enhanced with actual token validation logic
    return authStorage.isAuthenticated();
  },

  // Get current auth state
  getAuthState: () => {
    return {
      isAuthenticated: authStorage.isAuthenticated(),
      isGuest: authStorage.isGuest(),
      user: authStorage.getUser(),
      accessToken: authStorage.getAccessToken(),
    };
  },
};

// Export default as collection of all utilities
export default {
  keys: STORAGE_KEYS,
  sessionKeys: SESSION_STORAGE_KEYS,
  storage: storageUtils,
  auth: authStorage,
  operations: authOperations,
  clearAll: clearAllUserSession,
}; 