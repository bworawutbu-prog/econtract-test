"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Layout, theme } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";

const { Content } = Layout;

// Load header lazily to keep this layout chunk smaller
const AppHeader = dynamic(() => import("./Header"), {
  ssr: false,
  loading: () => (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center bg-white px-4 shadow-theme animate-pulse" />
  ),
});

interface BackendLayoutProps {
  children: React.ReactNode;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch() as ThunkDispatch<
    RootState,
    unknown,
    AnyAction
  >;
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state: RootState) => state.ui);
  const pathname = usePathname();

  const isProfilePage = pathname.includes("/profile");

  // Calculate responsive state
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure sidebar is expanded by default on desktop
  useEffect(() => {
    if (sidebarCollapsed && !isMobile) {
      dispatch(toggleSidebar());
    }
  }, [sidebarCollapsed, isMobile, dispatch]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Layout
      className={`bg-white`}
      style={{
        minHeight: "100vh",
        height: "100%",
      }}
    >
      <AppHeader
        collapsed={sidebarCollapsed}
        setCollapsed={handleToggleSidebar}
        userData={user}
        isMobile={isMobile}
        colorBgContainer={colorBgContainer}
        handleLogout={handleLogout}
      />

      <Content
        style={{
          background: isProfilePage
            ? "linear-gradient(180deg, #E9F3FF 0%, #FFFFFF 30%)"
            : colorBgContainer,
          borderRadius: borderRadiusLG,
          padding: "1.5rem 6.5rem 2rem 6.5rem", // Added bottom padding
          position: "relative",
          minHeight: "calc(100vh - 64px)",
          height: "auto",
        }}
        className="transition-all duration-300 ease-in-out"
      >
        {children}
      </Content>
    </Layout>
  );
};

export default BackendLayout;
