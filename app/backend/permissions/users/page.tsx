"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Select,
  Input,
  Tooltip,
} from "antd";
import { useSnackbar } from "notistack";
import { PlusOutlined, EditOutlined, DeleteOutlined, } from "@ant-design/icons";
import { ChevronDown } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { roleData } from "@/store/mockData/mockRole";
import TableComponent from "@/components/ui/table";
import { userData } from "@/store/mockData/mockUsers";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import router from "next/router";
import SearchInput from "@/components/ui/searchInput";

const { Title, Text } = Typography;
const { Option } = Select;

// ประเภทข้อมูลสำหรับใช้ในตาราง
interface UserRecord {
  key: React.Key;
  username: string;
  name: string;
  email: string;
  role: string;
}

const UserManagementPage: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [searchText, setSearchText] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  // คอลัมน์สำหรับตาราง User Management
  const userColumns = [
    {
      title: "ชื่อผู้ใช้",
      dataIndex: "username",
      key: "username",
      filteredValue: searchText ? [searchText] : null,
      // แก้ไขประเภทข้อมูลการ filter
      onFilter: (value: unknown, record: UserRecord) => {
        const searchValue = String(value).toLowerCase();
        return (
          record.username.toLowerCase().includes(searchValue) ||
          record.name.toLowerCase().includes(searchValue) ||
          record.email.toLowerCase().includes(searchValue)
        );
      },
    },
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "อีเมล",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "บทบาท",
      dataIndex: "role",
      key: "role",
      render: (text: string, record: UserRecord) => (
        <Select
          suffixIcon={<ChevronDown size={20} />}
          defaultValue={text}
          style={{ width: 120 }}
          onChange={(value) => {
            enqueueSnackbar(
              `เปลี่ยนบทบาทของ ${record.username} เป็น ${value} สำเร็จ`,
              {
                variant: "success",
                autoHideDuration: 3000,
              }
            );
          }}
        >
          {roleData.map((role) => (
            <Option key={role.key} value={role.label}>
              {role.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "action",
      render: (_: unknown, record: UserRecord) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() =>
              enqueueSnackbar(`แก้ไขผู้ใช้ ${record.username} จะถูกพัฒนาในอนาคต`, {
                variant: "info",
                autoHideDuration: 4000,
              })
            }
          >
            แก้ไข
          </Button>
          {record.username !== user?.username && (
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() =>
                enqueueSnackbar(`การลบผู้ใช้ ${record.username} จะถูกพัฒนาในอนาคต`, {
                  variant: "info",
                  autoHideDuration: 4000,
                })
              }
            >
              ลบ
            </Button>
          )}
        </div>
      ),
    },
  ];

  // จัดเตรียมข้อมูลผู้ใช้จาก mockUsers.ts
  const mockUsers: UserRecord[] = userData.map((user) => ({
    key: user.key,
    username: user.email.split("@")[0],
    name: user.name,
    email: user.email,
    role: user.role,
  }));

  const breadcrumbItems = [
    {
      label: "หน้าหลัก",
      onClick: () => router.back(),
    },
    {
      label: "จัดการผู้ใช้งาน",
    },
  ];

  return (
    <>
      <h1 className="text-xl font-extrabold text-theme mb-3">
        จัดการผู้ใช้งาน
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
        <section className="bg-[#FAFAFA] rounded-xl p-4 shadow-[0px_-0px_24px_#e2e9f1] mt-6">
          <div className="mb-3 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center gap-2">
              <p>ผู้ใช้งานทั้งหมด</p>
              <p className="text-[#FDB131] px-2 bg-white rounded-full border font-medium text-sm">{`${mockUsers.length} รายการ`}</p>
            </div>
            <div className="flex space-x-2">
              <SearchInput
                placeholder="ค้นหาผู้ใช้งาน"
                className="w-72"
                value={searchText}
                onChange={setSearchText}
                debounceMs={700}
              />
              <button
                className="btn btn-theme"
                onClick={() =>
                  enqueueSnackbar("การเพิ่มผู้ใช้ใหม่จะถูกพัฒนาในอนาคต", {
                    variant: "info",
                    autoHideDuration: 4000,
                  })
                }
              >
                <PlusOutlined />
                เพิ่มผู้ใช้
              </button>
            </div>
          </div>

          <TableComponent columns={userColumns} dataSource={mockUsers} />
        </section>
      )}
    </>
  );
};

export default UserManagementPage;
