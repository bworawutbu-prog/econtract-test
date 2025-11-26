"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface TabItem {
  id: string;
  label: string;
  icon?: any; // SVG or image source
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
  renderContent?: (activeTab: string) => React.ReactNode;
}

export function Tabs({
  tabs,
  defaultActiveTab,
  onTabChange,
  className = "",
  tabListClassName = "",
  tabContentClassName = "",
  renderContent,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || "");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`md:flex relative z-10 ${className}`}>
      <ul className={`profile-tabs md:block sm:flex flex md:space-y-4 sm:space-y-0 md:space-x-0 sm:space-x-4 font-medium text-gray-500 md:me-10 mb-4 md:mb-0 p-4 bg-white rounded-2xl min-w-[250px] h-fit shadow-theme overflow-x-auto max-w-full scrollbar-hide ${tabListClassName}`}>
        {tabs?.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center px-4 py-3 gap-2 rounded-lg w-full text-left transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-theme bg-[#F0F6FF]"
                  : "hover:text-gray-900 hover:bg-[#F0F6FF]"
              }`}
              aria-current={activeTab === tab.id ? "page" : false}
            >
              {tab.icon && (
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={20}
                  height={20}
                  className="hidden sm:block md:block"
                />
              )}
              <span className="min-w-fit">{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>
      
      <div className={`profile-content p-6 bg-white text-medium rounded-2xl w-full shadow-theme ${tabContentClassName}`}>
        {renderContent ? (
          renderContent(activeTab)
        ) : (
          activeTabData?.content || <></>
        )}
      </div>
    </div>
  );
}

export default Tabs;
