/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";
// "use server";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { setCookie, getCookie, deleteCookie } from 'cookies-next/client';
import { STORAGE_KEYS, storageUtils, authStorage } from "../utils/localStorage";
import { authApi } from "../backendStore";
import { PermissionManager } from "../backendStore/permissionManager";
import { getCertificateAuthority } from "../backendStore/certificateAuthority";
import { getUserProfile } from "../frontendStore/userProfile";

// Export interfaces for use in other files
export interface UserRole {
  biz_id: string;
  dept_id: string;
  role_id: string;
  name: string;
  business_id: string,
  business_name_th: string,
  business_name_eng: string,
}
export interface UserBusiness {
  business_id: string;
  business_name_th: string;
  business_name_eng: string;
  business_level: string;
}

export interface User {
  id?: string;
  username: string;
  email?: string;
  fullName?: string;
  role?: UserRole[] | string; // Can be array from API or string for compatibility
  business?: UserBusiness[] | string;
  avatar?: string;
  login_by?: string;
}

// API Response interface
interface LoginApiResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
  expiration_date: string;
  account_id: string;
  result: string;
  username: string;
  email: string;
  login_by: string;
  role?: UserRole[];
  business?: UserBusiness[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Define cookie options
const cookieOptions = {
  // maxAge: 60 * 60 ,
  // httpOnly: true, //remove the comment ONLY when in DEPLOY !!BUG cannot login
  path: '/',
  secure: process.env.NODE_ENV === 'production', //change to 'development' if in dev mode ,'production' if deploy, 'localhost'
  sameSite: 'lax' as const,
};

export const authCookies = {
  saveTokens: (accessToken: string, refreshToken: string, user?: User) => {
    setCookie("accessToken", accessToken, cookieOptions);
    setCookie("refreshToken", refreshToken, cookieOptions);
    if (user) {
      setCookie("user", JSON.stringify(user), cookieOptions);
    }
  },

  getAccessToken: () => getCookie("accessToken") as string | null,
  getRefreshToken: () => getCookie("refreshToken") as string | null,
  // getUser: () => {
  //   const userCookie = getCookie('user');
  //   if (!userCookie) return null;
  //   try {
  //     return JSON.parse(userCookie as string) as User;
  //   } catch {
  //     return null;
  //   }
  // },
  getUser: () => {
    const userCookie = getCookie("user");
    if (!userCookie) return null;
    try {
      const parsed = JSON.parse(userCookie as string);

      // Very strict validation
      if (
        typeof parsed.username !== "string" ||
        parsed.username.length > 100 ||
        (parsed.email && typeof parsed.email !== "string") ||
        (parsed.role && typeof parsed.role !== "string")
      ) {
        return null; // Reject suspicious data
      }

      return {
        id: parsed.id ?? "",
        username: parsed.username ?? "",
        email: parsed.email ?? "",
        fullName: parsed.fullName ?? "",
        business: parsed.business ?? "",
        role: parsed.role ?? "",
        avatar: parsed.avatar ?? "",
      } as User;
    } catch {
      return null;
    }
  },

  clearTokens: () => {
    deleteCookie("accessToken", { path: "/" });
    deleteCookie("refreshToken", { path: "/" });
    deleteCookie("user", { path: "/" });
  },
};

// Hydrate from cookies
const initialState: AuthState = {
  user: authCookies.getUser(), // 🎯 hydrate user from cookies
  isAuthenticated: !!authCookies.getAccessToken(),
  // token: authCookies.getAccessToken(),
  accessToken: authCookies.getAccessToken(),
  refreshToken: authCookies.getRefreshToken(),
  loading: false,
  error: null,
};

// Create async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { username: string; password: string; useMock?: boolean, account_id?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await authApi.login(credentials);

      if (response.status && response.data) {
        // 🔐 CENTRALIZED AUTH STORAGE - Use authStorage utility
        const apiData = response.data as LoginApiResponse;
        const user = {
          id: apiData.account_id || "0",
          username: apiData.username || credentials.username,
          email: apiData.email || "",
          fullName: apiData.username || credentials.username, // Use username as fullName for now
          role: apiData.role || "Member", // Keep role array from API
          business: apiData.business || [], 
          login_by: apiData.login_by || apiData.email || "",
        };

        //   // Use centralized auth operations
        // authOperations.login({
        //   accessToken: response.data.access_token,
        //   refreshToken: response.data.refresh_token,
        //   user: user,
        // });

        // ✅ Use cookies
        authCookies.saveTokens(response.data.access_token, response.data.refresh_token , user);

        setTimeout(() => {
          dispatch(fetchCertificateAuthority());
          dispatch(getUserProfile());
        }, 100);
        // 🔥 เรียก Certificate Authority API หลังจาก login สำเร็จ
        // try {
        //   const resultCA = await dispatch(fetchCertificateAuthority());
        //   // console.log('AAA CA', resultCA);
        // } catch (caError) {
        //   // console.warn('Certificate Authority fetch failed during login:', caError);
        //   // ไม่ block login process ถ้า CA API ล้มเหลว
        // }

        // // 🔥 เรียก User Profile API หลังจาก login สำเร็จ
        // try {
        //   const resultProfile = await dispatch(getUserProfile());
        //   // console.log('User Profile loaded after login:', resultProfile);
        // } catch (profileError) {
        //   // console.warn('User Profile fetch failed during login:', profileError);
        //   // ไม่ block login process ถ้า Profile API ล้มเหลว
        // }

        return {
          user,
          token: response.data.access_token,
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
        };
      } else {
        return rejectWithValue("Invalid credentials");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "ชื่อผู้ใช้งานและรหัสผ่านไม่ตรงกับในระบบ";
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API if needed
      // await authApi.logout();

      // 🔐 CENTRALIZED LOGOUT - Use authOperations utility
      // authOperations.logout();
      // ✅ Clear cookies
      authCookies.clearTokens();
      
      // ✅ Clear Redux persist auth data from localStorage
      storageUtils.removeItem(STORAGE_KEYS.PERSIST_AUTH);

      // ✅ Clear sessionStorage
      sessionStorage.clear();

      // ✅ Clear localStorage
      localStorage.clear();
      
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      let refreshToken = state.auth.refreshToken;

      if (!refreshToken) {
        // fallback to cookie
        refreshToken = authCookies.getRefreshToken();
        throw new Error("No refresh token available");
      }

      // if (!refreshToken) {
      //   throw new Error("No refresh token available");
      // }

      const response = await authApi.refresh(refreshToken);

      if (response.status === "success" && response.data) {
        // localStorage.setItem("accessToken", response.data.access_token);
        authCookies.saveTokens(response.data.access_token, refreshToken);
        return response.data.access_token;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Token refresh failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCertificateAuthority = createAsyncThunk(
  "auth/fetchCertificateAuthority",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // เรียก getCertificateAuthority API
      const result = await dispatch(getCertificateAuthority());
      
      if (getCertificateAuthority.fulfilled.match(result)) {
        const rawData = result?.payload;
        
        // ประมวลผลข้อมูล credentials เพื่อจำแนกประเภท
        if (rawData?.data?.credentials && Array.isArray(rawData.data.credentials)) {
          const processedCredentials = (rawData?.data?.credentials ?? []).map((credential: any) => {
            const { certificateDn } = credential;
            
            // ตรวจสอบว่ามี GIVENNAME และ SURNAME หรือไม่
            const hasGivenName = certificateDn.includes('GIVENNAME=');
            const hasSurname = certificateDn.includes('SURNAME=');
            
            // จำแนกประเภท
            const credentialType = (hasGivenName && hasSurname) ? 'เจ้าหน้าที่' : 'นิติบุคคล';
            
            return {
              ...credential,
              credentialType,
              isOfficer: credentialType === 'เจ้าหน้าที่',
              isLegalEntity: credentialType === 'นิติบุคคล'
            };
          });
          
          // สร้างข้อมูลที่ประมวลผลแล้ว
          const processedData = {
            ...rawData,
            data: {
              ...rawData.data,
              credentials: processedCredentials,
              // เพิ่มข้อมูลสรุป
              summary: {
                total: processedCredentials.length,
                officers: processedCredentials.filter((c: any) => c.isOfficer).length,
                legalEntities: processedCredentials.filter((c: any) => c.isLegalEntity).length
              }
            }
          };
          
          // console.log('🔍 Processed CA Data:', processedData);
          
          // เก็บข้อมูลที่ประมวลผลแล้วใน localStorage
          authStorage.setCertificateAuthority(processedData);
          return processedData;
        }
        
        // ถ้าไม่มี credentials หรือรูปแบบไม่ถูกต้อง ให้เก็บข้อมูลดิบ
        authStorage.setCertificateAuthority(rawData);
        return rawData;
      } else {
        console.warn('Certificate Authority API failed:', result.payload);
        return rejectWithValue("Failed to fetch certificate authority data");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Certificate Authority fetch failed";
      console.error('Error fetching certificate authority:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      // Update permissions if role changes
      if (action.payload.role && state.user?.role !== action.payload.role) {
        const permissionManager = PermissionManager.getInstance();
        // Convert role array to string for PermissionManager
        const roleString = Array.isArray(action.payload.role) 
          ? action.payload.role[0]?.name || "Member"
          : action.payload.role;
        permissionManager.setUserRole(roleString);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    isAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // state.token = action.payload.token;

        // สำหรับการเรียก API จริง ซึ่งมี accessToken และ refreshToken
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
        }

        state.error = null;

        // Set permissions based on user role
        if (action.payload.user.role) {
          const permissionManager = PermissionManager.getInstance();
          // Convert role array to string for PermissionManager
          const roleString = Array.isArray(action.payload.user.role) 
            ? action.payload.user.role[0]?.name || "Member"
            : action.payload.user.role;
          permissionManager.setUserRole(roleString);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, () => {
        return { ...initialState, token: null, accessToken: null, refreshToken: null };
        // return { ...initialState };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Fetch Certificate Authority
      .addCase(fetchCertificateAuthority.pending, (state) => {
        // ไม่ต้อง set loading เพราะเป็น background process
      })
      .addCase(fetchCertificateAuthority.fulfilled, (state) => {
        // Certificate Authority data จะถูกเก็บใน localStorage แล้ว
        // ไม่ต้องเก็บใน Redux state
      })
      .addCase(fetchCertificateAuthority.rejected, (state, action) => {
        // Log error แต่ไม่ affect auth state
        console.error('Certificate Authority fetch failed:', action.payload);
      });
  },
});

// Export actions and reducer
export const { clearError, updateUser, setLoading, isAuthenticated } = authSlice.actions;
export default authSlice.reducer;
