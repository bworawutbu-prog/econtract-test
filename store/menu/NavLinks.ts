/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import {
  UsersIcon,
  HomeIcon,
  SettingsIcon,
  ShieldIcon,
  UserCogIcon,
  FileTextIcon,
  InboxIcon,
  UserIcon,
  UsersRound,
  Building2,
  StampIcon,
  FilePen,
  UserRoundPen,
  UserRoundSearch
} from "lucide-react";
import React, { useState, useEffect, memo, useMemo } from "react";
import {
  usePermission,
  PageType,
  ActionType,
} from "../backendStore/permissionManager";
import { storageUtils, STORAGE_KEYS } from "../utils/localStorage";
import appEmitter from "../libs/eventEmitter";

type IconNames =
  | "UsersIcon"
  | "HomeIcon"
  | "SettingsIcon"
  | "ShieldIcon"
  | "UserCogIcon"
  | "Building2"
  | "FileTextIcon"
  | "InboxIcon"
  | "UserIcon"
  | "UsersRound"
  | "StampIcon"
  | "FilePen"
  | "UserRoundPen"
  | "UserRoundSearch"

interface RouteConfig {
  path: string;
  title: string;
  icon?: IconNames;
  children?: Record<string, RouteConfig>;
  requiredPermission?: {
    page: PageType;
    action?: ActionType;
  };
}

interface BackendRoutes {
  inbox: RouteConfig;
  // relationManagement: RouteConfig;
  // orgManagement: RouteConfig;
  stamp: RouteConfig;
  pdfCanvas: RouteConfig;
  profile: RouteConfig;
  systemSettings: RouteConfig;
  document: RouteConfig;
  manageBusinessUser: RouteConfig;
}

// Icon mapping object with proper typing
const IconMap: Record<
  IconNames,
  React.ComponentType<{
    size?: number;
    className?: string;
    width?: number;
    height?: number;
  }>
> = {
  UsersIcon,
  HomeIcon,
  SettingsIcon,
  ShieldIcon,
  UserCogIcon,
  Building2,
  FileTextIcon,
  InboxIcon,
  UserIcon,
  UsersRound,
  StampIcon,
  FilePen,
  UserRoundPen,
  UserRoundSearch
};

// Global state for menu refresh trigger
let menuRefreshTrigger = 0;

// Function to trigger menu refresh
export const triggerMenuRefresh = () => {
  menuRefreshTrigger += 1;
  // 📋 **Clear caches when menu refreshes**
  menuItemsCache = null;
  permissionsCache = null;
  // console.log('🔄 Menu refresh triggered:', menuRefreshTrigger);
  // Emit event to notify components
  appEmitter.emit('menuRefresh', { trigger: menuRefreshTrigger });
};

