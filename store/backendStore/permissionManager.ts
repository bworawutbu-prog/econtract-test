"use client";

// กำหนดหน้าทั้งหมดในระบบ
export type PageType =
  | "dashboard"
  | "folderWorkspace"
  | "formBuilder"
  | "userManagement"
  | "companyManagement"
  | "reportManagement"
  | "permissionManagement"; // Add new permission management page

// กำหนดแอคชันทั้งหมดที่สามารถทำได้
export type ActionType = "read" | "create" | "update" | "delete";

// กำหนดอีเวนต์พิเศษเฉพาะในแต่ละหน้า
export type EventPermission = {
  [key: string]: boolean;
};

// กำหนดโครงสร้างของสิทธิ์การเข้าถึง
export interface PagePermission {
  access: boolean;
  actions: {
    [key in ActionType]?: boolean;
  };
  events?: EventPermission;
}

// โครงสร้างข้อมูลของสิทธิ์ทั้งหมด
export interface UserPermissions {
  role: string;
  pages: {
    [key in PageType]?: PagePermission;
  };
}

// กำหนดสิทธิ์สำหรับแต่ละบทบาท
const rolePermissions: Record<string, UserPermissions> = {
  "Super Admin": {
    role: "Super Admin",
    pages: {
      dashboard: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
      },
      folderWorkspace: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
        events: {
          viewAllWorkspaces: true,
          manageAccessRights: true,
          createWorkspaceAllTypes: true, // สามารถสร้าง workspace ได้ทุกประเภท
        },
      },
      formBuilder: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
        events: {
          publishForms: true,
          createTemplates: true,
        },
      },
      userManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
        events: {
          assignRoles: true,
        },
      },
      companyManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
      },
      reportManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
        events: {
          exportReports: true,
        },
      },
      permissionManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: true },
        events: {
          assignGlobalPermissions: true,
        },
      },
    },
  },
  Admin: {
    role: "Admin",
    pages: {
      dashboard: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
      },
      folderWorkspace: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
        events: {
          viewAllWorkspaces: true,
          manageAccessRights: true,
          createWorkspaceAllTypes: true, // สามารถสร้าง workspace ได้ทุกประเภท
        },
      },
      formBuilder: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
        events: {
          publishForms: true,
          createTemplates: true,
        },
      },
      userManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
        events: {
          assignRoles: true, // สามารถจัดการบทบาทได้ แต่ไม่สามารถลบผู้ใช้ได้
        },
      },
      companyManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
      },
      reportManagement: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
        events: {
          exportReports: true,
        },
      },
      permissionManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
    },
  },
  Designer: {
    role: "Designer",
    pages: {
      dashboard: {
        access: true,
        actions: { read: true, create: false, update: false, delete: false },
      },
      folderWorkspace: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
        events: {
          viewAllWorkspaces: false, // เห็นเฉพาะ workspace ที่ได้รับอนุญาต
          manageAccessRights: false, // ไม่สามารถจัดการสิทธิ์การเข้าถึงได้
          createWorkspaceAllTypes: false, // ไม่สามารถสร้าง workspace ประเภท department ได้
        },
      },
      formBuilder: {
        access: true,
        actions: { read: true, create: true, update: true, delete: false },
        events: {
          publishForms: true,
          createTemplates: false, // ไม่สามารถสร้างเทมเพลตใหม่ได้
        },
      },
      userManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
      companyManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
      reportManagement: {
        access: true,
        actions: { read: true, create: false, update: false, delete: false },
        events: {
          exportReports: false, // ไม่สามารถส่งออกรายงานได้
        },
      },
      permissionManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
    },
  },
  Member: {
    role: "Member",
    pages: {
      dashboard: {
        access: true,
        actions: { read: true, create: false, update: false, delete: false },
      },
      folderWorkspace: {
        access: true,
        actions: { read: true, create: false, update: false, delete: false },
        events: {
          viewAllWorkspaces: false, // เห็นเฉพาะ workspace ที่ได้รับอนุญาต
          manageAccessRights: false,
          createWorkspaceAllTypes: false,
        },
      },
      formBuilder: {
        access: true,
        actions: { read: true, create: false, update: false, delete: false },
        events: {
          publishForms: false,
          createTemplates: false,
        },
      },
      userManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
      companyManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
      reportManagement: {
        access: true,
        actions: { read: true, create: false, update: false, delete: false },
        events: {
          exportReports: false,
        },
      },
      permissionManagement: {
        access: false,
        actions: { read: false, create: false, update: false, delete: false },
      },
    },
  },
};

