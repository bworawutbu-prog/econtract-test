/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Input, Checkbox, Button, Divider, message } from "antd";
import Image from "next/image";
import dynamic from "next/dynamic";
import Google from "@/assets/image/login/google.webp";
import Thaid from "@/assets/image/login/thaid1.webp";
import OnePlatform from "@/assets/image/login/one-platform.webp";
import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import LoginLayout from "@/components/layout/LoginLayout";
import { useTranslations } from "@/components/providers/LocaleProvider";
import { loginBusiness } from "@/store/frontendStore/biz";

// ✅ Dynamic imports สำหรับ Modals (lazy load เมื่อต้องการแสดง)
const PasswordMissingModal = dynamic(
  () => import("@/components/modal/modalPasswordMissing").then(mod => ({ default: mod.PasswordMissingModal })),
  {
    loading: () => <Spin size="large" />,
    ssr: false,
  }
);

const ModalConsent = dynamic(
  () => import("@/components/modal/modalConsent").then(mod => ({ default: mod.ModalConsent })),
  {
    loading: () => <Spin size="large" />,
    ssr: false,
  }
);

// Redux imports
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, clearError, authCookies } from "@/store/slices/authSlice";
import { checkExpireToken } from "@/store/frontendStore/transactionAPI";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import {
  clearAllUserSession,
  STORAGE_KEYS,
  storageUtils,
} from "@/store/utils/localStorage";
import { setCookie, getCookie, deleteCookie } from "cookies-next/client";
import { getTokenLogin } from "@/store/token";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Memoize search params to prevent re-renders during redirects
  const { returnUrl, documentId, flowType } = useMemo(
    
    () => {
      // ดึง transaction id จาก sessionStorage
      const pendingTransactionId = sessionStorage.getItem("pendingTransactionId");
      const baseReturnUrl = searchParams.get("returnUrl") || "/frontend/Mapping";
      const finalReturnUrl = pendingTransactionId 
        ? `${baseReturnUrl}?documentId=${pendingTransactionId}`
        : baseReturnUrl;
      
      return {
        returnUrl: finalReturnUrl,
        documentId: searchParams.get("documentId"),
        flowType: searchParams.get("type"), // B2B, B2C หรือ legacy
      };
    },
    [searchParams]
  );

  const dispatch = useAppDispatch() as ThunkDispatch<any, any, AnyAction>;
  const { enqueueSnackbar } = useSnackbar();
  const [pathUrl, setPathUrl] = useState("");
  const [accountId, setAccountId] = useState("");
  const [type, setType] = useState(sessionStorage.getItem("pendingType"));
  const [open, setOpen] = useState(false);
  const [CheckLogin, setCheckLogin] = useState(false);
  const [termsAgreement, setTermsAgreement] = useState(false);
  // Get auth state from Redux
  const { isAuthenticated, loading, error } = useAppSelector(
    (state: any) => state.auth
  );
