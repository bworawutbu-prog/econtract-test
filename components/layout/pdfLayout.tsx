/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Layout, theme } from "antd";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import AppHeader from "./Header";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "@reduxjs/toolkit";

const { Content } = Layout;

interface PdfLayoutProps {
  children: React.ReactNode;
}

const PdfLayout: React.FC<PdfLayoutProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;

  
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [collapsed, setCollapsed] = useState(true);
  const [isBroken, setIsBroken] = useState(false);
  const [isMounted, setIsMounted] = useState(false)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  // Ensure Sidebar is collapsed when using PdfLayout, but only at initial load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <Layout className="min-h-screen bg-[#F6F8FA] overflow-hidden">
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        isPdfLayout={true} 
      />

      <Layout
        className="relative bg-[#F6F8FA] overflow-hidden"
        style={{
          marginLeft: collapsed ? 0 : isBroken ? 0 : 256,
          transition: "margin-left 0.3s",
          height: "100vh",
        }}
      >
        <AppHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          userData={user} 
          isPdfLayout={true}
          colorBgContainer={colorBgContainer}
          handleLogout={handleLogout}
        />

        <Content
          className="absolute left-0 right-0 bottom-0"
          style={{
            margin: 0,
            padding: 0,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: "calc(100vh - 64px)",
            height: "auto",
            position: "relative",
            overflow: "auto"
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PdfLayout;