export const useMenuRefresh = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleMenuRefresh = (payload?: { trigger: number }) => {
      if (payload) {
        // console.log('🔄 Menu refresh event received:', payload.trigger);
        setRefreshTrigger(payload.trigger);
      }
    };

    appEmitter.on('menuRefresh', handleMenuRefresh);

    return () => {
      appEmitter.off('menuRefresh', handleMenuRefresh);
    };
  }, []);

  return refreshTrigger;
};
// Custom hook to watch menu refresh events
// export const useMenuRefresh = () => {
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   useEffect(() => {
//     const handleMenuRefresh = (payload?: { trigger: number }) => {
//       console.log('handleMenuRefresh', payload)
//       if (payload) {
//         console.log('📡 Menu refresh event received:', payload.trigger);
//         setRefreshTrigger(payload.trigger);
//       }
//     };

//     appEmitter.on('menuRefresh', handleMenuRefresh);

//     return () => {
//       appEmitter.off('menuRefresh', handleMenuRefresh);
//     };
//   }, []);

//   return refreshTrigger;
// };

// Menu wrapper component that responds to refresh events
// export const MenuWrapper: React.FC<{
//   children: (menuItems: MenuItem[]) => React.ReactNode;
//   options?: {
//     includeProfile?: boolean;
//     includePdfCanvas?: boolean;
//     pathname?: string;
//   };
// }> = memo(({ children, options }) => {
//   const refreshTrigger = useMenuRefresh();

//   // Re-create menu items when refresh trigger changes
//   const menuItems: MenuItem[] = useMemo(() => {
//     console.log('🔄 Re-creating menu items, trigger:', refreshTrigger);
//     return createMenuItems(options);
//   }, [refreshTrigger, options]);

//   return React.createElement(React.Fragment, null, children(menuItems));
// });

// Event handler for business selection changes
const checkUserPermissionsLoginBusiness = (biz_id: string) => {
  // console.log('🔄 Business changed:', biz_id);
  // Trigger menu refresh when business changes
  triggerMenuRefresh();
};

// Export function to manually trigger menu refresh
export const refreshMenu = () => {
  // console.log('🔄 Manual menu refresh triggered');
  triggerMenuRefresh();
};

// Export function to check permissions and refresh menu
export const checkPermissionsAndRefresh = () => {
  // console.log('🔍 Checking permissions and refreshing menu');
  // Clear cache to get fresh permissions
  permissionsCache = null;
  const permissions = checkUserPermissions();
  // console.log('📊 Current permissions:', permissions);
  triggerMenuRefresh();
  return permissions;
};

// Export function to handle business change from Header
export const handleBusinessChange = (businessValue: string, option: any) => {
  // Clear permissions cache when business changes
  permissionsCache = null;
  triggerMenuRefresh();
};

// 📋 **Cache for user permissions to prevent repeated localStorage reads**
let permissionsCache: { permissions: any; timestamp: number } | null = null;
const PERMISSIONS_CACHE_DURATION = 5000; // 5 seconds cache (increased for better performance)

// Helper function to check user permissions from localStorage with caching
const checkUserPermissions = () => {
  const now = Date.now();

  // 📋 **Check cache first**
  if (permissionsCache && now - permissionsCache.timestamp < PERMISSIONS_CACHE_DURATION) {
    return permissionsCache.permissions;
  }

  try {
    const persistAuthData = storageUtils.getItem(STORAGE_KEYS.PERSIST_AUTH);
    const selectedBusiness = localStorage.getItem('selectedBusiness');
    const roleBusiness = localStorage.getItem('roleBusiness');

    // console.log('🔍 checkUserPermissions - Raw values:', {
    //   selectedBusiness,
    //   roleBusiness,
    //   roleBusinessType: typeof roleBusiness,
    //   hasPersistAuthData: !!persistAuthData
    // });

    if (!persistAuthData || !selectedBusiness) {
      const result = { role: null, business_level: null, is_registered: false, selectedBusiness, roleBusiness };
      permissionsCache = { permissions: result, timestamp: now };
      return result;
    }

    let role = ""
    let business_level = undefined
    let is_registered = false
    // console.log('selectedBusiness', selectedBusiness)
    const parsedData = JSON.parse(persistAuthData);
    const authData = JSON.parse(parsedData?.user ?? "");
    // console.log('AAA authData', authData)
    if (!authData) {
      const result = { role: null, business_level: null, is_registered: false };
      permissionsCache = { permissions: result, timestamp: now };
      return result;
    }

    // Extract role and business_level
    role = authData?.role || "";
    const foundBusiness = authData?.business?.find((business: any) => business?.business_name_eng === selectedBusiness);
    business_level = foundBusiness?.business_level || 2;
    is_registered = foundBusiness?.is_registered || false;

    // console.log('🔍 Business calculation:', {
    //   selectedBusiness,
    //   foundBusiness,
    //   business_level,
    //   is_registered,
    //   roleBusiness
    // });

    const result = { role, business_level, is_registered, selectedBusiness, roleBusiness };
    permissionsCache = { permissions: result, timestamp: now };
    return result;
  } catch (error) {
    // console.error('Error parsing persist:auth data:', error);
    const result = { role: null, business_level: null, is_registered: false, selectedBusiness: 'ทั้งหมด', roleBusiness: null };
    permissionsCache = { permissions: result, timestamp: now };
    return result;
  }
};

// Helper function to check if user can see specific menus
// 🎯 PERFORMANCE: รับ permissions เป็น parameter แทนที่จะเรียก checkUserPermissions() ซ้ำๆ
const canSeeMenu = (
  menuType: 'stamp' | 'profile' | 'inbox' | 'document' | 'systemSettings' | 'relationManagement' | 'orgManagement' | 'manageBusinessUser',
  permissions: ReturnType<typeof checkUserPermissions> // รับ permissions object เข้ามา
) => {
  // 🎯 FIXED: ใช้ permissions ที่รับเข้ามาแทนการเรียก checkUserPermissions() ซ้ำ
  const { role, business_level, is_registered, selectedBusiness, roleBusiness } = permissions;

  // เงื่อนไขใหม่ตามที่กำหนด
  const condition1 = business_level == 2 && selectedBusiness !== 'ทั้งหมด' && roleBusiness == 'general';
  const condition2 = business_level == 2 && selectedBusiness !== 'ทั้งหมด' && roleBusiness == 'admin';
  const condition3 = business_level == 2 && selectedBusiness !== 'ทั้งหมด' && roleBusiness == 'admin' || roleBusiness == 'designer';
  const condition4 = !condition1 && !condition2 && !condition3;

  // เงื่อนไขสำหรับแต่ละเมนู
  if (menuType === 'stamp') {
    return condition1 || condition2;
  } else if (menuType === 'inbox') {
    return condition4;
  } else if (menuType === 'profile') {
    return condition1 || condition2 || condition4;
  } else if (menuType === 'document') {
    // สำหรับ condition3 จะเป็น view only /document/statusContract
    return condition1 || condition2;
  } else if (menuType === 'systemSettings') {
    return false;
  // } else if (menuType === 'relationManagement') {
  //   return condition1 ||condition2;
  //   // return false
  // } 
  } else if (menuType === 'orgManagement') {
    return condition1 || condition2;
  } else if (menuType === 'manageBusinessUser') {
    return condition1 || condition2;
  }
  else {
    return false;
  }
};

// Helper function to render icon with proper typing
export const renderIcon = (iconName?: IconNames) => {
  if (!iconName) return null;
  const IconComponent = IconMap[iconName];
  if (!IconComponent) return null;

  return React.createElement(IconComponent, { size: 20 });
};

export const backendRoutes: BackendRoutes = {
  inbox: {
    path: "/frontend",
    title: "สถานะของสัญญา",
    icon: "InboxIcon",
  },
  // relationManagement: {
  //   path: "group:relationManagement",
  //   title: "จัดการเทมเพลต",
  //   icon: "FileTextIcon",
  //   children: {
  //     manageDocument: {
  //       path: "/backend",
  //       title: "ประเภทเอกสารเทมเพลต",
  //       icon: undefined,
  //     },
  //     allDocument: {
  //       path: "/backend/allDoc",
  //       title: "เทมเพลตทั้งหมด",
  //       icon: undefined,
  //     },
  //     // reportDocument: {
  //     //   path: "/backend/reportDoc",
  //     //   title: "รายงาน",
  //     //   icon: undefined,
  //     // },
  //   },
  // },
  pdfCanvas: {
    path: "/backend/MappingTest",
    title: "Mapping (Test)",
    icon: "FileTextIcon",
  },
  // orgManagement: {
  //   path: "/organization",
  //   title: "จัดการองค์กร",
  //   icon: "Building2",
  // },
  stamp: {
    path: "group:stamp",
    title: "อากรแสตมป์",
    icon: "StampIcon",
    children: {
      formStamp: {
        path: "/stamp/form",
        title: "ฟอร์มชำระอากรแสตมป์",
        // icon: "StampIcon",
      },
      allFormStamp: {
        path: "/stamp/allForm",
        title: "รายการทั้งหมด",
        // icon: "StampIcon",
      },
    },
  },
  document: {
    path: "group:document",
    title: "จัดการเอกสาร",
    icon: "FilePen",
    children: {
      uploadPdf: {
        path: "/document/uploadPdf",
        title: "อัปโหลด PDF",
        icon: undefined,
      },
      // contractManagement: {
      //   path: "/document/manageContract",
      //   title: "จัดการเอกสารสัญญา",
      //   icon: undefined,
      // },
      contractStatus: {
        path: "/document/statusContract",
        title: "สถานะของสัญญา",
        icon: undefined,
      },
      manageDocument: {
        path: "/backend",
        title: "เทมเพลตเอกสารสัญญา",
        icon: undefined,
      },
      allDocument: {
        path: "/backend/allDoc",
        title: "จัดการเทมเพลต",
        icon: undefined,
      },
    }
  },
  manageBusinessUser: {
    path: "group:manageBusinessUser",
    title: "จัดการผู้ใช้งาน",
    icon: "UserRoundPen",
    children: {
      userInternal: {
        path: "/manageBusinessUser/internal",
        title: "ผู้ใช้งานภายใน",
        icon: undefined,
      },
      // b2bPartner: {
      //   path: "/manageBusinessUser/b2bPartner",
      //   title: "คู่สัญญา B2B",
      //   icon: undefined,
      // },
    }
  },
  profile: {
    path: "/profile",
    title: "Profile",
    icon: "UserIcon",
  },
  systemSettings: {
    path: "group:systemSettings",
    title: "ตั้งค่าระบบ",
    icon: "SettingsIcon",
    children: {
      permissionManagement: {
        path: "/backend/permissions/roles",
        title: "ข้อมูลการใช้งาน",
        // icon: "ShieldIcon",
        requiredPermission: {
          page: "permissionManagement",
          action: "read",
        },
      },
      userManagement: {
        path: "/backend/permissions/users",
        title: "จัดการผู้ใช้งาน",
        icon: "UsersIcon",
        requiredPermission: {
          page: "userManagement",
          action: "read",
        },
      },
      companyManagement: {
        path: "/backend/permissions/companies",
        title: "จัดการบริษัท",
        icon: "Building2",
        requiredPermission: {
          page: "companyManagement",
          action: "read",
        },
      },
      logActionUser: {
        path: "/backend/permissions/logActionUser",
        title: "ข้อมูลการใช้งาน",
        icon: "UserRoundSearch",
        requiredPermission: {
          page: "permissionManagement",
          action: "read",
        },
      },
    },
  },
};

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  children?: MenuItem[];
  isExpanded?: boolean;
  className?: string; // Add className for active state styling
  isChild?: boolean; // Flag to identify if this is a child menu item
  isGroupHeader?: boolean; // Flag to identify if this is a group header (has children)
  isSubHeader?: boolean; // Flag to identify if this is a sub-header (section divider)
}

// Helper function to create menu items
function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  const isGroupHeader = key.startsWith("group:");

  return {
    key,
    icon,
    children,
    label,
    path: key, // Add path property with the same value as key
    isChild: false, // Default to false for top-level items
    isGroupHeader, // Add flag to identify group headers
  } as MenuItem;
}

