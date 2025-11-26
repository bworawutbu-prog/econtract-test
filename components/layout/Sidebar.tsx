"use client";

import React, { useMemo, useCallback, memo, useState, useEffect } from "react";
import { Layout, Collapse } from "antd";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon, ChevronDownIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createMenuItems, backendRoutes, useMenuRefresh } from "@/store/menu/NavLinks";
// import LogoWhite from "@/assets/image/icon/digitrust_logo_white.png";
import LogoWhite from "@/assets/webp/digitractLogo/logo-white.webp";
import { enqueueSnackbar } from "notistack";

const { Sider } = Layout;
// 📋 **Separate component for menu items to prevent re-renders**
const MenuItems = memo(({
  menuItems,
  collapsed,
  renderMenuItem,
  currentPathname
}: {
  menuItems: any[],
  collapsed: boolean,
  renderMenuItem: (item: any) => React.ReactNode,
  currentPathname: string
}) => {
  // console.log('🔄 MenuItems re-rendered at:', new Date().toLocaleTimeString());

  const validItems = useMemo(() => {
    return menuItems
      .filter((item) => item && item.path) // Filter out invalid items
      .filter((item) => !item.isSubHeader || !collapsed); // Filter out sub-headers when collapsed
  }, [menuItems, collapsed]);

  const renderedItems = useMemo(() => {
    return validItems?.map((item) => renderMenuItem(item)).filter(Boolean);
  }, [validItems, renderMenuItem, currentPathname]);

  return (
    <div className="space-y-2 overflow-hidden px-4">
      {renderedItems}
    </div>
  );
}, (prevProps, nextProps) => {
  // 📋 **Custom comparison to prevent re-renders**
  return (
    prevProps.collapsed === nextProps.collapsed &&
    prevProps.menuItems === nextProps.menuItems &&
    prevProps.renderMenuItem === nextProps.renderMenuItem &&
    prevProps.currentPathname === nextProps.currentPathname
  );
});

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isPdfLayout?: boolean;
  isMobile?: boolean;
  contentPadding?: boolean;
}

// 📋 **Wrapper component that handles pathname changes**
const SidebarWrapper: React.FC<SidebarProps> = (props) => {
  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);
  pathnameRef.current = pathname;

  return <SidebarInner {...props} pathnameRef={pathnameRef} currentPathname={pathname} />;
};

