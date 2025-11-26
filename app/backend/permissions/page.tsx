/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Tag,
  Dropdown,
} from "antd";
import { useSnackbar } from "notistack";
import {
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { EllipsisVertical } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import TableComponent from "@/components/ui/table";
import { useRouter } from "next/navigation";
import type { MenuProps } from "antd";
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
    description: "สามารถจัดการผู้ใช้งานและข้อมูลส่วนใหญ่ แต่ไม่สามารถจัดการสิทธิ์ได้",
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
  }
];

const PermissionManagementPage: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [roleData, setRoleData] = React.useState<RoleData[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ข้อมูลสำหรับ Breadcrumb
  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.push('/backend'),
    },
    {
      label: "การจัดการสิทธิ์",
    },
  ];

  // โหลดข้อมูลบทบาทเมื่อเข้าหน้า
  React.useEffect(() => {
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
      const role = roleData.find(role => role.key === id);
      if (!role) {
        enqueueSnackbar("ไม่พบข้อมูลบทบาท", {
          variant: "error",
          autoHideDuration: 4000,
        });
        return;
      }
      
    
      
      // นำทางไปยังหน้าแก้ไขบทบาท
      router.push(`/backend/permissions/roles/${id}?name=${encodeURIComponent(roleName)}`);
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

  // จัดการผู้ใช้งาน
  const handleManageUsers = () => {
    router.push('/backend/permissions/users');
  };

  // สร้าง Dropdown items
  const getDropdownItems = (record: RoleData): MenuProps["items"] => [
    {
      key: "1",
      label: "แก้ไขสิทธิ์",
      icon: <EditOutlined />,
      onClick: () => handleEditRole(record.key, record.name),
    },
  ];

  // คอลัมน์สำหรับตารางบทบาท
  const roleColumns = [
    {
      title: "บทบาท",
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
        <Dropdown
          menu={{ items: getDropdownItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            className="border hover:border-blue-500 rounded-xl p-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <EllipsisVertical />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={2}>จัดการบทบาทและสิทธิ์</Title>
        
        <div className="space-x-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRole}
          >
            เพิ่มบทบาทใหม่
          </Button>
          <Button onClick={handleManageUsers}>
            จัดการผู้ใช้งาน
          </Button>
        </div>
      </div>
      
      <Breadcrumb
        items={breadcrumbItems?.map((item) => ({
          ...item,
          onClick: () => {
            if (item.onClick) item.onClick();
          },
        }))}
      />
      
      {/* {user?.role !== "Super Admin" ? (
        <Card>
          <div className="text-center py-8">
            <Title level={4} type="danger">
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            </Title>
            <Text>หน้านี้สงวนไว้สำหรับผู้ดูแลระบบระดับสูงเท่านั้น</Text>
          </div>
        </Card>
      ) : ( */}
        <Card title="บทบาททั้งหมด" loading={loading}>
          <div className="mb-4">
            <Text>
              จัดการบทบาทต่างๆ ในระบบและกำหนดสิทธิ์การเข้าถึงสำหรับแต่ละบทบาท 
              กดที่เมนูจัดการเพื่อกำหนดสิทธิ์โดยละเอียด
            </Text>
          </div>
          
          <TableComponent
            columns={roleColumns}
            dataSource={roleData}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      {/* )} */}
    </div>
  );
};

export default PermissionManagementPage; 