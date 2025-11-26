/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Tag } from "antd";
import { useSnackbar } from "notistack";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import TableComponent from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const { Title, Text } = Typography;

// กำหนด interface สำหรับข้อมูลบทบาท
interface RoleData {
  key: string;
  name: string;
  description: string;
  usersCount: number;
}

// ข้อมูลจำลองสำหรับบทบาท
const mockRoles: RoleData[] = [
  {
    key: "1",
    name: "Super Admin",
    description: "มีสิทธิ์ทั้งหมดในระบบ",
    usersCount: 3,
  },
  {
    key: "2",
    name: "Admin",
    description:
      "สามารถจัดการผู้ใช้งานและข้อมูลส่วนใหญ่ แต่ไม่สามารถจัดการสิทธิ์ได้",
    usersCount: 5,
  },
  {
    key: "3",
    name: "Designer",
    description: "สามารถออกแบบฟอร์มและจัดการพื้นที่ทำงาน",
    usersCount: 15,
  },
  {
    key: "4",
    name: "Member",
    description: "สามารถดูแดชบอร์ดและรายงานเท่านั้น",
    usersCount: 42,
  },
];

const PermissionManagementPage: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);

  // โหลดข้อมูลบทบาทเมื่อเข้าหน้า
  useEffect(() => {
    setLoading(true);

    // จำลองการโหลดข้อมูลจาก API
    const timerId = setTimeout(() => {
      setRoleData(mockRoles);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timerId);
  }, []);

  // จัดการการแก้ไขสิทธิ์ของบทบาท
  const handleEditRole = (id: string, roleName: string) => {
    try {
      // หาข้อมูลบทบาทที่ต้องการแก้ไข
      const role = roleData.find((role) => role.key === id);
      if (!role) {
        enqueueSnackbar("ไม่พบข้อมูลบทบาท", {
          variant: "error",
          autoHideDuration: 4000,
        });
        return;
      }

     

      // เก็บข้อมูลบทบาทที่เลือก
      setSelectedRole(role);

      // นำทางไปยังหน้าแก้ไขบทบาท
      router.push(
        `/backend/permissions/roles/${id}?name=${encodeURIComponent(roleName)}`
      );
    } catch (error) {
      enqueueSnackbar(`เกิดข้อผิดพลาดในการแก้ไขบทบาท: ${error}`, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
  };

  // ฟังก์ชันเพิ่มบทบาทใหม่ (ยังไม่ได้พัฒนา)
  const handleAddRole = () => {
    enqueueSnackbar("ฟังก์ชันนี้ยังไม่พร้อมใช้งาน กำลังพัฒนา", {
      variant: "info",
      autoHideDuration: 4000,
    });
  };

  // คอลัมน์สำหรับตารางบทบาท
  const roleColumns = [
    {
      title: "ชื่อบทบาท",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "คำอธิบาย",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "จำนวนผู้ใช้",
      dataIndex: "usersCount",
      key: "usersCount",
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "จัดการ",
      key: "actions",
      render: (_: unknown, record: RoleData) => (
        <Button
          type="text"
          className="border hover:border-blue-500 rounded-xl p-2"
          onClick={() => handleEditRole(record.key, record.name)}
        >
          <EditOutlined size={18} />
        </Button>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.back(),
    },
    {
      label: "จัดการบทบาท",
    },
  ];

  return (
    <>
      <h1 className="text-xl font-extrabold text-theme mb-3">
        จัดการบทบาท
      </h1>

      <Breadcrumb items={breadcrumbItems} />

      {/* {user?.role !== "Super Admin" ? (
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
      ) : ( */}
        <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-theme mt-6">
          <div className="mb-3 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              <p>รายการบทบาท</p>
              <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">{`${roleData.length} รายการ`}</p>
            </div>
            <button
              className="btn btn-theme"
              onClick={handleAddRole}
            >
              <PlusOutlined />
              เพิ่มบทบาทใหม่
            </button>
          </div>
          <TableComponent
            columns={roleColumns}
            dataSource={roleData}
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        </section>
      {/* )} */}
    </>
  );
};

export default PermissionManagementPage;