// 📋 **Inner component that doesn't depend on pathname**
const SidebarInner: React.FC<SidebarProps & { pathnameRef: React.MutableRefObject<string>; currentPathname: string }> = ({
  collapsed,
  setCollapsed,
  isPdfLayout = false,
  isMobile = false,
  contentPadding = true,
  pathnameRef,
  currentPathname,
}) => {
  // 📋 **Debug: Log when sidebar re-renders**
  // console.log('🔄 SidebarInner re-rendered at:', new Date().toLocaleTimeString());
  const router = useRouter();

  // 📋 **Watch for menu refresh events**
  const refreshTrigger = useMenuRefresh();

  // 🎯 PERFORMANCE: ใช้ useState + useEffect เพื่อให้แสดง Loading ได้
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // 🎯 PERFORMANCE: โหลด menu items แบบ async เพื่อไม่ให้ block การ render
  useEffect(() => {
    // บอกให้ UI เริ่ม "โหลด"
    setIsLoadingMenu(true);

    // เรียกฟังก์ชัน createMenuItems (ตอนนี้มันทำงานเร็วมากแล้วเพราะแก้ไขแล้ว)
    // ใช้ setTimeout เพื่อให้ React render Loading state ก่อน
    const timer = setTimeout(() => {
      const items = createMenuItems({
        includeProfile: true,
        includePdfCanvas: false,
      });
      
      // อัปเดต state และบอกว่า "โหลดเสร็จแล้ว"
      setMenuItems(items);
      setIsLoadingMenu(false);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [refreshTrigger]); // ทำงานใหม่ทุกครั้งที่ refresh trigger เปลี่ยน

  const handleLogoClick = useCallback(() => {
    router.push(backendRoutes.inbox.path);
  }, [router]);

  // 📋 **Active state checker - only re-render when menu refreshes**
  const isActive = useCallback((itemPath: string, itemChildren?: any[]) => {
    if (!itemPath) return false;
    if (currentPathname === itemPath) return true;

    if (itemChildren) {
      return itemChildren.some((child) => {
        if (child && child.path === currentPathname) return true;
        // Check nested children (grandchildren) if they exist
        if (child && child.children) {
          return child.children.some(
            (grandChild: any) => grandChild && grandChild.path === currentPathname
          );
        }
        return false;
      });
    }

    return false;
  }, [currentPathname, refreshTrigger]); // Include currentPathname to update active state

  // 📋 **Memoized menu item renderer to prevent unnecessary re-renders**
  const renderMenuItem = useCallback((item: any, isChild: boolean = false) => {
    // Safety check for item.path
    if (!item || !item.path) {
      enqueueSnackbar(`🎯 [Sidebar] Invalid menu item: ${item}`, {
        variant: "warning",
        autoHideDuration: 3000,
      });
      return <></>;
    }

    const active = item.path === currentPathname ||
      (item.children && item.children.some((child: any) =>
        child && child.path === currentPathname
      ));
    const hasChildren = item.children && item.children.length > 0;

    // Render sub-header (section divider)
    if (item.isSubHeader) {
      return (
        <div key={item.key} className="px-4 py-2 !mt-4 mb-2">
          <div className="text-[#E6E6E6] text-sm uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      );
    }

    // Render submenu with Collapse for items that have children
    if (hasChildren) {
      // Check if any child path matches the current pathname to auto-expand
      const shouldExpand = item.children?.some((child: any) => child && child.path === currentPathname);
      
      return (
        <div key={item.key} className="mb-2">
          <Collapse
            ghost
            // defaultActiveKey={shouldExpand ? [item.key] : []}
            className="bg-transparent border-none [&_.ant-collapse-header]:!px-4 [&_.ant-collapse-content-box]:space-y-2 [&_.ant-collapse-content-box]:!p-0"
            expandIconPosition="end"
            defaultActiveKey={
              isActive(item.path, item.children) || shouldExpand?  [item.key] : []
            }
            expandIcon={({ isActive }) => (
              <div>
                {!collapsed && (
                  <ChevronDownIcon
                    size={16}
                    color="#FFFFFF"
                    className={`transition-transform duration-200 ${isActive ? "rotate-180" : ""
                      }`}
                  />
                )}
              </div>
            )}
            items={[
              {
                key: item.key,
                label: (
                  <div className="flex items-center gap-3 text-white hover:text-white">
                    {item.icon && (
                      <span className="anticon flex items-center justify-center w-5 h-5">
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
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
                          className={`block rounded-xl px-4 py-3 ${child.path === currentPathname
                            ? "bg-white text-[#0153BD]"
                            : ""
                            }`}
                        >
                          <div
                            className={`${child.path === currentPathname
                              ? "bg-white text-[#0153BD]"
                              : "text-white"
                              } rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer`}
                          >
                            {child.icon && (
                              <span className="anticon flex items-center justify-center w-5 h-5">
                                {child.icon}
                              </span>
                            )}
                            {!collapsed && (
                              <span className="text-sm font-medium whitespace-nowrap">
                                {child.label}
                              </span>
                            )}
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

    return (
      <Link
        key={item.key}
        href={item.path}
        className={`block rounded-xl ${active ? "bg-white text-text-[#0153BD]" : ""
          }`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-theme cursor-pointer rounded-xl ${active ? "bg-white text-theme" : "text-white hover:text-white"
            } ${collapsed ? "justify-center" : ""}`}
        >
          {item.icon && (
            <span className="anticon flex items-center justify-center w-5 h-5">
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          )}
        </div>
      </Link>
    );
  }, [currentPathname, refreshTrigger, collapsed]); // Include currentPathname to update active state

  // Common logo section that works for both layouts
  const logoSection = (
    <div className="flex items-center h-16 mb-4">
      {collapsed ? (
        <div className="flex justify-center items-center w-full">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 border border-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <MenuIcon color="#FFFFFF" size={24} />
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center w-full px-5">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
          >
            <Image src={LogoWhite} width={26} height={26} alt="Logo" priority />
            <p className="text-lg font-bold text-white">DigiTract</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 border border-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <MenuIcon color="#FFFFFF" size={24} />
          </button>
        </div>
      )}
    </div>
  );

  // 📋 **Menu section using separate component**
  const menuSection = useMemo(() => {
    // 🎯 PERFORMANCE: แสดง Loading Spinner เมื่อกำลังโหลด
    if (isLoadingMenu) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      );
    }

    return (
      <MenuItems
        menuItems={menuItems}
        collapsed={collapsed}
        renderMenuItem={renderMenuItem}
        currentPathname={currentPathname}
      />
    );
  }, [menuItems, collapsed, renderMenuItem, currentPathname, isLoadingMenu]); // Include isLoadingMenu

  // Common Sider props and classNames
  const commonSiderClassNames =
    "min-h-screen rounded-tr-3xl bg-gradient-to-b from-[#0153BD] to-[#4CA8EE] transition-all duration-300";

  if (isPdfLayout) {
    return (
      <>
        <Sider
          trigger={false}
          collapsible
          collapsed={collapsed}
          collapsedWidth={0}
          width={256}
          className={`fixed left-0 top-0 z-40 ${commonSiderClassNames}`}
          style={{
            overflow: "auto",
            transform: collapsed ? "translateX(-100%)" : "translateX(0)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          {logoSection}
          {menuSection}
        </Sider>
      </>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      className={`
        ${isMobile ? "hidden" : "block"}
        ${contentPadding ? "fixed" : "relative"}
        ${commonSiderClassNames}
      `}
      style={{
        top: 0,
        left: 0,
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      {logoSection}
      {menuSection}
    </Sider>
  );
};

// 📋 **Memoize the inner component to prevent unnecessary re-renders**
const Sidebar = memo(SidebarInner, (prevProps, nextProps) => {
  // 📋 **Custom comparison to prevent re-renders**
  return (
    prevProps.collapsed === nextProps.collapsed &&
    prevProps.setCollapsed === nextProps.setCollapsed &&
    prevProps.isPdfLayout === nextProps.isPdfLayout &&
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.contentPadding === nextProps.contentPadding &&
    prevProps.pathnameRef === nextProps.pathnameRef
  );
});

// 📋 **Export the wrapper component**
export default SidebarWrapper;
