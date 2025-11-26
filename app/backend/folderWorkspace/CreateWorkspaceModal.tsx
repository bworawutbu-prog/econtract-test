"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
} from "antd";
import {
  Plus,
} from "lucide-react";
import ModalComponent from "../../../components/modal/modal";
import { WorkspaceDataType, AccessRights } from "@/store/mockData/mockWorkSpace";
import { useSnackbar } from "notistack";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { AuthState } from "@/store/slices/authSlice";
// import AccessRight from "@/components/mappingComponents/AccessRight";
import AccessRight from "@/components/mappingComponents/FormComponents/AccessRight";
import { WorkspaceCreateType, WorkspaceResponseType } from "@/store/types/workSpace";
import { AccessUser } from "@/store/types/user";

// Define interface for users in workspace
interface WorkspaceUser {
  name: string;
  email: string;
  role: string;
  accountID: string;
}

interface CreateWorkspaceModalProps {
  checkWorkspaceNameExists: (name: string) => boolean;
  onCreateWorkspace: (payload: WorkspaceCreateType) => Promise<boolean>;
  group_id: string;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  checkWorkspaceNameExists,
  onCreateWorkspace,
  group_id,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAppSelector(
    (state: RootState) => state.auth as unknown as AuthState
  );

  // state สำหรับสร้าง Workspace
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [accessType, setAccessType] = useState<
    "public" | "private" | "department"
  >("public");
  
  // State for selected users (for private access)
  const [selectedUsers, setSelectedUsers] = useState<WorkspaceUser[]>([]);
  
  // State for selected departments (for department access)
  const [selectedDepartments, setSelectedDepartments] = useState<{
    [company: string]: string[];
  }>({});

  const [nameError, setNameError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // รีเซ็ต data ที่แสดงถ้า access type เปลี่ยน
  useEffect(() => {
    // Reset will be handled by AccessRight component
  }, [accessType]);

  const handleWorkspaceNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newName = e.target.value;
    setNewWorkspaceName(newName);

    // เคลียร์ error ถ้าชื่อว่าง
    if (!newName.trim()) {
      setNameError(null);
      return;
    }

    // เช็คว่าชื่อมีอยู่ในระบบแล้วหรือยัง
    if (checkWorkspaceNameExists(newName)) {
      setNameError("ชื่อ Workspace นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น");
    } else {
      setNameError(null);
    }
  };

  // เพิ่ม function สำหรับตรวจสอบความถูกต้องของฟอร์มสร้าง Workspace
  const checkFormValidity = () => {
    // ต้องมีชื่อ Workspace และไม่มี error
    if (!newWorkspaceName.trim() || !!nameError) {
      return false;
    }

    // ถ้าเป็น accessType private ต้องเลือกผู้ใช้งานอย่างน้อย 1 คน
    if (accessType === "private" && selectedUsers.length === 0) {
      return false;
    }

    // ถ้าเป็น accessType department ต้องเลือกแผนกอย่างน้อย 1 แผนก
    if (accessType === "department") {
      // ตรวจสอบว่ามีการเลือกแผนกอย่างน้อย 1 แผนกหรือไม่
      const hasSelectedDepartments = Object.values(selectedDepartments).some(
        (depts) => depts && depts.length > 0
      );
      
      if (!hasSelectedDepartments) {
        return false;
      }
    }

    // ผ่านการตรวจสอบทุกเงื่อนไข
    return true;
  };

  // const handleCreateWorkspace = async (): Promise<boolean> => {
  //   setActionLoading("create");
  //   try {
  //     if (accessType === "department") {
  //       // เช็คว่ามีแผนกอย่างน้อย 1 แผนกหรือยัง
  //       const selectedDeptCount = Object.values(selectedDepartments).reduce(
  //         (count, depts) => count + (depts?.length || 0),
  //         0
  //       );

  //       if (selectedDeptCount === 0) {
  //         enqueueSnackbar("กรุณาเลือกแผนกอย่างน้อย 1 แผนก", {
  //           variant: "error",
  //         });
  //         return false;
  //       }
  //     }

  //     // สร้าง payload สำหรับ Workspace ด้วยโครงสร้างแบบเดียวกันทั้งหมด
  //     let accessRights: AccessRights;
  //     if (accessType === "public") {
  //       accessRights = {
  //         type: "public",
  //         users: "all",
  //         departments: "all",
  //       };
  //     } else if (accessType === "private") {
  //       accessRights = {
  //         type: "private",
  //         users:
  //           selectedUsers.length > 0 ? selectedUsers : "all",
  //         departments: "all",
  //       };
  //     } else {
  //       // department
  //       accessRights = {
  //         type: "department",
  //         users: "all",
  //         departments:
  //           Object.keys(selectedDepartments).length > 0
  //             ? selectedDepartments
  //             : "all",
  //       };
  //     }

