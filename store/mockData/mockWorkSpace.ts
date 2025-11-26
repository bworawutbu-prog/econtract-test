"use client"
import { Key } from "react";
import { WorkspaceResponseType } from "../types/workSpace";

export interface AccessRights {
  type: "public" | "private" | "department";
  users: "all" | Array<{ name: string; email: string; role: string }>;
  departments: "all" | { [company: string]: string[] };
}

export interface WorkspaceDataType {
  key: Key;
  workSpaceName: string;
  createBy: string;
  editDate: string;
  formCount: number;
  access: string;
  accessRights: AccessRights;
}

export const workspaceData: WorkspaceDataType[] = [
  {
    key: "1",
    workSpaceName: "ประกันสุขภาพกลุ่ม A",
    createBy: "John Doe",
    editDate: "2024-03-14 15:30:00",
    formCount: 5,
    access: "public",
    accessRights: {
      type: "public",
      users: "all",
      departments: "all"
    }
  },
  {
    key: "2",
    workSpaceName: "ประกันอุบัติเหตุกลุ่ม B",
    createBy: "Jane Smith",
    editDate: "2024-03-13 09:45:00",
    formCount: 3,
    access: "private",
    accessRights: {
      type: "private",
      users: [
        { name: "John Doe", email: "john.doe@example.com", role: "Admin" },
        { name: "Jane Smith", email: "jane.smith@example.com", role: "Member" }
      ],
      departments: "all"
    }
  },
  {
    key: "3",
    workSpaceName: "ประกันชีวิตกลุ่ม C",
    createBy: "Bob Wilson",
    editDate: "2024-03-12 14:20:00",
    formCount: 7,
    access: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "INET Plc.": ["Developer Team", "UX/UI Team"],
        "One Geo Survey Co., Ltd.": ["Marketing Team"]
      }
    }
  },
  {
    key: "4",
    workSpaceName: "ประกันสุขภาพพนักงาน",
    createBy: "Alice Brown",
    editDate: "2024-03-11 11:15:00",
    formCount: 4,
    access: "public",
    accessRights: {
      type: "public",
      users: "all",
      departments: "all"
    }
  },
  {
    key: "5",
    workSpaceName: "ประกันอุบัติเหตุนักเรียน",
    createBy: "Charlie Davis",
    editDate: "2024-03-10 16:50:00",
    formCount: 6,
    access: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "INET Plc.": ["HR Team", "Finance Team"],
        "One Geo Survey Co., Ltd.": ["Sales Team"]
      }
    }
  },
  {
    key: "6",
    workSpaceName: "ประกันสุขภาพครอบครัว",
    createBy: "Eva Green",
    editDate: "2024-03-09 13:25:00",
    formCount: 2,
    access: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "INET Plc.": ["Executive Team"]
      }
    }
  },
  {
    key: "7",
    workSpaceName: "ประกันอุบัติเหตุส่วนบุคคล",
    createBy: "Frank Miller",
    editDate: "2024-03-08 10:40:00",
    formCount: 8,
    access: "department",
    accessRights: {
      type: "department",
      users: "all",
      departments: {
        "One Geo Survey Co., Ltd.": ["Product Team", "Development Team"]
      }
    }
  },
];

export const mockWorkspaceData: WorkspaceResponseType[] = [
  {
    _id: "1",
    name: "ประกันสุขภาพกลุ่ม A",
    form_total: "5",
    created_by: "John Doe",
    updated_by: "John Doe",
    created_at: "2024-03-14 15:30:00",
    updated_at: "2024-03-14 15:30:00"
  },
  {
    _id: "2",
    name: "ประกันอุบัติเหตุกลุ่ม B",
    form_total: "3",
    created_by: "Jane Smith",
    updated_by: "Jane Smith",
    created_at: "2024-03-13 09:45:00",
    updated_at: "2024-03-13 09:45:00"
  },
  {
    _id: "3",
    name: "ประกันชีวิตกลุ่ม C",
    form_total: "7",
    created_by: "Bob Wilson",
    updated_by: "Bob Wilson",
    created_at: "2024-03-12 14:20:00",
    updated_at: "2024-03-12 14:20:00"
  },
  {
    _id: "4",
    name: "ประกันสุขภาพพนักงาน",
    form_total: "4",
    created_by: "Alice Brown",
    updated_by: "Alice Brown",
    created_at: "2024-03-11 11:15:00",
    updated_at: "2024-03-11 11:15:00"
  },
  {
    _id: "5",
    name: "ประกันอุบัติเหตุนักเรียน",
    form_total: "6",
    created_by: "Charlie Davis",
    updated_by: "Charlie Davis",
    created_at: "2024-03-10 16:50:00",
    updated_at: "2024-03-10 16:50:00"
  },
]