// 📋 **Cache for menu items to prevent unnecessary recalculations**
let menuItemsCache: { items: MenuItem[]; timestamp: number; options: any; permissions: any } | null = null;
const CACHE_DURATION = 10000; // 10 seconds cache (increased for better performance)

// Centralized menu creation function with caching
export const createMenuItems = (options?: {
  includeProfile?: boolean;
  includePdfCanvas?: boolean;
  pathname?: string; // Add pathname parameter
}): MenuItem[] => {
  const {
    includeProfile = true,
    includePdfCanvas = false,
    pathname = "/",
  } = options || {};

  // 📋 **Check cache first**
  const now = Date.now();
  // 🎯 PERFORMANCE: อ่าน Permission ครั้งเดียว (ไม่ว่าจะช้าหรือเร็วจาก cache)
  const currentPermissions = checkUserPermissions();

  if (menuItemsCache &&
    now - menuItemsCache.timestamp < CACHE_DURATION &&
    JSON.stringify(menuItemsCache.options) === JSON.stringify(options) &&
    JSON.stringify(menuItemsCache.permissions) === JSON.stringify(currentPermissions)) {
    return menuItemsCache.items;
  }

  const items: MenuItem[] = [];

  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu ทุกครั้ง
  // Add inbox menu item (only for Member with business_level 2)
  if (canSeeMenu('inbox', currentPermissions)) {
    items.push(
      getItem(
        backendRoutes.inbox.title,
        backendRoutes.inbox.path,
        backendRoutes.inbox.icon &&
        React.createElement(
          "span",
          { className: "anticon" },
          renderIcon(backendRoutes.inbox.icon)
        )
      )
    );
  }

  // Add document menu with submenu items
  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
  if (canSeeMenu('document', currentPermissions) && backendRoutes.document.children) {
    const childItems: MenuItem[] = [];

    // 🎯 FIXED: ใช้ currentPermissions ที่มีอยู่แล้ว ไม่ต้องเรียก checkUserPermissions() ซ้ำ
    const { business_level, is_registered, selectedBusiness, roleBusiness } = currentPermissions;

    // Check conditions for specific menu items
    const condition1 = is_registered == true
    const condition2 = is_registered == false;
    const condition4 = selectedBusiness == null;

    // console.log('🔍 Document menu conditions:', {
    //   condition1, condition2, condition4,
    //   canSeeUploadPdf: condition1 || condition2,
    //   canSeeContractStatus: condition1 || condition2 || condition4
    // });

    for (const child of Object.values(backendRoutes.document.children)) {
      let canSeeChild = false;
      if (child.path === "/document/uploadPdf") {
        canSeeChild = condition1
        // canSeeChild = true;
      } else if (child.path === "/document/statusContract") {
        canSeeChild = condition1 || condition2 || condition4;
        // canSeeChild = true;
      } else if (child.path === "/backend") {
        canSeeChild = condition1 || condition2 || condition4;
      } else {
        canSeeChild = true;
      }

      if (canSeeChild) {
        childItems.push({
          ...getItem(
            child.title,
            child.path,
            child.icon &&
            React.createElement(
              "span",
              { className: "anticon" },
              renderIcon(child.icon)
            )
          ),
          isChild: true,
          isGroupHeader: false,
        });
      }
    }

    items.push({
      ...getItem(
        backendRoutes.document.title,
        backendRoutes.document.path,
        backendRoutes.document.icon &&
        React.createElement(
          "span",
          { className: "anticon" },
          renderIcon(backendRoutes.document.icon)
        ),
        childItems
      ),
      isChild: false, // Parent item
      isGroupHeader: true, // Has children, so it's a group header
    });
  }

  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
  if (canSeeMenu('manageBusinessUser', currentPermissions) && backendRoutes.manageBusinessUser.children) {
    const childItems: MenuItem[] = [];

    for (const child of Object.values(backendRoutes.manageBusinessUser.children)) {
      childItems.push({
        ...getItem(
          child.title,
          child.path,
          child.icon &&
          React.createElement(
            "span",
            { className: "anticon" },
            renderIcon(child.icon)
          )
        ),
        isChild: true, // Mark as child item
        isGroupHeader: false, // Not a group header
      });
    }

    items.push({
      ...getItem(
        backendRoutes.manageBusinessUser.title,
        backendRoutes.manageBusinessUser.path,
        backendRoutes.manageBusinessUser.icon &&
        React.createElement(
          "span",
          { className: "anticon" },
          renderIcon(backendRoutes.manageBusinessUser.icon)
        ),
        childItems
      ),
      isChild: false, // Parent item
      isGroupHeader: true, // Has children, so it's a group header
    });
  }

  // Add relation management menu with submenu items
  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
  // if (canSeeMenu('relationManagement', currentPermissions) && backendRoutes.relationManagement.children) {
  //   const childItems: MenuItem[] = [];

  //   for (const child of Object.values(backendRoutes.relationManagement.children)) {
  //     // 🎯 FIXED: Ensure all children are included, including reportDocument
  //     if (child && child.path && child.title) {
  //       childItems.push({
  //         ...getItem(
  //           child.title,
  //           child.path,
  //           child.icon &&
  //           React.createElement(
  //             "span",
  //             { className: "anticon" },
  //             renderIcon(child.icon)
  //           )
  //         ),
  //         isChild: true, // Mark as child item
  //         isGroupHeader: false, // Not a group header
  //       });
  //     }
  //   }

  //   items.push({
  //     ...getItem(
  //       backendRoutes.relationManagement.title,
  //       backendRoutes.relationManagement.path,
  //       backendRoutes.relationManagement.icon &&
  //       React.createElement(
  //         "span",
  //         { className: "anticon" },
  //         renderIcon(backendRoutes.relationManagement.icon)
  //       ),
  //       childItems
  //     ),
  //     isChild: false, // Parent item
  //     isGroupHeader: true, // Has children, so it's a group header
  //   });
  // }
  // Add org management menu item
  // if (canSeeMenu('orgManagement')) {
  // items.push(
  //   getItem(
  //     backendRoutes.orgManagement.title,
  //     backendRoutes.orgManagement.path,
  //     backendRoutes.orgManagement.icon &&
  //       React.createElement(
  //         "span",
  //         { className: "anticon" },
  //         renderIcon(backendRoutes.orgManagement.icon)
  //       )
  //   )
  // );
  // }
  // Add Stamp menu with submenu items (only for Member with business_level 2)
  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
  if (canSeeMenu('stamp', currentPermissions) && backendRoutes.stamp.children) {
    const childItems: MenuItem[] = [];

    for (const child of Object.values(backendRoutes.stamp.children)) {
      childItems.push({
        ...getItem(
          child.title,
          child.path,
          child.icon &&
          React.createElement(
            "span",
            { className: "anticon" },
            renderIcon(child.icon)
          )
        ),
        isChild: true, // Mark as child item
        isGroupHeader: false, // Not a group header
      });
    }

    items.push({
      ...getItem(
        backendRoutes.stamp.title,
        backendRoutes.stamp.path,
        backendRoutes.stamp.icon &&
        React.createElement(
          "span",
          { className: "anticon" },
          renderIcon(backendRoutes.stamp.icon)
        ),
        childItems
      ),
      isChild: false, // Parent item
      isGroupHeader: true, // Has children, so it's a group header
    });
  }

  // Add System Settings menu with submenu items
  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
  if (canSeeMenu('systemSettings', currentPermissions) && backendRoutes.systemSettings.children) {
    const childItems: MenuItem[] = [];

    // Use a for...of loop for Object.values instead of forEach to avoid unused variables
    for (const child of Object.values(backendRoutes.systemSettings.children)) {
      childItems.push({
        ...getItem(
          child.title,
          child.path,
          child.icon &&
          React.createElement(
            "span",
            { className: "anticon" },
            renderIcon(child.icon)
          )
        ),
        isChild: true, // Mark as child item
        isGroupHeader: false, // Not a group header
      });
    }

    items.push({
      ...getItem(
        backendRoutes.systemSettings.title,
        backendRoutes.systemSettings.path,
        backendRoutes.systemSettings.icon &&
        React.createElement(
          "span",
          { className: "anticon" },
          renderIcon(backendRoutes.systemSettings.icon)
        ),
        childItems
      ),
      isChild: false, // Parent item
      isGroupHeader: true, // Has children, so it's a group header
    });
  }

  // Add PDF Canvas menu item (optional)
  // if (includePdfCanvas) {
  //   items.push(
  //     getItem(
  //       backendRoutes.pdfCanvas.title,
  //       backendRoutes.pdfCanvas.path,
  //       backendRoutes.pdfCanvas.icon &&
  //         React.createElement('span', { className: "anticon" },
  //           renderIcon(backendRoutes.pdfCanvas.icon)
  //         )
  //     )
  //   );
  // }



  // Add profile menu item (only for Member with business_level 2)
  // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
  if (includeProfile && canSeeMenu('profile', currentPermissions)) {
    // Add sub-header "ตั้งค่า" before profile
    items.push({
      key: "subheader:settings",
      icon: null,
      label: "ตั้งค่า",
      path: "subheader:settings",
      isChild: false,
      isGroupHeader: false,
      isSubHeader: true,
    });
    items.push(
      getItem(
        backendRoutes.profile.title,
        backendRoutes.profile.path,
        backendRoutes.profile.icon &&
        React.createElement(
          "span",
          { className: "anticon" },
          renderIcon(backendRoutes.profile.icon)
        )
      )
    );
  }

  // 📋 **Cache the results**
  menuItemsCache = {
    items,
    timestamp: now,
    options: { includeProfile, includePdfCanvas, pathname },
    permissions: currentPermissions
  };

  return items;
};

