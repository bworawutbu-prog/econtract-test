'use client'

import { useRouter } from 'next/navigation';
import { useEffect ,useMemo} from "react";
import { setCookie, getCookie, deleteCookie } from 'cookies-next/client';


  export default function Redirect() {
     const router = useRouter();
     const cookieOptions = {
      // maxAge: 60 * 60 ,
      // httpOnly: true, //remove the comment ONLY when in DEPLOY !!BUG cannot login
      path: '/',
      secure: process.env.NODE_ENV === 'production', //change to 'development' if in dev mode ,'production' if deploy, 'localhost'
      sameSite: 'lax' as const,
    };
    useEffect(() => {
      const processAuth = async () => {
        // console.log('WWW window.location.href', window.location.href)
        if (window.location.href) {
          // const params = window.location.search.split("=")
          // const accessToken = params.get("access_token");
          // const params = new URLSearchParams(window.location.search);
          const rawSearch = window.location.search;
          // console.log('WWW rawSearch', rawSearch)
          const cleanedSearch = rawSearch
            .replaceAll("&&", "&") // Fix multiple ampersands
            .replaceAll("%20", "") // Remove encoded spaces
            .replace("?", "");           // Remove the "?" at the start
          // const paramObject = Object.fromEntries(params.entries());
          const params = new URLSearchParams(cleanedSearch);
          // console.log('WWW params', params)
          const guest_accessToken = params.get("token");
          const transaction_id = params.get("transaction_id");    
          const loginBy = params.get("login_by");
          const email = params.get("email");
          const account_id = params.get("account_id");
          const type = params.get("type"); // เพิ่ม type parameter
          const business = params.get("business"); // เพิ่ม business parameter (สำหรับ B2B)
          
          // console.log('🔍 [Redirect] Parsed parameters:', {
          //   type,
          //   transaction_id,
          //   account_id,
          //   email,
          //   loginBy,
          //   business,
          //   hasToken: !!guest_accessToken
          // });

          // 🎯 B2B (Business to Business) - ต้อง login
          if (type === "b2b") {
            // console.log('📋 [Redirect] B2B flow detected - redirecting to login');
            
            // เก็บข้อมูลสำหรับใช้หลัง login
            if (transaction_id) sessionStorage.setItem("pendingTransactionId", transaction_id);
            if (business) sessionStorage.setItem("pendingBusiness", business);
            if (email) sessionStorage.setItem("pendingEmail", email);
            if (loginBy) sessionStorage.setItem("pendingLoginBy", loginBy);
            if (account_id) sessionStorage.setItem("pendingAccountId", account_id);
            if (type) sessionStorage.setItem("pendingType", type);
            // Redirect ไปหน้า login พร้อม returnUrl
            const returnUrl = `/frontend/Mapping?documentId=${transaction_id}`;
            router.replace('/login');
            return;
          }

          // B2C contract flow have account_id and type is b2c
          if (account_id && type === "b2c") {
            console.log('📋 [Redirect] B2C contract flow with account_id - redirecting to login');
            if (transaction_id) sessionStorage.setItem("pendingTransactionId", transaction_id);
            if (business) sessionStorage.setItem("pendingBusiness", business);
            if (email) sessionStorage.setItem("pendingEmail", email);
            if (loginBy) sessionStorage.setItem("pendingLoginBy", loginBy);
            if (account_id) sessionStorage.setItem("pendingAccountId", account_id);
            if (type) {
              sessionStorage.setItem("pendingType", type);
              // sessionStorage.setItem("isGuest", type);
            }

            // Redirect ไปหน้า login พร้อม returnUrl
            router.replace('/login');
            return;
          }
            
          // 🎯 B2C (Business to Customer) หรือ legacy flow - ใช้ token
          // Check if account_id exists และไม่ใช่ B2B - redirect to login first
          if (account_id && type !== "b2c") {
            console.log('📋 [Redirect] Legacy flow with account_id - redirecting to login');
            
            // Store transaction_id for redirect after login
            sessionStorage.setItem("pendingTransactionId", transaction_id || "");
            // Redirect to login with returnUrl to mapping page
            router.replace(`/login?returnUrl=/frontend/Mapping&documentId=${transaction_id}`);
            return;
          }
          
          // 🎯 B2C หรือ guest access ที่มี token
          if (guest_accessToken) {
            console.log('🎫 [Redirect] B2C/Guest flow detected - processing token');
            
            // if (loginBy && email) {
            //   sessionStorage.setItem("guestName", loginBy);
            //   sessionStorage.setItem("guestEmail", email);
            // }
            if (email) {
              sessionStorage.setItem("guestEmail", email);
            }
            
            // เก็บ business information สำหรับ B2C ด้วย (ถ้ามี)
            if (business) {
              sessionStorage.setItem("guestBusiness", business);
            }
            
            // เก็บ type information
            if (type) {
              sessionStorage.setItem("transactionType", type);
            }
            
            sessionStorage.setItem("isGuest", "true");
            sessionStorage.setItem("guest_accessToken", guest_accessToken);
            setCookie("guest_accessToken", guest_accessToken, cookieOptions);
            setCookie("isGuest", "true", cookieOptions);
            
            // ล้าง access tokens เก่า (ถ้ามี)
            deleteCookie("accessToken");
            deleteCookie("refreshToken");
            
            // console.log('✅ [Redirect] Guest session established, redirecting to mapping');
            router.replace(`/frontend/Mapping?documentId=${transaction_id}`);
            
          } else {
            // ไม่มี token และไม่ใช่ B2B
            console.error("❌ [Redirect] No token found and not B2B flow");
            
            if (type === "b2c") {
              // B2C แต่ไม่มี token = error
              router.replace("/login?error=token_missing_for_b2c");
            } else {
              // Legacy flow ไม่มี token
              router.replace("/login?error=token_not_found_in_hash");
            }
          }

        }
      };

      processAuth();
    }, []);
  }


//   เส้น /external_services/transaction/:id
// method: get
// id = transactioni_d
// token type: shared token