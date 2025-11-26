/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Radio,
  Select,
  Typography,
  Button,
  Dropdown,
} from "antd";
import {
  Mail,
  Building2,
  UserCircle2,
  ChevronDown,
  X,
  ChevronUp,
  Trash,
} from "lucide-react";
import ModalComponent from "../../../components/modal/modal";
import { userData } from "@/store/mockData/mockUsers";
import { roleData } from "@/store/mockData/mockRole";
import { mockCompany } from "@/store/mockData/mockCompany";
import { AccessRights } from "@/store/mockData/mockWorkSpace";
import { useSnackbar } from "notistack";
import AccessRight from "@/components/mappingComponents/FormComponents/AccessRight";
import { AccessUser } from "@/store/types/user";
import { Workspace, WorkspaceResponseType } from "@/store/types/workSpace";
import { getWorkspaceById, updateWorkspace } from "@/store/backendStore/workspaceAPI";
import { useAppDispatch } from "@/store";

interface AccessRightsModalProps {
  open: boolean;
  onClose: () => void;
  // workspaceData?: {
  //   workspaceId: React.Key;
  //   workspaceName: string;
  //   accessType: string;
  //   accessRights: AccessRights;
  // } | null;
  workspaceData?: WorkspaceResponseType | null;
  group_id: string;
  onUpdateAccessRights: (workspaceId: React.Key, accessRights: AccessRights) => void;
}

