"use client";

import React, { useEffect, useState } from "react";
import { Button, Layout, Dropdown, Select } from "antd";
import {
  LogOut,
  MenuIcon,
  ChevronDown,
  UserIcon,
  ChevronLeft,
} from "lucide-react";
import SidebarButton from "@/components/layout/SidebarButton";
import { usePathname, useRouter } from "next/navigation";
import AvatarIcon from "@/assets/webp/profile/profile_avatar.webp";
import Image from "next/image";
import { getUserProfile } from "@/store/frontendStore/userProfile";
import type { UserRole } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { setSelectedBusiness, setBusinessList } from "@/store/slices/businessSlice";
import { PasswordMissingModal } from "../modal/modalPasswordMissing";
import { loginBusiness } from "@/store/frontendStore/biz";
import { getTransactionsData, transactionsPage, transactionsPageBusiness } from "@/store/frontendStore/transactionAPI";
import { enqueueSnackbar } from "notistack";
import { ErrorModal } from "../modal/modalError";
import { triggerMenuRefresh, handleBusinessChange } from "@/store/menu/NavLinks";
import appEmitter from "@/store/libs/eventEmitter";
import { useTranslations } from "@/components/providers/LocaleProvider";
// import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";

const { Header } = Layout;

// ===== INTERFACES =====
interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userData: {
    username: string;
    fullName?: string;
    role?: UserRole[] | string;
    avatar?: string;
  } | null;
  isPdfLayout?: boolean;
  isMobile?: boolean;
  colorBgContainer: string;
  handleLogout: () => void;
  setDisableCreateDoc?: (disabled: boolean) => void;
}

