"use client";

import React, { useEffect, createContext, useContext } from "react";
import dynamic from "next/dynamic";
import { Layout, theme } from "antd";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "@reduxjs/toolkit";

const { Content } = Layout;

// Split sidebar and header into their own chunks to keep frontend layout lighter
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

// Create context for sharing disableCreateDoc state
interface LayoutContextType {
  disableCreateDoc: boolean;
  setDisableCreateDoc: (disabled: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};

interface BackendLayoutProps {
  children: React.ReactNode;
}

const BackendLayout: React.FC<BackendLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { sidebarCollapsed } = useAppSelector((state: RootState) => state.ui);
  
  // Calculate responsive state
  const [isMobile, setIsMobile] = React.useState(false);
  const [disableCreateDoc, setDisableCreateDoc] = React.useState(false);

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
    <Layout className="bg-white min-h-screen">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={handleToggleSidebar} 
        isMobile={isMobile}
      />

      <Layout
        className="bg-white"
        style={{
          marginLeft: isMobile 
            ? "0" 
            : (sidebarCollapsed ? "80px" : "256px"),
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
          setDisableCreateDoc={setDisableCreateDoc}
        />

        <Content
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            padding: "32px 24px 48px 24px", // Added bottom padding
            position: "relative",
            minHeight: "calc(100vh - 64px)",
            height: "auto",
          }}
          className="transition-all duration-300 ease-in-out"
        >
          <LayoutContext.Provider value={{ disableCreateDoc, setDisableCreateDoc }}>
            {children}
          </LayoutContext.Provider>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BackendLayout;