export const getMenuItems = (): MenuItem[] => {
  const { canAccess, canPerformAction } = usePermission();
  
  // 🎯 PERFORMANCE: อ่าน Permission ครั้งเดียว
  const currentPermissions = checkUserPermissions();

  return Object.entries(backendRoutes)
    .filter(([key, route]) => {
      // Check specific menu permissions first
      // 🎯 PERFORMANCE: ส่ง currentPermissions เข้าไปใน canSeeMenu
      if (key === 'inbox' && !canSeeMenu('inbox', currentPermissions)) return false;
      if (key === 'stamp' && !canSeeMenu('stamp', currentPermissions)) return false;
      if (key === 'profile' && !canSeeMenu('profile', currentPermissions)) return false;
      // if (key === 'relationManagement' && !canSeeMenu('relationManagement', currentPermissions)) return false;
      if (key === 'manageBusinessUser' && !canSeeMenu('manageBusinessUser', currentPermissions)) return false;
      if (key === 'document' && !canSeeMenu('document', currentPermissions)) return false;
      if (key === 'systemSettings' && !canSeeMenu('systemSettings', currentPermissions)) return false;

      // If there's a required permission, check it
      if (route.requiredPermission) {
        const { page, action } = route.requiredPermission;
        if (action) {
          return canPerformAction(page, action);
        }
        return canAccess(page);
      }
      // No permission required for this route
      return true;
    })
    .map(([key, route]) => {
      const menuItem: MenuItem = {
        key,
        icon: renderIcon(route.icon),
        label: route.title,
        path: route.path,
      };

      // Add children if they exist
      if (route.children) {
        const childEntries = Object.entries(route.children) as [
          string,
          RouteConfig
        ][];

        menuItem.children = childEntries
          .filter(([_, childRoute]) => {
            if (childRoute.requiredPermission) {
              const { page, action } = childRoute.requiredPermission;
              if (action) {
                return canPerformAction(page, action);
              }
              return canAccess(page);
            }
            return true;
          })
          .map(([childKey, childRoute]) => {
            // Create child menu item
            const childMenuItem: MenuItem = {
              key: `${key}_${childKey}`,
              icon: renderIcon(childRoute.icon),
              label: childRoute.title,
              path: childRoute.path,
            };

            // Add grandchildren if they exist
            if (childRoute.children) {
              const grandchildEntries = Object.entries(childRoute.children) as [
                string,
                RouteConfig
              ][];

              childMenuItem.children = grandchildEntries
                .filter(([_, grandchildRoute]) => {
                  if (grandchildRoute.requiredPermission) {
                    const { page, action } = grandchildRoute.requiredPermission;
                    if (action) {
                      return canPerformAction(page, action);
                    }
                    return canAccess(page);
                  }
                  return true;
                })
                .map(([grandchildKey, grandchildRoute]) => ({
                  key: `${key}_${childKey}_${grandchildKey}`,
                  icon: renderIcon(grandchildRoute.icon),
                  label: grandchildRoute.title,
                  path: grandchildRoute.path,
                }));
            }

            return childMenuItem ?? [];
          });
      }
      return menuItem;
    });
};