// ===== MAIN COMPONENT =====
const AppHeader: React.FC<AppHeaderProps> = ({
  collapsed,
  setCollapsed,
  userData,
  isPdfLayout = false,
  isMobile = false,
  colorBgContainer,
  handleLogout,
  setDisableCreateDoc = (disabled: boolean) => { },
}) => {
  // ===== HOOKS & ROUTER =====
  const router = useRouter();
  const path = usePathname();
  const dispatch = useAppDispatch();
  const t = useTranslations();

  // ===== STATE MANAGEMENT =====
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: userProfile,
    loading: profileLoading,
    error: profileError,
  } = useSelector((state: RootState) => state.userProfile);
  const { selectedBusinessId, businessList } = useSelector((state: RootState) => state.business);

  // ===== LOCAL STATE =====
  const [selectedValue, setSelectedValue] = useState("ทั้งหมด");
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [showCreateBiz, setShowCreateBiz] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [isOpenErrorModal, setIsOpenErrorModal] = useState(false);

  // ===== CONSTANTS & DERIVED VALUES =====
  const showSelectBiz =
    path.split("/").includes("frontend") || path.split("/").includes("stamp");

  useEffect(() => {
    if (!userProfile) {
      dispatch(getUserProfile() as any);
    }
  }, [userProfile, dispatch]);

  // Initialize client-only state (guest flags, saved business selection)
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsGuest(sessionStorage.getItem("isGuest") === "true");
    setGuestName(sessionStorage.getItem("guestName") || "");

    const savedValue = localStorage.getItem("selectedBusiness");
    if (savedValue) {
      setSelectedValue(savedValue);
    }
  }, []);

  // ===== BUSINESS LOGIC FUNCTIONS =====
  const loginBusinessAPI = async (payload: string) => {
    return dispatch(loginBusiness(payload) as any);
  };

  const handleChange = async (value: string, option: any) => {
    setSelectedValue(value);
    const now = new Date();
    const secondsSinceEpoch = Math.floor(now.getTime() / 1000);
    setDisableCreateDoc(value === "ทั้งหมด");

    if (value !== "ทั้งหมด") {
      // Update Redux business state
      dispatch(setSelectedBusiness({
        businessId: option.key,
        businessName: value
      }));

      // Get roleBusiness first before triggering menu refresh
      try {
        const res = await loginBusinessAPI(option.key);
        // console.log('🔍 Full API Response:', res);
        // console.log('🔍 Response structure:', {
        //   payload: res.payload,
        //   data: res.payload?.data,
        //   role: res.payload?.data?.role,
        //   response: res.response,
        //   responseData: res.response?.data
        // });

        // Try different possible paths for roleBusiness
        let roleBusiness = res.payload?.data?.role ||
          res.response?.data?.role ||
          res.payload?.role ||
          res.role ||
          'general'; // Default fallback

        // console.log('🔍 Final roleBusiness:', roleBusiness);

        if (roleBusiness && roleBusiness != undefined) {
          localStorage.setItem('roleBusiness', roleBusiness);
        } else {
          console.warn('⚠️ roleBusiness is undefined, using default: general');
          localStorage.setItem('roleBusiness', 'general');
          roleBusiness = 'general';
        }

        // dispatch(transactionsPage(1) as any);
        // dispatch(getTransactionsData({ page: 1 }) as any);

        // Trigger menu refresh AFTER getting roleBusiness
        // console.log('🔄 Triggering menu refresh after roleBusiness update:', secondsSinceEpoch, 'roleBusiness:', roleBusiness);
        handleBusinessChange(value, option);
        if (window.location.pathname === "/frontend" && !isPdfLayout) {
          router.push("/document/statusContract");
        }
        appEmitter.emit("menuRefresh", { trigger: secondsSinceEpoch });
      } catch (error) {
        console.error('Error getting roleBusiness:', error);
        // Set default roleBusiness if API fails
        localStorage.setItem('roleBusiness', 'general');
        // console.log('🔄 Using default roleBusiness: general');
        // Still trigger refresh even if API fails
        handleBusinessChange(value, option);
        appEmitter.emit('menuRefresh', { trigger: secondsSinceEpoch });
      }
    } else {
      // Clear selected business
      dispatch(setSelectedBusiness({
        businessId: "",
        businessName: ""
      }));
      // Clear roleBusiness for "ทั้งหมด"
      localStorage.removeItem('roleBusiness');

      // console.log('🔄 Triggering menu refresh for "ทั้งหมด":', secondsSinceEpoch);
      handleBusinessChange(value, option);
      // Only redirect if not in profile, backend, or pdfLayout
      const currentPath = window.location.pathname;
      const isBackendPath = currentPath.includes("/backend");
      if (currentPath !== "/profile" && !isBackendPath && !isPdfLayout) {
        router.push("/frontend");
      }
      appEmitter.emit('menuRefresh', { trigger: secondsSinceEpoch });
    }
  };

  // ===== USER PROFILE MANAGEMENT =====
  const fetchUserProfile = () => {
    if (user && !userProfile) {
      dispatch(getUserProfile() as any);
    }
  };

  const forceRefreshUserProfile = () => {
    if (user && userProfile) {
      dispatch(getUserProfile() as any);
    }
  };

  // ===== DISPLAY NAME MANAGEMENT =====
  const updateDisplayName = () => {

    let newDisplayName;
    if (isGuest) {
      newDisplayName = guestName || "Guest User";
    } else if (userProfile && userProfile.first_name_th) {
      newDisplayName = userProfile?.first_name_th ? `${userProfile.first_name_th} ${userProfile.last_name_th || ''}` : userProfile?.last_name_th || '';
    } else if (userProfile && userProfile.first_name_eng) {
      newDisplayName = userProfile?.first_name_eng ? `${userProfile.first_name_eng} ${userProfile.last_name_eng || ''}` : userProfile?.last_name_eng || '';
    } else if (userProfile && userProfile.email && userProfile.email[0]) {
      newDisplayName = userProfile.email[0];
    } else {
      newDisplayName = "Unknown User"
    }
    setDisplayName(newDisplayName && newDisplayName !== '' ? newDisplayName : "Unknown User");
  };

  const resetDisplayName = () => {
    if (!user) {
      setDisplayName("");
    }
  };

  const updateGuestDisplayName = () => {
    if (isGuest) {
      setDisplayName(guestName || "Guest User");
    }
  };

  // ===== BUSINESS SELECTION MANAGEMENT =====
  const initializeBusinessSelection = () => {
    if (
      user?.business &&
      Array.isArray(user.business) &&
      user.business.length > 0
    ) {
      // Set business list in Redux
      dispatch(setBusinessList(user.business));

      // เงื่อนไขใหม่: ถ้า business มี 1 ตัว ให้ default เป็น business นั้น
      // console.log('user.business.length', user.business.length)
      if (user && user.hasOwnProperty('login_by') && user.login_by === 'shared_token') {
        return;
      }
      else if (user.business.length === 1) {
        // ตรวจสอบว่าเป็นครั้งแรกหลัง login หรือไม่
        const hasAutoSelected = sessionStorage.getItem("hasAutoSelectedBusiness");
        
        if (!hasAutoSelected) {
          const defaultBusiness = user.business[0].business_name_eng;
          // setSelectedValue(defaultBusiness);
          handleChange(defaultBusiness, { key: user.business[0].business_id });
          localStorage.setItem("selectedBusiness", defaultBusiness);
          // เซ็ต flag ว่าได้ทำการ auto-select แล้ว
          sessionStorage.setItem("hasAutoSelectedBusiness", "true");
        }
        return;
      }

      // ถ้า business ไม่มี หรือ มีมากกว่า 1 ตัว ให้แสดง "ทั้งหมด"
      // setSelectedValue("ทั้งหมด");
      // localStorage.setItem("selectedBusiness", "ทั้งหมด");
      // return;
    } else {
      setSelectedValue("ทั้งหมด");
      localStorage.setItem("selectedBusiness", "ทั้งหมด");
    }
  };

  const checkBusinessAccess = () => {
    if ((!user?.role || user?.role.length === 0) && showSelectBiz) {
      setShowCreateBiz(true);
    } else {
      setShowCreateBiz(false);
    }
  };

  // ===== STORAGE EVENT HANDLERS =====
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "persist:auth" || e.key === "accessToken") {
      if (user) {
        dispatch(getUserProfile() as any);
      }
    }
  };

  // ===== USE EFFECTS =====
  // Business Logic
  useEffect(() => {
    checkBusinessAccess();
  }, []);

  useEffect(() => {
    setDisableCreateDoc(selectedValue === "ทั้งหมด");
  }, [selectedValue, setDisableCreateDoc]);

  useEffect(() => {
    if (typeof window !== "undefined" && selectedValue) {
      localStorage.setItem("selectedBusiness", selectedValue);
    }
  }, [selectedValue]);

  useEffect(() => {
    initializeBusinessSelection();
  }, [user?.role]);

  // Display Name Management
  useEffect(() => {
    updateDisplayName();
    // console.log('userProfile ->',userProfile)
  }, [userProfile, isGuest, guestName, user?.id]);

  useEffect(() => {
    updateGuestDisplayName();
  }, [isGuest, guestName]);

  useEffect(() => {
    resetDisplayName();
  }, [user]);

  useEffect(() => {
    if (profileError && profileError === "Too Many Requests") {
      setIsOpenErrorModal(true);
    }
  }, [profileError]);

  // Storage Event Listeners
  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user, dispatch]);

  // URL Path Change Handler - Update selectedValue from selectedBusinessId
  useEffect(() => {
    if (selectedBusinessId && businessList && businessList.length > 0) {
      const matchedBusiness = businessList.find(
        (business: any) => business.business_id === selectedBusinessId
      );
      if (matchedBusiness) {
        setSelectedValue(matchedBusiness.business_name_eng);
      }
    } else if (!selectedBusinessId) {
      setSelectedValue("ทั้งหมด");
      // เรียก handleChange เฉพาะเมื่อ selectedValue ยังไม่ใช่ "ทั้งหมด" เพื่อป้องกัน infinite loop
      if (selectedValue !== "ทั้งหมด") {
        handleChange("ทั้งหมด", { key: "" });
      }
    }
  }, [path, selectedBusinessId, businessList]);

  // ===== RENDER FUNCTIONS =====
  const renderUserProfileDropdown = () => (
    <Dropdown
      menu={{ items: customUserMenuItems }}
      placement="bottomRight"
      arrow
      trigger={["click"]}
    >
      <Button className="bg-[#F5F5F5] shadow relative border-0 py-1 rounded-xl h-9">
        <div className="flex items-center justify-between gap-2">
          <UserIcon size={24} color="#0153BD" />
          <div className="text-start md:block sm:hidden hidden">
            <p className="leading-tight text-xs">{displayName}</p>
            {/* <p className="leading-tight text-[10px]">{displayRole}</p> */}
          </div>
          <ChevronDown size={16} color="#0153BD" />
        </div>
      </Button>
    </Dropdown>
  );

  const renderBusinessSelector = () => (
    <div className={`md:flex-1 flex-auto items-center rounded-xl`}>
      <Select
        defaultValue="ทั้งหมด"
        onChange={handleChange}
        value={selectedValue}
        className="h-9 shadow w-[150px] md:w-[200px] max-w-[250px] [&_.ant-select-selector]:!bg-[#F5F5F5] [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-xl"
        style={{ borderRadius: "0.75rem" }}
        key={selectedValue}
        suffixIcon={<ChevronDown size={16} color="#0153BD" />}
        aria-label={t("header.selectBusiness")}
      >
        <Select.Option key={"all-biz"} value="ทั้งหมด">
          {t("header.allBusiness")}
        </Select.Option>
        {user &&
          user?.business &&
          Array.isArray(user?.business) &&
          user?.business?.map((business: any) => (
            <Select.Option
              key={business.business_id}
              value={business.business_name_eng}
            >
              {business.business_name_th}
            </Select.Option>
          ))}
      </Select>
    </div>
  );

  const renderPasswordMissingModal = () => (
    <PasswordMissingModal
      open={showCreateBiz}
      titleName={t("header.missingOrgTitle")}
      message={t("header.missingOrgMessage")}
      type="notBusiness"
      onConfirm={async () => {
        setShowCreateBiz(false);
        router.push(
          "https://one.th/register?redirect_uri=https://biz.one.th/auth/login"
        );
      }}
      onCancel={() => setShowCreateBiz(false)}
    />
  );

  // ===== COMPUTED VALUES =====
  const avatarSrc = userData?.avatar || AvatarIcon;
  const userRoles = Array.isArray(userData?.role) ? userData.role : [];
  const displayRole =
    userRoles.length > 0
      ? userRoles[0].name
      : typeof userData?.role === "string"
        ? userData.role
        : "Member";

  const customUserMenuItems = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2">
          <span>{t("header.profile")}</span>
        </div>
      ),
      onClick: () => {
        router.push("/profile");
      },
    },
    {
      key: "logout",
      label: (
        <div className="flex items-center text-red-600 gap-2">
          <span>{t("header.logout")}</span>
        </div>
      ),
      onClick: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedBusiness");
          sessionStorage.removeItem("hasAutoSelectedBusiness");
        }
        handleLogout();
      },
    },
  ];

  // ===== EARLY RETURNS =====
  if (isGuest) {
    return <></>;
  }

  if (isPdfLayout) {
    return (
      <Header
        style={{
          background: colorBgContainer,
          padding: "0 16px",
          position: "sticky",
          top: 0,
          width: "100%",
        }}
        className={` ${collapsed ? "justify-between" : "justify-end"
          } border-b border-slate-200 flex items-center`}
      >
        {collapsed ? (
          <div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center border border-theme rounded-lg p-1"
            >
              <MenuIcon color="#0153BD" />
            </button>
          </div>
        ) : <></>}
        <div className="flex items-center gap-4">
          {renderBusinessSelector()}
          {/* <LocaleSwitcher size="small" /> */}
          {renderUserProfileDropdown()}
        </div>
      </Header>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <Header
      style={{
        paddingRight: 16,
        paddingLeft: 16,
        background: colorBgContainer,
        position: "sticky",
        top: 0,
        zIndex: 99,
        width: "100%",
      }}
      className={`border-b border-slate-200 flex lg:justify-end md:justify-between justify-between items-center px-4`}
    >
      <div className="lg:hidden md:flex flex items-center">
        <SidebarButton />
      </div>

      <div className="flex items-center gap-4">
        {renderBusinessSelector()}
        {/* <LocaleSwitcher size="small" /> */}
        {renderUserProfileDropdown()}
      </div>

      {renderPasswordMissingModal()}
      <ErrorModal
        titleName={t("header.errorTitle")}
        message={t("header.errorMessage")}
        open={isOpenErrorModal}
        onClose={() => {
          setIsOpenErrorModal(false);
        }}
      />
    </Header>
  );
};

export default AppHeader;