  //     // สร้าง payload สำหรับ Workspace สำหรับการบันทึก/แสดงผล
  //     const newWorkspace = {
  //       spaceName: newWorkspaceName,
  //       accessType: accessType,
  //       accessRights: accessRights,
  //     };

      

  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // เพิ่ม Workspace ใหม่เข้าไปใน state
  //     const now = new Date().toISOString();
  //     const newWorkspaceData: WorkspaceResponseType = {
  //       _id: `ws-${Date.now()}`,
  //       name: newWorkspaceName,
  //       created_by: user?.username || "Undefined",
  //       updated_by: user?.username || "Undefined",
  //       created_at: now,
  //       updated_at: now,
  //       form_total: "0",
  //     };

  //     // ส่งข้อมูล workspace ใหม่ไปให้ parent component
  //     onCreateWorkspace(newWorkspaceData);

  //     // รีเซ็ตค่า form values
  //     setNewWorkspaceName("");
  //     setAccessType("public");
  //     setSelectedUsers([]);
  //     setSelectedDepartments({});
  //     return true;
  //   } catch (error) {
      
  //     enqueueSnackbar("เกิดข้อผิดพลาดในการสร้าง Workspace", {
  //       variant: "error",
  //     });
  //     return false;
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // Handle Access type change
  
  const handleCreateWorkspace = async () : Promise<boolean> => {
    setActionLoading("create");
    const payload: WorkspaceCreateType = {
      name: newWorkspaceName,
      group_id: group_id || "",
      permission: (selectedUsers ?? []).map((user, index) => ({
        index: index,
        email: user.email ?? "",
        account_id: user.accountID ?? ""
      }))
    };
    const response = await onCreateWorkspace(payload);
    if (response) {
      setNewWorkspaceName("");
      setAccessType("public");
      setSelectedUsers([]);
      setSelectedDepartments({});
    }
    return response;
  };
  const handleAccessTypeChange = (type: "public" | "private" | "department") => {
    setAccessType(type);
  };

  // Handle selected users change from AccessRight component
  const handleSelectedUsersChange = (users: AccessUser[] | "all") => {
    if (users === "all") {
      setSelectedUsers([]);
    } else {
      // Ensure role is always present by providing a default if missing
      const usersWithRoles = (users ?? []).map(user => ({
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "Member",
        accountID: user.id ?? ""
      }));
      setSelectedUsers(usersWithRoles);
    }
  };

  // Handle selected departments change
  const handleSelectedDepartmentsChange = (departments: { [company: string]: string[] } | "all") => {
    if (departments === "all") {
      setSelectedDepartments({});
    } else {
      setSelectedDepartments(departments);
    }
  };

  return (
    <ModalComponent
      titleName="สร้าง Workspace"
      btnName={
        <div className="flex items-center gap-2">
          <Plus size={16} />
          สร้าง Workspace
        </div>
      }
      onConfirm={handleCreateWorkspace}
      btnConfirm="บันทึก"
      isLoading={actionLoading === "create"}
      isDisabled={!checkFormValidity()}
    >
      <div className="mb-4">
        <label className="mb-2 block">ชื่อ Workspace</label>
        <Input
          placeholder="ระบุ"
          value={newWorkspaceName}
          onChange={handleWorkspaceNameChange}
          status={nameError ? "error" : ""}
        />
        {nameError && (
          <div className="text-red-500 text-sm mt-1">{nameError}</div>
        )}
      </div>
      
      {/* Use the centralized AccessRight component */}
      <AccessRight 
        accessType={accessType}
        users={(selectedUsers ?? []).map(user => ({
          id: user.accountID ?? null,
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role ?? "",
          accountID: user.accountID ?? ""
        }))}
        departments={selectedDepartments}
        onAccessTypeChange={handleAccessTypeChange}
        onUsersChange={handleSelectedUsersChange}
        onDepartmentsChange={handleSelectedDepartmentsChange}
        showTypeSelector={true}
        title="สิทธิ์การเข้าถึง"
        showAccessTypeSelector={false}
        addUserText="เพิ่มรายชื่อผู้มีสิทธิ์เป็น Designer"
        AddUserOutside={false}
      />
    </ModalComponent>
  );
};

export default CreateWorkspaceModal; 