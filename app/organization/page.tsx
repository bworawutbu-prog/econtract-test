"use client";

import React, { useState } from "react";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import ProfileIcon from "@/assets/webp/org/profile.webp";
import OrgTreeIcon from "@/assets/webp/org/org_tree.webp";
import OrgMembersIcon from "@/assets/webp/org/members.webp";
import OrgStampIcon from "@/assets/webp/org/stamp.webp";
import OrgManagement from "./orgComponents/orgManagement";
import OrgTree from "./orgComponents/orgTree";
import OrgMembers from "./orgComponents/orgMembers";
import OrgStamp from "./orgComponents/orgStamp";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type TabType = "profile" | "member";

function Organization() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const router = useRouter();

  const tabs: TabItem[] = [
    {
      id: "orgManagement",
      label: "จัดการโปรไฟล์",
      icon: ProfileIcon,
    },
    {
      id: "orgTree",
      label: "โครงสร้างองค์กร",
      icon: OrgTreeIcon,
    },
    {
      id: "orgMembers",
      label: "สมาชิกองค์กร",
      icon: OrgMembersIcon,
    },
    {
      id: "orgStamp",
      label: "ตราประทับ",
      icon: OrgStampIcon,
    },
  ];

  const renderTabContent = (activeTab: string) => {
    switch (activeTab) {
      case "orgManagement":
        return <OrgManagement />;
      case "orgTree":
        return <OrgTree />;
      case "orgMembers":
        return <OrgMembers />;
      case "orgStamp":
        return <OrgStamp />;
      default:
        return null;
    }
  };

  return (
    <section className="organization-page">
      <div className="flex items-center gap-2 mb-10">
        <button onClick={() => router.back()}>
          <ChevronLeft size={24} className="text-theme" />
        </button>
        <span className="text-xl font-bold text-theme">จัดการองค์กร</span>
      </div>

      <Tabs
        tabs={tabs}
        defaultActiveTab="orgStamp"
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
        renderContent={renderTabContent}
      />
    </section>
  );
}

export default Organization;
