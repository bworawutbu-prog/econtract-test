"use client";

import React, { useState, useEffect } from "react";
import { MenuIcon, X, ChevronDownIcon } from "lucide-react";
import { Button, Drawer, Space, Collapse } from "antd";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createMenuItems, backendRoutes } from "@/store/menu/NavLinks";
import { enqueueSnackbar } from "notistack";

const SidebarButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 🎯 PERFORMANCE: ใช้ useState + useEffect เพื่อให้แสดง Loading ได้
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // 🎯 PERFORMANCE: โหลด menu items แบบ async เพื่อไม่ให้ block การ render
  useEffect(() => {
    setIsLoadingMenu(true);

    // ใช้ setTimeout เพื่อให้ React render Loading state ก่อน
    const timer = setTimeout(() => {
      const items = createMenuItems({
        includeProfile: true,
        includePdfCanvas: true,
      });
      
      setMenuItems(items);
      setIsLoadingMenu(false);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []); // ทำงานครั้งเดียวเมื่อ component mount

  // Helper function to check if a menu item should be active
  const isActive = (itemPath: string, itemChildren?: any[]) => {
    if (!itemPath) return false;
    if (pathname === itemPath) return true;

    if (itemChildren) {
      return itemChildren.some((child) => {
        if (child && child.path === pathname) return true;
        // Check nested children (grandchildren) if they exist
        if (child && child.children) {
          return child.children.some(
            (grandChild: any) => grandChild && grandChild.path === pathname
          );
        }
        return false;
      });
    }

    return false;
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleMenuClick = (path: string) => {
    if (path === "#" || path.startsWith("group:") || path.startsWith("subheader:")) return;
    router.push(path);
    onClose();
  };

  // Helper function to render menu item (similar to Sidebar.tsx)
  const renderMenuItem = (item: any) => {
    // Safety check for item.path
    if (!item || !item.path) {
      enqueueSnackbar(`🎯 [SidebarButton] Invalid menu item: ${item}`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return <></>;
    }

    const active = isActive(item.path, item.children);
    const hasChildren = item.children && item.children.length > 0;

    // Render sub-header (section divider)
    if (item.isSubHeader) {
      return (
        <div key={item.key} className="px-4 py-2 !mt-4 mb-2">
          <div className="text-gray-600 text-sm uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      );
    }

    // Render submenu with Collapse for items that have children
    if (hasChildren) {
      // Check if any child path matches the current pathname to auto-expand
      const shouldExpand = item.children?.some((child: any) => child && child.path === pathname);
      
      return (
        <div key={item.key} className="mb-2">
          <Collapse
            ghost
            // defaultActiveKey={shouldExpand ? [item.key] : []}
            className="bg-transparent border-none hover:bg-blue-200 hover:!text-[#0153BD] [&_.ant-collapse-header]:!px-4 [&_.ant-collapse-content-box]:space-y-2 [&_.ant-collapse-content-box]:!p-0"
            expandIconPosition="end"
            defaultActiveKey={
              isActive(item.path, item.children) || shouldExpand? [item.key] : []
            }
            expandIcon={({ isActive }) => (
              <ChevronDownIcon
                size={16}
                color="#0153BD"
                className={`transition-transform duration-200 ${isActive ? 'rotate-180' : ''
                  }`}
              />
            )}
            items={[
              {
                key: item.key,
                label: (
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <span className="anticon flex items-center justify-center w-5 h-5">
                        {item.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ),
                children: (
                  <>
                    {item.children
                      .filter((child: any) => child && child.path)
                      .map((child: any) => (
                        <Link
                          key={child.key}
                          href={child.path}
                          className={`block rounded-xl px-4 py-3 ${isActive(child.path) ? "bg-[#0153BD] text-white" : ""}`}
                          onClick={() => handleMenuClick(child.path)}
                        >
                          <div className={`${isActive(child.path) ? "bg-[#0153BD] text-white" : "text-[#0153BD]"} rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer hover:text-[#0153BD]`}>
                            {child.icon && (
                              <span className="anticon flex items-center justify-center w-5 h-5">
                                {child.icon}
                              </span>
                            )}
                            <span className="text-sm font-medium whitespace-nowrap">
                              {child.label}
                            </span>
                          </div>
                        </Link>
                      ))}
                  </>
                ),
              },
            ]}
            style={{
              padding: "12px 16px !important",
            }}
          />
        </div>
      );
    }

    // Render regular menu item (no children)
    return (
      <Link
        key={item.key}
        href={item.path}
        className={`block rounded-xl ${active ? "bg-[#0153BD] text-white" : ""}`}
        onClick={() => handleMenuClick(item.path)}
      >
        <div
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-blue-200 hover:text-white cursor-pointer rounded-xl ${active ? "bg-[#0153BD] text-white" : " hover:text-[#0153BD]"
            }`}
        >
          {item.icon && (
            <span className="anticon flex items-center justify-center w-5 h-5">
              {item.icon}
            </span>
          )}
          <span className="text-sm font-medium whitespace-nowrap">
            {item.label}
          </span>
        </div>
      </Link>
    );
  };

  // Menu section using Next.js Link and Ant Design Collapse
  // 🎯 PERFORMANCE: แสดง Loading Spinner เมื่อกำลังโหลด
  const menuSection = isLoadingMenu ? (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0153BD]"></div>
    </div>
  ) : (
    <div className="space-y-2 overflow-hidden">
      {
        menuItems
          .filter((item) => item && item.path) // Filter out invalid items
          .map((item) => renderMenuItem(item))
          .filter(Boolean) // Remove null items
      }
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={showDrawer}
        className="p-1 border border-theme rounded-lg transition-colors"
      >
        <MenuIcon color="#0153BD" size={24} />
      </button>

      <Drawer
        title="DigiTract"
        closeIcon={false}
        placement="left"
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button
              onClick={onClose}
              type="text"
              className="px-0 flex items-center justify-center"
            >
              <X />
            </Button>
          </Space>
        }
      >
        {menuSection}
      </Drawer>
    </>
  );
};

export default SidebarButton;
