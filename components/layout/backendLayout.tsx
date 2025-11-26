"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Layout } from "antd";
import { usePathname, useRouter } from "next/navigation";
import RouteProgressBar from "@/components/loadingSkeleton/RouteProgressBar";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";

const { Content } = Layout;

// Split sidebar and header into separate chunks to keep backend layout lighter
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-y-0 left-0 w-20 bg-white shadow-theme animate-pulse" />
  ),
});

const AppHeader = dynamic(() => import("./Header"), {
  ssr: false,
  loading: () => (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center bg-white px-4 shadow-theme animate-pulse" />
  ),
});

interface BackendLayoutProps {
  children: React.ReactNode;
  colorBgContainer: string;
  borderRadiusLG: number;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({
  children,
  colorBgContainer,
  borderRadiusLG,
}) => {
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

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Layout
      className={`bg-white min-h-screen`}
    >
      {/* ✅ Add Route Progress Bar */}
      <RouteProgressBar />
      
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={handleToggleSidebar}
        isMobile={isMobile}
      />

      <Layout
        className={`bg-white`}
        style={{
          marginLeft: isMobile ? "0" : sidebarCollapsed ? "80px" : "256px",
          transition: "margin-left 0.3s",
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
            background: isProfilePage ? "linear-gradient(180deg, #E9F3FF 0%, #FFFFFF 30%)" : colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: "32px 24px 48px 24px", // Added bottom padding
            position: "relative",
            minHeight: "calc(100vh - 64px)",
            height: "auto",
          }}
          className="transition-all duration-300 ease-in-out"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BackendLayout;