// คลาสสำหรับจัดการสิทธิ์การเข้าถึง
export class PermissionManager {
  private static instance: PermissionManager;
  private userPermissions: UserPermissions | null = null;

  private constructor() {}

  // ใช้ Singleton pattern
  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  // ตั้งค่าสิทธิ์ตาม role ของผู้ใช้
  public setUserRole(role: string): void {
    if (rolePermissions[role]) {
      this.userPermissions = rolePermissions[role];
    } else {
      // หากไม่พบ role ให้ใช้ Member เป็นค่าเริ่มต้น
      this.userPermissions = rolePermissions["Member"];
      console.warn(
        `Role "${role}" not found, defaulting to "Member" permissions`
      );
    }
  }

  // ตรวจสอบว่ามีสิทธิ์เข้าถึงหน้านั้นหรือไม่
  public canAccess(page: PageType): boolean {
    if (!this.userPermissions) return false;
    return !!this.userPermissions.pages[page]?.access;
  }

  // ตรวจสอบว่ามีสิทธิ์ทำแอคชันในหน้านั้นหรือไม่
  public canPerformAction(page: PageType, action: ActionType): boolean {
    if (!this.userPermissions) return false;

    const pagePermission = this.userPermissions.pages[page];
    if (!pagePermission || !pagePermission.access) return false;

    return !!pagePermission.actions[action];
  }

  // ตรวจสอบสิทธิ์สำหรับอีเวนต์พิเศษ
  public canPerformEvent(page: PageType, event: string): boolean {
    if (!this.userPermissions) return false;

    const pagePermission = this.userPermissions.pages[page];
    if (!pagePermission || !pagePermission.access) return false;

    return !!pagePermission.events?.[event];
  }

  // รับสิทธิ์ทั้งหมดของผู้ใช้
  public getUserPermissions(): UserPermissions | null {
    return this.userPermissions;
  }

  // เพิ่มสิทธิ์พิเศษสำหรับหน้าหรืออีเวนต์เฉพาะ (สำหรับใช้ในกรณีพิเศษ)
  public addCustomPermission(
    page: PageType,
    event: string,
    allowed: boolean
  ): void {
    if (!this.userPermissions) return;

    const pagePermission = this.userPermissions.pages[page];
    if (!pagePermission) return;

    if (!pagePermission.events) {
      pagePermission.events = {};
    }

    pagePermission.events[event] = allowed;
  }
}

// สร้าง hook สำหรับใช้งานใน React component
export function usePermission() {
  const permissionManager = PermissionManager.getInstance();

  return {
    canAccess: (page: PageType) => permissionManager.canAccess(page),
    canPerformAction: (page: PageType, action: ActionType) =>
      permissionManager.canPerformAction(page, action),
    canPerformEvent: (page: PageType, event: string) =>
      permissionManager.canPerformEvent(page, event),
    getUserPermissions: () => permissionManager.getUserPermissions(),
    setUserRole: (role: string) => permissionManager.setUserRole(role),
    addCustomPermission: (page: PageType, event: string, allowed: boolean) =>
      permissionManager.addCustomPermission(page, event, allowed),
  };
}

// Utility type for withPermission HOC (we'll define the actual implementation in a .tsx file)
export type WithPermissionProps = {
  requiredPage: PageType;
};

// ตัวอย่างการใช้งาน:
// 1. ตั้งค่าสิทธิ์เมื่อล็อกอิน (ใน authSlice หรือคล้ายกัน)
// useEffect(() => {
//   if (user) {
//     const permissionManager = PermissionManager.getInstance();
//     permissionManager.setUserRole(user.role);
//   }
// }, [user]);
//
// 2. ตรวจสอบสิทธิ์ในคอมโพเนนต์
// const { canPerformAction, canPerformEvent } = usePermission();
//
// // ตรวจสอบว่ามีสิทธิ์สร้าง workspace หรือไม่
// if (canPerformAction('folderWorkspace', 'create')) {
//   // แสดงปุ่มสร้าง workspace
// }
//
// // ตรวจสอบว่าสามารถสร้าง workspace แบบ department ได้หรือไม่
// if (canPerformEvent('folderWorkspace', 'createWorkspaceAllTypes')) {
//   // แสดงตัวเลือก department ในการสร้าง workspace
// }
