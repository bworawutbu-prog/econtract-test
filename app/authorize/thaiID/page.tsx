"use client";
import { useAppDispatch, useAuth } from '@/store/hooks';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect , useState} from "react";
import { authCookies, updateUser, isAuthenticated } from '@/store/slices/authSlice';
export default function ThaiID() {
    const dispatch = useAppDispatch() as ThunkDispatch<any, any, AnyAction>;
    const router = useRouter();
    const [business_id, setBusiness_id] = useState<string>('');
    useEffect(() => {
        const processAuth = async () => {
          if (window.location.href) {
            const rawSearch = window.location.search;  
            const cleanedSearch = rawSearch
              .replaceAll("&&", "&")
              .replaceAll("%20", "")
              .replace("?", "");
            const params = new URLSearchParams(cleanedSearch);
        
            const one_sharedToken = params.get("sharedToken");
            if (!one_sharedToken) {
              router.replace("/login");
              return;
            }
            try {
              // ตรวจสอบ sharedToken
              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login/shared-token`, {
                  shared_token: one_sharedToken
              }, {
                  headers: {
                      'Content-Type': 'application/json',
                  }
              })
              
              if (response.data) {
                  const user = {
                      id: response.data.data.account_id || "0",
                      username: response.data.data.username || "",
                      email: response.data.data.email || "",
                      fullName: response.data.data.username || "",
                      role: response.data.data.role || "Member",
                      business: response.data.data.business || [], 
                      login_by: response.data.data.login_by || response.data.data.email || "",
                  };
                  
                  // console.log("✅ [One-Platform] User data received:", user);
                  
                  // บันทึก tokens และ user data
                  authCookies.saveTokens(response.data.data.access_token, response.data.data.refresh_token, user);
                  
                  dispatch(updateUser(user));
                  dispatch(isAuthenticated(true));
              }
            } catch (error) {
              localStorage.clear();
              sessionStorage.clear();
              router.replace("/login");
            }
          }
        };
  
        processAuth();
      }, []);
}