const AccessRightsModal: React.FC<AccessRightsModalProps> = ({
  open,
  onClose,
  workspaceData,
  onUpdateAccessRights,
  group_id,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  // State สำหรับ modal สิทธิ์การเข้าถึง
  // const [currentWorkspaceAccess, setCurrentWorkspaceAccess] = useState<string>("public");
  // const [editableAccessRights, setEditableAccessRights] = useState<AccessRights | null>(null);
  const [isAccessRightsModified, setIsAccessRightsModified] = useState(false);

  // State เพื่อจัดการการแสดงแผนกเพิ่มเติม
  // const [expandedCompanies, setExpandedCompanies] = useState<{
  //   [key: string]: boolean;
  // }>({});

  // Store selected departments for department selector
  // const [selectorSelectedDepts, setSelectorSelectedDepts] = useState<{
  //   [company: string]: string[];
  // }>({});

  // Add state for temporary user selection in access rights modal
  const [tempAccessRightUser, setTempAccessRightUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<AccessUser[]>([]);

  // กำหนดข้อมูลบริษัทและหน่วยงาน
  // const companyDepartments = mockCompany;

  const fetchWorkspaceData = async () => {
    const response = await dispatch((getWorkspaceById(workspaceData?._id || "")) as any);
    if (response.payload && response.payload.status) {
      setSelectedUsers(response.payload.data.permission);
    }
  };

  // Reset state เมื่อมีการเปิด modal ใหม่
  useEffect(() => {
    if (open && workspaceData) {
      // setCurrentWorkspaceAccess(workspaceData.accessType);
      // setEditableAccessRights(workspaceData.accessRights);
      setIsAccessRightsModified(false);
      // setExpandedCompanies({});
      // setSelectorSelectedDepts({});
      setTempAccessRightUser(null);
      fetchWorkspaceData();
    }
  }, [open, workspaceData]);

  async function UpdateWorkspaceAccessRights() : Promise<boolean> {
    const payload: Workspace = {
      _id: workspaceData?._id ?? "",
      new_name: workspaceData?.name ?? "",
      old_name: workspaceData?.name ?? "",
      group_id: group_id ?? "",
      permission: (selectedUsers ?? []).map((user, index) => ({
        index,
        account_id: user.id ?? "",
        email: user.email ?? "",
      })),
      // created_by: workspaceData?.created_by,
      // updated_by: workspaceData?.updated_by,
    }
    const response = await dispatch((updateWorkspace(payload)) as any);
    if (response.payload && response.payload.status) {
      return true;
    } else {
      return false;
    }
  }

  const handleSelectedUsersChange = (users: AccessUser[] | "all") => {
    if (users === "all") {
      setSelectedUsers([]);
    } else {
      // Ensure role is always present by providing a default if missing
      const usersWithRoles = users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role || "Member",
        id: user.id ?? ""
      }));
      setSelectedUsers(usersWithRoles);
    }
  };

  // ฟังก์ชันสำหรับการลบผู้ใช้งานที่มีสิทธิ์การใช้งาน สำหรับ case private
  // const handleRemoveAccessRightUser = (index: number) => {
  //   if (editableAccessRights && Array.isArray(editableAccessRights.users)) {
  //     const newUsers = [...editableAccessRights.users];
  //     newUsers.splice(index, 1);
  //     setEditableAccessRights({
  //       ...editableAccessRights,
  //       users: newUsers.length ? newUsers : "all",
  //     });
  //     setIsAccessRightsModified(true);
  //   }
  // };

  // const handleRemoveAccessRightDepartment = (company: string, dept: string) => {
  //   if (editableAccessRights && editableAccessRights.departments !== "all") {
  //     const newDepartments = { ...editableAccessRights.departments };
  //     const deptIndex = newDepartments[company].indexOf(dept);

  //     if (deptIndex !== -1) {
  //       newDepartments[company] = [
  //         ...newDepartments[company].slice(0, deptIndex),
  //         ...newDepartments[company].slice(deptIndex + 1),
  //       ];

  //       // ถ้าไม่มี departments ที่มีอยู่สำหรับ company นี้ ให้ลบ company นี้
  //       if (newDepartments[company].length === 0) {
  //         delete newDepartments[company];
  //       }

  //       setEditableAccessRights({
  //         ...editableAccessRights,
  //         departments: Object.keys(newDepartments).length
  //           ? newDepartments
  //           : "all",
  //       });
  //       setIsAccessRightsModified(true);
  //     }
  //   }
  // };

  // เพิ่มสิทธิ์การใช้งาน Workspace ให้กับผู้ใช้งานสำหรับ case private และ department
  // const handleAddAccessRightUser = (userEmail: string) => {
  //   if (editableAccessRights && Array.isArray(editableAccessRights.users)) {
  //     // ค้นหาข้อมูลผู้ใช้งาน
  //     const user = userData.find((u) => u.email === userEmail);
  //     if (!user) return;

  //     // ตรวจสอบว่าผู้ใช้งานมีอยู่ในรายการผู้ใช้งานที่มีสิทธิ์การใช้งานหรือยัง
  //     const userExists = editableAccessRights.users.some(
  //       (u) => u.email === userEmail
  //     );
  //     if (userExists) return;

  //     // เพิ่มผู้ใช้งานด้วยสิทธิ์ Member เป็นค่าเริ่มต้น
  //     const newUser = {
  //       name: user.name,
  //       email: user.email,
  //       role: "Member",
  //     };

  //     setEditableAccessRights({
  //       ...editableAccessRights,
  //       users: [...editableAccessRights.users, newUser],
  //     });
  //     setIsAccessRightsModified(true);
  //   } else if (editableAccessRights && editableAccessRights.users === "all") {
  //     // Convert from "all" to array with this user
  //     const user = userData.find((u) => u.email === userEmail);
  //     if (!user) return;

  //     setEditableAccessRights({
  //       ...editableAccessRights,
  //       users: [
  //         {
  //           name: user.name,
  //           email: user.email,
  //           role: "Member",
  //         },
  //       ],
  //     });
  //     setIsAccessRightsModified(true);
  //   }
  // };

  // ฟังก์ชันสำหรับการ update การเปลี่ยนแปลงสิทธิ์การเข้าถึง
  // const handleUpdateAccessRights = async (): Promise<boolean> => {
  //   try {
  //     if (!workspaceData || !editableAccessRights) return false;

  //     // ส่งข้อมูลที่แก้ไขกลับไปยัง parent component
  //     onUpdateAccessRights(workspaceData.workspaceId, editableAccessRights);

  //     // Close modal and show success message
  //     enqueueSnackbar("บันทึกการเปลี่ยนแปลงสิทธิ์การเข้าถึงสำเร็จ", { variant: "success" });
  //     return true;
  //   } catch (error) {
  //     enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึกสิทธิ์การเข้าถึง", {
  //       variant: "error",
  //     });
  //     return false;
  //   }
  // };

  // Function to remove all users from private access rights
  // const handleRemoveAllAccessRightUsers = () => {
  //   // For the editableAccessRights in the update modal
  //   if (editableAccessRights) {
  //     setEditableAccessRights({
  //       ...editableAccessRights,
  //       users: "all",
  //     });
  //     setIsAccessRightsModified(true);
  //   }
  // };

  // ฟังก์ชันสำหรับการลบผู้ใช้งานที่มีสิทธิ์การใช้งาน สำหรับ case department
  // const handleRemoveAllAccessRightDepartments = (companyName: string) => {
  //   if (editableAccessRights && editableAccessRights.departments !== "all") {
  //     // Create a copy of the current departments
  //     const newDepartments = { ...editableAccessRights.departments };

  //     // Remove the specified company
  //     if (companyName in newDepartments) {
  //       delete newDepartments[companyName];
  //     }

  //     // Check if there are any departments left
  //     setEditableAccessRights({
  //       ...editableAccessRights,
  //       departments:
  //         Object.keys(newDepartments).length > 0 ? newDepartments : "all",
  //     });
  //     setIsAccessRightsModified(true);
  //   }
  // };

  // Helper function to handle selecting departments for a company
  // const handleSelectDepartmentForCompany = (
  //   companyName: string,
  //   selectedDepartments: string[]
  // ) => {
  //   // ตรวจสอบว่ามีการเลือกตัวเลือก "เลือกทั้งหมด" หรือไม่
  //   if (selectedDepartments.includes("SELECT_ALL")) {
  //     // หาบริษัทจาก companyDepartments
  //     const companyData = companyDepartments.find(
  //       (c) => c.name === companyName
  //     );
  //     if (companyData) {
  //       // ถ้าเลือก "เลือกทั้งหมด" จะเพิ่มแผนกทั้งหมดที่ยังไม่ได้เลือก
  //       if (
  //         editableAccessRights &&
  //         editableAccessRights.departments !== "all"
  //       ) {
  //         // หาแผนกที่มีอยู่แล้ว
  //         const existingDepts =
  //           editableAccessRights.departments[companyName] || [];
  //         // หาแผนกที่ยังไม่ได้เลือก
  //         const availableDepts = companyData.departments.filter(
  //           (dept) => !existingDepts.includes(dept)
  //         );

  //         // รวมแผนกทั้งหมด
  //         const allDepts = [...existingDepts, ...availableDepts];

  //         // อัปเดตแผนกทั้งหมด
  //         const updatedDepartments = {
  //           ...editableAccessRights.departments,
  //           [companyName]: allDepts,
  //         };

  //         setEditableAccessRights({
  //           ...editableAccessRights,
  //           departments: updatedDepartments,
  //         });

  //         setIsAccessRightsModified(true);
  //       }

  //       // ล้างค่าที่เลือกในตัวเลือก
  //       setSelectorSelectedDepts((prev) => ({
  //         ...prev,
  //         [companyName]: [],
  //       }));

  //       return;
  //     }
  //   }

  //   // หากเลือกแผนกหรือยกเลิก จะอัพเดต selectorSelectedDepts
  //   setSelectorSelectedDepts((prev) => ({
  //     ...prev,
  //     [companyName]: selectedDepartments,
  //   }));

  //   // ถ้ามี selectedDepartments ที่เลือกใหม่ ให้เพิ่มเข้าไปใน editableAccessRights ทันที
  //   if (editableAccessRights && editableAccessRights.departments !== "all") {
  //     const existingDepts = editableAccessRights.departments[companyName] || [];

  //     // กรองเฉพาะแผนกที่ยังไม่มีในรายการ
  //     const newDepts = selectedDepartments.filter(
  //       (dept) => !existingDepts.includes(dept)
  //     );

  //     if (newDepts.length > 0) {
  //       // เพิ่มแผนกใหม่เข้าไปใน departments
  //       const updatedDepartments = {
  //         ...editableAccessRights.departments,
  //         [companyName]: [...existingDepts, ...newDepts],
  //       };

  //       setEditableAccessRights({
  //         ...editableAccessRights,
  //         departments: updatedDepartments,
  //       });

  //       setIsAccessRightsModified(true);

  //       // Clear selection after adding
  //       setSelectorSelectedDepts((prev) => ({
  //         ...prev,
  //         [companyName]: [],
  //       }));
  //     }
  //   }
  // };

  // function for handle selected users change
  // const handleSelectedUsersChange = (users: AccessUser[] | "all") => {
  //   if (!editableAccessRights) return;

  //   const mappedUsers =
  //     users === "all"
  //       ? "all"
  //       : users.map((u) => ({
  //           name: u.name,
  //           email: u.email,
  //           role: u.role || "Member",
  //         }));

  //   setEditableAccessRights({
  //     ...editableAccessRights,
  //     users: mappedUsers,
  //   });
  //   setIsAccessRightsModified(true);
  // };

  // const handleAccessTypeChange = (
  //   type: "public" | "private" | "department"
  // ) => {
  //   if (!editableAccessRights) return;
  //   // Reset users/departments appropriately when access type changes
  //   const resetUsers = type === "department" || type === "public" ? "all" : editableAccessRights.users;
  //   const resetDepartments = type === "public" || type === "private" ? "all" : editableAccessRights.departments;
  //   setEditableAccessRights({
  //     ...editableAccessRights,
  //     type,
  //     users: resetUsers,
  //     departments: resetDepartments,
  //   });
  //   setIsAccessRightsModified(true);
  // };

  // const handleSelectedDepartmentsChange = (
  //   departments: { [company: string]: string[] } | "all"
  // ) => {
  //   if (!editableAccessRights) return;
  //   setEditableAccessRights({
  //     ...editableAccessRights,
  //     departments,
  //   });
  //   setIsAccessRightsModified(true);
  // };

  // ฟังก์ชันสำหรับการ Update ข้อมูลสิทธิ์การเข้าถึง
  // const renderUpdateAccessRight = () => {
  //   if (!workspaceData || !editableAccessRights) return null;

  //   switch (workspaceData.accessType) {
  //     case "private":
  //       return (
  //         <div className="mt-3">
  //           {/* Add user interface */}
  //           <div className="mb-4">
  //             <Typography.Text className="block mb-1">
  //               เพิ่มรายชื่อผู้มีสิทธิ์การเข้าถึง
  //             </Typography.Text>
  //             <div className="flex gap-2">
  //               <Select
  //                 style={{ width: "100%" }}
  //                 suffixIcon={null}
  //                 prefix={<Mail size={16} color="#C4C4C4" className="mr-1" />}
  //                 placeholder="ค้นหาจากอีเมล"
  //                 showSearch
  //                 value={tempAccessRightUser}
  //                 onChange={setTempAccessRightUser}
  //                 options={userData
  //                   .filter((user) => {
  //                     // Filter out users that are already in the access rights
  //                     if (Array.isArray(editableAccessRights.users)) {
  //                       return !editableAccessRights.users.some(
  //                         (u) => u.email === user.email
  //                       );
  //                     }
  //                     return true;
  //                   })
  //                   .map((user) => ({
  //                     value: user.email,
  //                     label: (
  //                       <div className="flex flex-col">
  //                         <span>{user.email}</span>
  //                         <span className="text-xs text-gray-500">
  //                           {user.name} - {user.department}
  //                         </span>
  //                       </div>
  //                     ),
  //                     searchValue: `${user.email} ${user.name}`,
  //                   }))}
  //                 filterOption={(input, option) =>
  //                   (option?.searchValue || "")
  //                     .toLowerCase()
  //                     .includes(input.toLowerCase())
  //                 }
  //               />
  //               <Button
  //                 type="text"
  //                 className="border border-theme !text-[#0153BD] bg-white min-w-[100px] hover:bg-theme hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
  //                 onClick={() => {
  //                   if (tempAccessRightUser) {
  //                     handleAddAccessRightUser(tempAccessRightUser);
  //                     setTempAccessRightUser(null);
  //                   }
  //                 }}
  //                 disabled={!tempAccessRightUser}
  //               >
  //                 <span className="hidden md:block">เพิ่ม</span>
  //               </Button>
  //             </div>
  //           </div>

  //           {Array.isArray(editableAccessRights.users) ? (
  //             <>
  //               <div className="flex justify-between items-center mb-4">
  //                 <Typography.Text className="text-sm text-[#636363] block">
  //                   รายชื่อผู้มีสิทธิ์เข้าถึงทั้งหมด{" "}
  //                   {editableAccessRights.users.length} รายการ
  //                 </Typography.Text>
  //                 <button
  //                   onClick={handleRemoveAllAccessRightUsers}
  //                   className="text-xs text-[#989898] p-0 flex items-center gap-1 underline"
  //                 >
  //                   ลบทั้งหมด
  //                 </button>
  //               </div>
  //               <div className="space-y-4 max-h-[250px] overflow-y-auto">
  //                 {editableAccessRights.users.map((user, userIndex) => (
  //                   <div
  //                     key={userIndex}
  //                     className="flex items-center justify-between"
  //                   >
  //                     <div className="flex items-center gap-2">
  //                       <UserCircle2 size={20} className="text-gray-400" />
  //                       <div className="flex flex-col">
  //                         <span>{user.name}</span>
  //                         <span className="text-xs text-gray-500">
  //                           {user.email}
  //                         </span>
  //                       </div>
  //                     </div>
  //                     <div className="flex items-center gap-2">
  //                       <Dropdown
  //                         menu={{
  //                           items: roleData.map((role) => ({
  //                             key: role.key,
  //                             label: role.label,
  //                             onClick: () => {
  //                               if (
  //                                 editableAccessRights &&
  //                                 Array.isArray(editableAccessRights.users)
  //                               ) {
  //                                 const newUsers = [
  //                                   ...editableAccessRights.users,
  //                                 ];
  //                                 newUsers[userIndex] = {
  //                                   ...newUsers[userIndex],
  //                                   role: role.label,
  //                                 };
  //                                 setEditableAccessRights({
  //                                   ...editableAccessRights,
  //                                   users: newUsers,
  //                                 });
  //                                 setIsAccessRightsModified(true);
  //                               }
  //                             },
  //                           })),
  //                         }}
  //                         trigger={["click"]}
  //                       >
  //                         <div className="px-2 py-1 border border-[#FAFAFA] rounded-lg text-sm cursor-pointer flex items-center gap-1">
  //                           {user.role}
  //                           <ChevronDown size={16} color="#0153BD" />
  //                         </div>
  //                       </Dropdown>
  //                       <Button
  //                         type="text"
  //                         icon={<Trash size={16} color="#0153BD" />}
  //                         onClick={() => handleRemoveAccessRightUser(userIndex)}
  //                         className="hover:bg-gray-100 border border-[#FAFAFA]"
  //                       />
  //                     </div>
  //                   </div>
  //                 ))}
  //               </div>
  //             </>
  //           ) : (
  //             <div className="mt-3 p-3 bg-gray-50 rounded-lg">
  //               <Typography.Text className="text-sm text-gray-600 block">
  //                 ทุกคนในระบบสามารถเข้าถึง Workspace นี้ได้
  //               </Typography.Text>
  //             </div>
  //           )}
  //         </div>
  //       );

  //     case "department":
  //       return (
  //         <div className="mt-3">
  //           {editableAccessRights.departments === "all" ? (
  //             <div className="p-3 bg-gray-50 rounded-lg">
  //               <Typography.Text className="text-sm text-gray-600 block">
  //                 ทุกแผนกสามารถเข้าถึง Workspace นี้ได้
  //               </Typography.Text>
  //             </div>
  //           ) : (
  //             <>
  //               {/* เพิ่มส่วนการเลือกแผนก */}
  //               <div className="mb-4">
  //                 <Typography.Text className="block mb-1">
  //                   เพิ่มแผนกที่มีสิทธิ์การเข้าถึง
  //                 </Typography.Text>
  //                 <Typography.Text className="block text-sm text-[#636363] mb-3">
  //                   บริษัททั้งหมด {companyDepartments.length} รายการ
  //                 </Typography.Text>
  //                 <div className="space-y-4 max-h-[250px] overflow-y-auto">
  //                   {companyDepartments.map((company) => {
  //                     // Safe access to editableAccessRights which we know is not null here
  //                     // Check if this company already exists in the access rights
  //                     const editableDepts = editableAccessRights?.departments;
  //                     if (!editableDepts || editableDepts === "all") return null;
                      
  //                     const existingDepts = editableDepts[company.name] || [];

  //                     // Filter out departments that are already added
  //                     const availableDepts = company.departments.filter(
  //                       (dept) => !existingDepts.includes(dept)
  //                     );

  //                     // แสดงบริษัทที่มีแผนกที่ถูกเลือกแล้ว หรือยังมีแผนกที่เลือกได้
  //                     const hasSelectedDepts = existingDepts.length > 0;
  //                     const hasAvailableDepts = availableDepts.length > 0;
                      
  //                     if (!hasSelectedDepts && !hasAvailableDepts) {
  //                       return null;
  //                     }

  //                     return (
  //                       <div key={company.name} className="mb-4">
  //                         <div className="mb-2">
  //                           <div className="flex items-center gap-2 mb-2">
  //                             <Building2 size={16} className="text-theme" />
  //                             <Typography.Text strong>
  //                               {company.name}
  //                             </Typography.Text>
  //                           </div>
  //                           <div className="flex gap-2">
  //                             <Select
  //                               mode="multiple"
  //                               style={{ width: "100%" }}
  //                               placeholder={`เลือกแผนกใน ${company.name}`}
  //                               value={
  //                                 selectorSelectedDepts[company.name] || []
  //                               }
  //                               suffixIcon={<ChevronDown size={20} />}
  //                               onChange={(values) =>
  //                                 handleSelectDepartmentForCompany(
  //                                   company.name,
  //                                   values
  //                                 )
  //                               }
  //                               options={[
  //                                 {
  //                                   value: "SELECT_ALL",
  //                                   label: "เลือกทั้งหมด",
  //                                   disabled: availableDepts.length === 0,
  //                                 },
  //                                 ...availableDepts.map((dept) => ({
  //                                   value: dept,
  //                                   label: dept,
  //                                 })),
  //                               ]}
  //                               maxTagCount={3}
  //                               className="w-full"
  //                             />
  //                           </div>
  //                         </div>

  //                         {/* แสดงแผนกที่มีสิทธิ์เข้าถึงแล้วในรูปแบบ pills */}
  //                         {existingDepts.length > 0 && (
  //                           <div className="mt-2">
  //                             <div className="flex flex-wrap gap-2">
  //                               {existingDepts
  //                                 .slice(
  //                                   0,
  //                                   expandedCompanies[company.name] ? undefined : 6
  //                                 )
  //                                 .map((dept, index) => (
  //                                   <div
  //                                     key={index}
  //                                     className="px-2 py-1 bg-[#F0F6FF] rounded-full text-sm flex items-center gap-1"
  //                                   >
  //                                     <span className="text-theme">{dept}</span>
  //                                     <button
  //                                       className="flex items-center justify-center p-0 w-4 h-4 hover:bg-gray-200 rounded-full"
  //                                       onClick={() =>
  //                                         handleRemoveAccessRightDepartment(
  //                                           company.name,
  //                                           dept
  //                                         )
  //                                       }
  //                                     >
  //                                       <X
  //                                         size={20}
  //                                         color="#0153BD"
  //                                         className="font-bold"
  //                                       />
  //                                     </button>
  //                                   </div>
  //                                 ))}
  //                             </div>

  //                             <div className="w-full flex justify-center mt-2">
  //                               {/* แสดงปุ่ม "ดูเพิ่มเติม" เมื่อมีแผนกมากกว่า 6 รายการ */}
  //                               {existingDepts.length > 6 &&
  //                                 !expandedCompanies[company.name] && (
  //                                   <button
  //                                     className="text-xs text-theme p-0 flex items-center gap-1"
  //                                     onClick={() =>
  //                                       setExpandedCompanies((prev) => ({
  //                                         ...prev,
  //                                         [company.name]: true,
  //                                       }))
  //                                     }
  //                                   >
  //                                     <span className="underline">ดูเพิ่มเติม</span>{" "}
  //                                     <ChevronDown size={16} />
  //                                     {/* ( {existingDepts.length - 6} ) */}
  //                                   </button>
  //                                 )}

  //                               {/* แสดงปุ่ม "แสดงน้อยลง" เมื่อขยายการแสดงผล */}
  //                               {expandedCompanies[company.name] && (
  //                                 <button
  //                                   className="text-xs text-theme p-0 flex items-center gap-1"
  //                                   onClick={() =>
  //                                     setExpandedCompanies((prev) => ({
  //                                       ...prev,
  //                                       [company.name]: false,
  //                                     }))
  //                                   }
  //                                 >
  //                                   <span className="underline">ย่อลง</span>{" "}
  //                                   <ChevronUp size={16} />
  //                                 </button>
  //                               )}
  //                             </div>
  //                           </div>
  //                         )}
  //                       </div>
  //                     );
  //                   })}
  //                 </div>
  //               </div>
  //             </>
  //           )}
  //         </div>
  //       );

  //     case "public":
  //     default:
  //       return (
  //         <div className="mt-3 p-3 bg-gray-50 rounded-lg">
  //           <Typography.Text className="text-sm text-gray-600 block">
  //             ทุกคนในระบบสามารถเข้าถึง Workspace นี้ได้
  //           </Typography.Text>
  //         </div>
  //       );
  //   }
  // };

  return (
    <ModalComponent
      titleName="สิทธิ์การเข้าถึง"
      // btnConfirm={isAccessRightsModified ? "บันทึก" : "ปิด"}
      btnConfirm="บันทึก"
      onConfirm={UpdateWorkspaceAccessRights}
      isDisabled={false}
      open={open}
      onClose={onClose}
      modalType="default"
      isLoading={false}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="workspaceName"
            className="text-sm text-gray-700 font-medium block mb-1"
          >
            ชื่อ Workspace
          </label>
          <Input
            id="workspaceName"
            value={workspaceData?.name || ""}
            disabled
            className="w-full"
          />
        </div>
        <div>
          {/* <label
            htmlFor="accessType"
            className="text-sm text-gray-700 font-medium block mb-1"
          >
            สิทธิ์การเข้าถึง
          </label> */}
          {/* <Radio.Group
            value={currentWorkspaceAccess}
            onChange={(e) => setCurrentWorkspaceAccess(e.target.value)}
            disabled
          >
            <Radio value="public">ทุกคน</Radio>
            <Radio value="private">รายบุคคล</Radio>
            <Radio value="department">แผนก</Radio>
          </Radio.Group> */}
          <AccessRight 
            accessType={"private"}
            users={selectedUsers}
            onUsersChange={handleSelectedUsersChange}
            showAccessTypeSelector={false}
            title="สิทธิ์การเข้าถึง"
            addUserText="เพิ่มรายชื่อผู้มีสิทธิ์เป็น Designer"
            AddUserOutside={false}
          />
        </div>
        {/* <div className="space-y-2">{renderUpdateAccessRight()}</div> */}
      </div>
    </ModalComponent>
  );
};

export default AccessRightsModal; 