const onClose = () => {
  setOpen(false);
}
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [typeMissingModal, setTypeMissingModal] = useState("notAccount");
  // Using window global state to handle modal (works around Redux state conflicts)
  // No need for complex state management since window.forceShowPasswordModal handles the trigger

  // Clear old session data when entering login page (only if no valid tokens)
  useEffect(() => {
    // Only clear if user is not authenticated
    if (!isAuthenticated) {
      // ✅ Clear cookies
      authCookies.clearTokens();

      // ✅ Clear Redux persist auth data from localStorage
      storageUtils.removeItem(STORAGE_KEYS.PERSIST_AUTH);
    }
  }, [isAuthenticated]);
  useEffect(() => {
    const clearSessionData = async () => {
      try {
        // Check if there are any existing tokens
        const existingAccessToken = getCookie("accessToken");

        if (!existingAccessToken) {
          // No tokens found, safe to clear everything
          clearAllUserSession(true);
          sessionStorage.removeItem("isGuest");
        }
      } catch (error) {
        enqueueSnackbar(`❌ Error clearing session data: ${error}`, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    };

    clearSessionData();
  }, []); // Run only once when component mounts

  // Check authentication status and handle redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // If user appears authenticated, verify token validity and redirect
      if (isAuthenticated) {
        try {
          const token = getTokenLogin();
          if (!token) {
            localStorage.clear();
            sessionStorage.clear();
            router.replace("/login");
            return;
          }

          // User is authenticated, redirect to appropriate page
          const pendingFlowType = sessionStorage.getItem("pendingType");
          const pendingTransactionId = sessionStorage.getItem(
            "pendingTransactionId"
          );

          setTimeout(() => {
            if (pendingFlowType === "b2b" || pendingFlowType === "b2c") {
              router.replace(
                `/frontend/Mapping?documentId=${pendingTransactionId}`
              );
            } else {
              router.replace("/frontend");
            }
          }, 200); // Increased delay to ensure smooth transition
        } catch (error) {
          enqueueSnackbar(`❌ Error checking token expiration: ${error}`, {
            variant: "error",
            autoHideDuration: 3000,
          });
          localStorage.clear();
          sessionStorage.clear();
          router.replace("/login");
        }
      }

      // Add a small delay to prevent UI flickering
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    };

    checkAuth();
  }, [isAuthenticated, dispatch, router]);

  // Initial loading effect - reduced time to prevent unnecessary delays
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced from 1000ms to 500ms

    return () => clearTimeout(timer);
  }, []);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Monitor window global state to trigger modal
  useLayoutEffect(() => {
    const checkWindowState = () => {
      if ((window as any).forceShowPasswordModal) {
        const modalType = (window as any).modalType || "notAccount";
        setTypeMissingModal(modalType);
        setShowPasswordModal(true);
        (window as any).forceShowPasswordModal = false; // Reset
        (window as any).modalType = ""; // Reset
      }
    };

    const interval = setInterval(checkWindowState, 50);
    return () => clearInterval(interval);
  }, []);

  // Debug: Track typeMissingModal changes
  useLayoutEffect(() => {}, [typeMissingModal]);

  // Modal is triggered by window.forceShowPasswordModal from error handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? termsAgreement : value,
    }));
    setCheckLogin(termsAgreement);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      enqueueSnackbar(t("login.usernameRequired"), { variant: "warning" });
      return false;
    }
    if (!formData.password) {
      enqueueSnackbar(t("login.passwordRequired"), { variant: "warning" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Using Redux action
      let resultAction;
      if (accountId !== "") {
        resultAction = await dispatch(
          loginUser({
            username: formData.username,
            password: formData.password,
            account_id: accountId,
          })
        );
      } else {
        resultAction = await dispatch(
          loginUser({
            username: formData.username,
            password: formData.password,
          })
        );
      }

      if (loginUser.fulfilled.match(resultAction)) {
        // แสดงข้อความแจ้งเตือนการเข้าสู่ระบบสำเร็จ
        sessionStorage.setItem("isGuest", "false");
        const userData = resultAction.payload.user;
        enqueueSnackbar(
          `${t("login.welcomeUser")} ${userData.fullName || userData.username}`,
          {
            variant: "success",
          }
        );

        // Handle success - store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem("remember_me", "true");
        }

        // 🎯 จัดการ B2B flow และ pending data
        if (type === "b2b") {
          // ดึงข้อมูล pending จาก sessionStorage
          const pendingTransactionId = sessionStorage.getItem(
            "pendingTransactionId"
          );
          const pendingBusiness = sessionStorage.getItem("pendingBusiness");
          const pendingEmail = sessionStorage.getItem("pendingEmail");
          const pendingLoginBy = sessionStorage.getItem("pendingLoginBy");
          const pendingAccountId = sessionStorage.getItem("pendingAccountId");
          const finalUrl = pendingTransactionId
            ? `${returnUrl}?documentId=${pendingTransactionId}`
            : returnUrl;
          setPathUrl(finalUrl);
          if (pendingAccountId) {
            setAccountId(pendingAccountId);
          }
          // เก็บข้อมูล B2B context
          if (pendingBusiness) {
            sessionStorage.setItem("businessContext", pendingBusiness);
            const resultAction = await dispatch(loginBusiness(pendingBusiness));
            if (loginBusiness.fulfilled.match(resultAction)) {
              // console.log("✅ [Login] B2B context established");
            }
          }
          if (pendingEmail || pendingLoginBy) {
            sessionStorage.setItem(
              "b2bUserContext",
              pendingEmail || pendingLoginBy || ""
            );
          }

          // ล้าง pending data
          // sessionStorage.removeItem("pendingTransactionId");
          sessionStorage.removeItem("pendingBusiness");
          sessionStorage.removeItem("pendingEmail");
          sessionStorage.removeItem("pendingLoginBy");

          // Set transaction type
          sessionStorage.setItem("transactionType", "b2b");
          sessionStorage.setItem("isGuest", "false");

          // console.log("✅ [Login] B2B context established");
        }

        // 🎯 NEW: Redirect to loading page first, then to actual destination
        if (type === "b2b") {
          const pendingTransactionId = sessionStorage.getItem(
            "pendingTransactionId"
          );
          const finalUrl = pendingTransactionId
            ? `${returnUrl}?documentId=${pendingTransactionId}`
            : returnUrl;
          
          // Redirect to loading page with target URL
          const loadingUrl = `/loading?redirectUrl=${encodeURIComponent(finalUrl)}&message=${encodeURIComponent(t("login.loadingPreparing"))}`;
          router.replace(loadingUrl);
        } else {
          // Redirect to loading page with frontend URL
          const loadingUrl = `/loading?redirectUrl=${encodeURIComponent("/frontend")}&message=${encodeURIComponent(t("login.loadingRedirect"))}`;
          router.replace(loadingUrl);
        }
      } else {
        // Handle different types of errors
        const errorMessage = resultAction.payload as string;

        if (
          errorMessage &&
          (errorMessage.includes("Invalid username or password") ||
            errorMessage.includes("Unauthorized") ||
            errorMessage.includes("รหัสผ่านหรือชื่อผู้ใช้งานไม่ถูกต้อง"))
        ) {
          // For invalid credentials - suggest user to register
          (window as any).modalType = "notAccount";
          (window as any).forceShowPasswordModal = true;
        } else if (
          errorMessage &&
          errorMessage.includes("Too many failed login attempts")
        ) {
          // For too many attempts - just acknowledge
          (window as any).modalType = "missing";
          (window as any).forceShowPasswordModal = true;
        } else {
          // Show generic error message for other errors
          enqueueSnackbar(
            errorMessage || t("login.genericError"),
            {
              variant: "error",
            }
          );
        }

        // Clear password on error
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }
  };

  const handleThaidLogin = async () => {
    const result = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/oauth/one-authorize/thaid`);
    console.log("🔍 [ThaidLogin] result =>>", result);
    if (result.data.data) {
      window.location.href = result.data.data.link;
    } else {
    enqueueSnackbar(t("login.genericError"), {
        variant: "error",
      });
    }
  }

  // Custom width for login page - narrower than the register page
  const loginWidth = "w-full md:w-[85%] lg:w-[80%] xl:w-2/3 max-w-[1200px]";

  return (
    <LoginLayout
      title={t("login.title")}
      subtitle={t("login.subtitle")}
      contentWidth={loginWidth}
      showBackButton={false}
    >
      <form
        onSubmit={handleSubmit}
        className="text-sm sm:text-base bg-white/10 backdrop-blur-sm rounded-xl p-4"
      >
        <div>
          <label className="block mb-1">{t("login.usernameLabel")}</label>
          <Input
            placeholder={t("login.usernamePlaceholder")}
            id="username"
            size="large"
            value={formData.username}
            onChange={handleInputChange}
            disabled={loading}
            status={!!error && !formData.username ? "error" : ""}
            className="rounded-xl bg-white/20 border border-[#C4C4C4] text-gray-500 login-input-username"
          />
        </div>

        <div>
          <label className="block mb-1">{t("login.passwordLabel")}</label>
          <Input.Password
            placeholder={t("login.passwordPlaceholder")}
            id="password"
            size="large"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            status={!!error && !formData.password ? "error" : ""}
            className="rounded-xl bg-white/20 border border-[#C4C4C4] text-gray-500 placeholder:text-white/80"
          />
        </div>

        {error && <div className="text-red-600 mt-1 text-sm">{error}</div>}

        <div className="flex justify-center items-center flex-wrap gap-2 mt-4 mb-8">
          <Checkbox
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={(e) => {
              setTermsAgreement(e.target.checked);
              handleInputChange({
                  target: {
                    id: "rememberMe",
                    type: "checkbox",
                    // checked: e.target.checked,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            }
            disabled={loading}
          >
            <div className="text-sm">{t("login.termsAgreement")}</div>
          </Checkbox>
          <span
            onClick={() => setOpen(true)}
            className="text-[#367AF7] text-sm text-center cursor-pointer"
          >
            {t("login.privacyPolicy")}
          </span>
        </div>

        { CheckLogin && (<button
         
          type="submit"
          className={`btn-theme w-full h-9 sm:h-12 flex items-center justify-center gap-2 text-sm sm:text-base ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spin spinning={true} />
              <span>{t("login.loadingRedirect")}</span>
            </>
          ) : (
            t("login.loginButton")
          )}
        </button>)}
        {!CheckLogin && (<button
          className={`btn-theme opacity-60 w-full h-9 sm:h-12 flex items-center justify-center gap-2 text-sm sm:text-base ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={true}
        >
          {t("login.loginDisabled")}
        </button>)}
      
        <div className="w-full flex justify-center tb-2 mt-2">
        <Button
            type="link"
            className="text-theme px-0 h-auto"
            onClick={() => router.push("https://testoneid.inet.co.th/type_forgot_password")}
          >
            <span className="border-b border-theme text-sm sm:text-base">
              {t("login.forgotPasswordLink")}
            </span>
          </Button>
        </div>
      </form>
      <Divider className="!my-2 sm:!my-2 !font-normal">
        {t("login.or")}
      </Divider>
      <Button
        className={`border-theme/70 bg-white/80 hover:bg-white/90 transition-colors text-[#367AF7] rounded-[0.75rem] w-full h-9 sm:h-12 flex items-center justify-center gap-2 text-sm sm:text-base`}
        onClick={() => {
          handleThaidLogin();
        }}
      >
        <span>
          <Image src={Thaid} alt="Thaid" width={20} height={20} />
        </span>
        <span>
          {t("login.thaidLoginCta")}
        </span>
      </Button>
      <p className="!my-4 sm:!my-10 text-center text-sm sm:text-base">
        {t("login.registerPrompt")}{" "}
        <Link
          href="https://testoneid.inet.co.th/register"
          className="border-b border-[#367AF7] text-[#367AF7]"
        >
          {t("login.register")}
        </Link>
      </p>
      {/* <Divider className="!my-4 sm:!my-8 !font-normal">หรือ</Divider> */}

      {/* Alternative Login Options */}
      {/* <div className="flex gap-3 flex-wrap lg:mb-6 mb-4">
        <button className="btn flex flex-1 items-center border border-[#F0F6FF] justify-center gap-2 h-auto min-h-12 py-1.5 rounded-xl text-sm sm:text-base bg-[#FAFCFF]"> */}
          {/* <div className="relative w-6 sm:w-8 h-6 sm:h-8">
            <Image
              src={OnePlatform}
              alt="One Platform Logo"
              fill
              className="object-contain"
            />
          </div> */}
          {/* <span className="text-theme font-medium">
            เข้าสู่ระบบด้วยบัญชีองค์กร
          </span>
        </button>
      </div> */}
      <ModalConsent open={open} onClose={onClose} />
      <PasswordMissingModal
        open={showPasswordModal}
        type={typeMissingModal}
        titleName={
          typeMissingModal === "missing"
            ? t("login.accountSuspendedTitle")
            : t("login.accountMissingTitle")
        }
        onConfirm={() => {
          setShowPasswordModal(false);
          router.push("https://testoneid.inet.co.th/register");
        }}
        onCancel={() => {
          setShowPasswordModal(false);
        }}
        message={
          typeMissingModal === "missing"
            ? t("login.accountSuspendedMessage")
            : t("login.accountMissingMessage")
        }
      />
    </LoginLayout>
    
  );
}
