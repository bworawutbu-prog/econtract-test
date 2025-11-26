/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Card, Switch, Typography } from "antd";
import { useSnackbar } from "notistack";
import { SaveOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import TableComponent from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";

// Import types from permissionManager
import type {
  PageType,
  ActionType,
  UserPermissions,
  PagePermission,
} from "@/store/backendStore/permissionManager";

const { Title, Text } = Typography;

// แก้ไข interface สำหรับ record ในตาราง
interface PermissionRecord {
  key: string;
  page: PageType;
  [key: string]: boolean | string | PageType;
}

interface RoleEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

const RoleEditPage: React.FC<RoleEditPageProps> = ({ params }) => {
  const unwrappedParams = React.use(params);
  const roleId = unwrappedParams.id;
  const searchParams = useSearchParams();
  const roleName = searchParams.get("name") || "ไม่ระบุชื่อบทบาท";

  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, UserPermissions>
  >({});
  const [loading, setLoading] = useState(true);

  // ข้อมูลจำลองสำหรับหน้านี้ - ย้ายออกจาก render component ไปไว้ข้างนอกเพื่อป้องกัน re-create ทุกครั้งที่ render
  const allPages: PageType[] = [
    "dashboard",
    "folderWorkspace",
    "formBuilder",
    "userManagement",
    "companyManagement",
    "reportManagement",
    "permissionManagement",
  ];

  const allActions: ActionType[] = ["read", "create", "update", "delete"];

  const pageDisplayNames: Record<PageType, string> = {
    dashboard: "แดชบอร์ด",
    folderWorkspace: "พื้นที่ทำงาน",
    formBuilder: "สร้างฟอร์ม",
    userManagement: "จัดการผู้ใช้งาน",
    companyManagement: "จัดการบริษัท",
    reportManagement: "รายงาน",
    permissionManagement: "จัดการสิทธิ์การใช้งาน",
  };

  const actionDisplayNames: Record<ActionType, string> = {
    read: "ดู",
    create: "สร้าง",
    update: "แก้ไข",
    delete: "ลบ",
  };

  // บันทึก log เพียงครั้งเดียวเมื่อ component mount หรือเมื่อ roleId เปลี่ยน
  useEffect(() => {
    
  }, [roleId, roleName]);

  // โหลดข้อมูลบทบาทจาก API (จำลอง)
  useEffect(() => {
    // จำลองการเรียกข้อมูลจาก API โดยส่ง ID เพื่อดึงข้อมูล
    setLoading(true);

    const timerId = setTimeout(() => {
      // ในระบบจริงจะส่ง roleId ไปเรียกข้อมูลจาก API
      // แสดงข้อความ log เพียงครั้งเดียว ไม่ต้องแสดงซ้ำทุกครั้งที่ render

      // ตัวอย่างข้อมูล permissions แต่ละบทบาท
      const mockPermission: UserPermissions = {
        role: roleName,
        pages: {} as Record<PageType, PagePermission>,
      };

      // กำหนดค่าตามบทบาท
      allPages.forEach((page) => {
        // ถ้าเป็น Super Admin ให้สามารถเข้าถึงทุกหน้าและทุกแอคชั่น
        if (roleName === "Super Admin") {
          mockPermission.pages[page] = {
            access: true,
            actions: {
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          };
        }
        // ถ้าเป็น Admin
        else if (roleName === "Admin") {
          const isPermissionManagement = page === "permissionManagement";
          mockPermission.pages[page] = {
            access: !isPermissionManagement,
            actions: {
              read: !isPermissionManagement,
              create: !isPermissionManagement,
              update: !isPermissionManagement,
              delete: false, // Admin ไม่สามารถลบข้อมูลได้
            },
          };
        }
        // Designer
        else if (roleName === "Designer") {
          const canAccess =
            page === "dashboard" ||
            page === "formBuilder" ||
            page === "folderWorkspace";
          mockPermission.pages[page] = {
            access: canAccess,
            actions: {
              read: canAccess,
              create: page === "formBuilder" || page === "folderWorkspace",
              update: page === "formBuilder" || page === "folderWorkspace",
              delete: false,
            },
          };
        }
        // Member
        else {
          const canAccess = page === "dashboard" || page === "reportManagement";
          mockPermission.pages[page] = {
            access: canAccess,
            actions: {
              read: canAccess,
              create: false,
              update: false,
              delete: false,
            },
          };
        }
      });

      setRolePermissions({ [roleName]: mockPermission });
      setLoading(false);
    }, 1000);

    // Add cleanup function to clear the timeout
    return () => clearTimeout(timerId);

    // ลบ allPages จาก dependency array เพื่อป้องกันการเรียก useEffect ซ้ำ
  }, [roleId, roleName]);

  // คอลัมน์สำหรับตาราง Permission Management
  const permissionColumns = [
    {
      title: "หน้า",
      dataIndex: "page",
      key: "page",
      render: (text: PageType) => pageDisplayNames[text] || text,
    },
    ...allActions?.map((action) => ({
      title: actionDisplayNames[action] || action,
      dataIndex: action,
      key: action,
      render: (_: boolean, record: PermissionRecord) => {
        // ค้นหาข้อมูลสิทธิ์สำหรับบทบาท
        const rolePermission = rolePermissions[roleName];

        if (!rolePermission || !rolePermission.pages) {
          return <Switch disabled size="small" checked={false} />;
        }

        const pageName = record.page;
        const pagePermission = rolePermission.pages[pageName];

        if (!pagePermission) {
          return <Switch disabled size="small" checked={false} />;
        }

        const isChecked = pagePermission.actions[action] || false;
        // ไม่ให้แก้ไขสิทธิ์ของ Super Admin ในหน้า permissionManagement
        const isDisabled =
          roleName === "Super Admin" && pageName === "permissionManagement";

        return (
          <Switch
            size="small"
            checked={isChecked}
            disabled={isDisabled}
            onChange={(checked) => {
              // อัปเดตข้อมูลสิทธิ์
              const updatedPermissions = { ...rolePermissions };
              const updatedPagePermission =
                updatedPermissions[roleName].pages[pageName];
              if (updatedPagePermission) {
                updatedPagePermission.actions[action] = checked;
                setRolePermissions(updatedPermissions);
              }
            }}
          />
        );
      },
    })),
    {
      title: "การเข้าถึง",
      dataIndex: "access",
      key: "access",
      render: (_: boolean, record: PermissionRecord) => {
        // ค้นหาข้อมูลสิทธิ์สำหรับบทบาท
        const rolePermission = rolePermissions[roleName];

        if (!rolePermission || !rolePermission.pages) {
          return <Switch disabled size="small" checked={false} />;
        }

        const pageName = record.page;
        const pagePermission = rolePermission.pages[pageName];

        if (!pagePermission) {
          return <Switch disabled size="small" checked={false} />;
        }

        const isChecked = pagePermission.access || false;
        // ไม่ให้แก้ไขสิทธิ์ของ Super Admin ในหน้า permissionManagement
        const isDisabled =
          roleName === "Super Admin" && pageName === "permissionManagement";

        return (
          <Switch
            size="small"
            checked={isChecked}
            disabled={isDisabled}
            onChange={(checked) => {
              // อัปเดตข้อมูลสิทธิ์
              const updatedPermissions = { ...rolePermissions };
              const updatedPagePermission =
                updatedPermissions[roleName].pages[pageName];

              if (updatedPagePermission) {
                updatedPagePermission.access = checked;

                // ถ้ายกเลิกการเข้าถึง ให้ยกเลิกทุกแอคชั่นด้วย
                if (!checked) {
                  allActions.forEach((action) => {
                    updatedPagePermission.actions[action] = false;
                  });
                }

                setRolePermissions(updatedPermissions);
              }
            }}
          />
        );
      },
    },
  ];

  // ข้อมูลสำหรับตาราง Permission Management
  const permissionTableData = allPages?.map((page) => ({
    key: page,
    page,
    ...allActions.reduce<Record<string, boolean>>((acc, action) => {
      if (
        rolePermissions[roleName]?.pages[page]?.actions[action] !== undefined
      ) {
        acc[action] =
          rolePermissions[roleName]?.pages[page]?.actions[action] || false;
      } else {
        acc[action] = false;
      }
      return acc;
    }, {}),
    access: rolePermissions[roleName]?.pages[page]?.access || false,
  }));

  const handleSave = () => {
    // ในระบบจริงให้ส่งข้อมูลไปยัง API พร้อมกับ ID ของบทบาท
    enqueueSnackbar(
      `บันทึกการเปลี่ยนแปลงบทบาท ${roleName} (ID: ${roleId}) สำเร็จ`,
      {
        variant: "success",
        autoHideDuration: 3000,
      }
    );
  };

  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.push("/backend/permissions/roles"),
    },
    {
      label: "จัดการบทบาท",
      onClick: () => router.back(),
    },
    {
      label: "แก้ไขสิทธิ์การเข้าถึง",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-theme mb-3">
        แก้ไขสิทธิ์การเข้าถึง
      </h1>

      <Breadcrumb items={breadcrumbItems} />

      {user?.role !== "Super Admin" ? (
        <Card className="mt-6 shadow-theme">
          <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
            <div className="text-center">
              <Title level={4} type="danger">
                คุณไม่มีสิทธิ์เข้าถึงหน้านี้
              </Title>
              <Text>หน้านี้สงวนไว้สำหรับผู้ดูแลระบบระดับสูงเท่านั้น</Text>
            </div>
          </div>
        </Card>
      ) : (
        <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-theme mt-6">
          <div className="mb-3 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              <p>รายการสิทธิ์การเข้าถึง</p>
              <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">{`${permissionTableData.length} รายการ`}</p>
            </div>
            <button className="btn btn-theme" onClick={handleSave}>
              <SaveOutlined />
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>

          <TableComponent
            columns={permissionColumns}
            dataSource={permissionTableData}
            pagination={{ pageSize: 20 }}
            loading={loading}
          />
        </section>
      )}
    </div>
  );
};

export default RoleEditPage;
